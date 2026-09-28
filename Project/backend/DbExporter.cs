using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.Data.SqlClient;

namespace FanHubPlus.Exporter
{
    public static class DbExporter
    {
        public static void Run(string connectionString, string outputFile)
        {

            using var conn = new SqlConnection(connectionString);
            conn.Open();

            var sb = new StringBuilder();
            sb.AppendLine("-- =============================================================================");
            sb.AppendLine("-- Fan Hub Plus - Full Database Schema & Data Export for MonsterASP MSSQL");
            sb.AppendLine($"-- Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            sb.AppendLine("-- Target: Pre-created / Existing MonsterASP MSSQL Database");
            sb.AppendLine("-- NOTE: This script is fully idempotent and self-contained.");
            sb.AppendLine("-- It contains NO 'CREATE DATABASE', NO 'USE master/FanHubPlus', and NO credentials.");
            sb.AppendLine("-- =============================================================================");
            sb.AppendLine();
            sb.AppendLine("SET NOCOUNT ON;");
            sb.AppendLine("SET XACT_ABORT ON;");
            sb.AppendLine("GO");
            sb.AppendLine();

            string[] tables = new[]
            {
                "__EFMigrationsHistory",
                "Categories",
                "Users",
                "Characters",
                "ContentItems",
                "EventItems",
                "FanSubmissions",
                "FeedbackItems",
                "MediaItems",
                "MediaRatings",
                "MerchandiseItems",
                "PasswordResetTokens",
                "UpcomingReleases",
                "UserBookmarks"
            };

            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine("-- SECTION 1: TABLES AND CONSTRAINTS (SCHEMA)");
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine();

            foreach (var table in tables)
            {
                sb.AppendLine($"-- Table: [{table}]");
                sb.AppendLine($"IF OBJECT_ID(N'[{table}]', N'U') IS NULL");
                sb.AppendLine("BEGIN");
                sb.AppendLine($"    CREATE TABLE [{table}] (");

                // Columns
                using var colCmd = conn.CreateCommand();
                colCmd.CommandText = @"
SELECT 
    c.name AS ColumnName,
    ty.name AS TypeName,
    c.max_length,
    c.precision,
    c.scale,
    c.is_nullable,
    c.is_identity
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE t.name = @tbl
ORDER BY c.column_id;";
                colCmd.Parameters.AddWithValue("@tbl", table);
                using var colReader = colCmd.ExecuteReader();
                var colList = new List<(string Name, string Type, int MaxLen, byte Prec, byte Scale, bool Nullable, bool Identity)>();
                while (colReader.Read())
                {
                    colList.Add((
                        colReader.GetString(0),
                        colReader.GetString(1),
                        colReader.GetInt16(2),
                        colReader.GetByte(3),
                        colReader.GetByte(4),
                        colReader.GetBoolean(5),
                        colReader.GetBoolean(6)
                    ));
                }
                colReader.Close();

                // PK
                using var pkCmd = conn.CreateCommand();
                pkCmd.CommandText = @"
SELECT c.name AS ColumnName
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID(@tbl) AND i.is_primary_key = 1
ORDER BY ic.key_ordinal;";
                pkCmd.Parameters.AddWithValue("@tbl", table);
                using var pkReader = pkCmd.ExecuteReader();
                var pkCols = new List<string>();
                while (pkReader.Read())
                {
                    pkCols.Add($"[{pkReader.GetString(0)}]");
                }
                pkReader.Close();

                // Defaults
                using var dfCmd = conn.CreateCommand();
                dfCmd.CommandText = @"
SELECT c.name AS ColumnName, dc.definition AS DefaultDefinition
FROM sys.default_constraints dc
INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID(@tbl);";
                dfCmd.Parameters.AddWithValue("@tbl", table);
                using var dfReader = dfCmd.ExecuteReader();
                var defaults = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                while (dfReader.Read())
                {
                    defaults[dfReader.GetString(0)] = dfReader.GetString(1);
                }
                dfReader.Close();

                var colLines = new List<string>();
                foreach (var c in colList)
                {
                    string len = "";
                    if (c.Type == "nvarchar") len = c.MaxLen == -1 ? "(max)" : $"({c.MaxLen / 2})";
                    else if (c.Type == "varchar") len = c.MaxLen == -1 ? "(max)" : $"({c.MaxLen})";
                    else if (c.Type == "decimal") len = $"({c.Prec},{c.Scale})";

                    string fullType = $"{c.Type}{len}";
                    string ident = c.Identity ? " IDENTITY(1,1)" : "";
                    string def = defaults.TryGetValue(c.Name, out var dval) ? $" DEFAULT {dval}" : "";
                    string nullability = c.Nullable ? "NULL" : "NOT NULL";

                    colLines.Add($"        [{c.Name}] {fullType}{ident}{def} {nullability}");
                }

                if (pkCols.Count > 0)
                {
                    colLines.Add($"        CONSTRAINT [PK_{table}] PRIMARY KEY ({string.Join(", ", pkCols)})");
                }

                sb.AppendLine(string.Join(",\r\n", colLines));
                sb.AppendLine("    );");
                sb.AppendLine("END;");
                sb.AppendLine("GO");
                sb.AppendLine();
            }

            // Indexes
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine("-- SECTION 2: INDEXES");
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine();

            using var idxCmd = conn.CreateCommand();
            idxCmd.CommandText = @"
SELECT 
    t.name AS TableName,
    i.name AS IndexName,
    i.is_unique,
    STRING_AGG('[' + c.name + ']' + CASE WHEN ic.is_descending_key = 1 THEN ' DESC' ELSE ' ASC' END, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS KeyColumns
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.type IN (1, 2) AND i.is_primary_key = 0
GROUP BY t.name, i.name, i.is_unique
ORDER BY t.name, i.name;";
            using var idxReader = idxCmd.ExecuteReader();
            while (idxReader.Read())
            {
                string tbl = idxReader.GetString(0);
                string idx = idxReader.GetString(1);
                bool uq = idxReader.GetBoolean(2);
                string cols = idxReader.GetString(3);
                string uqStr = uq ? "UNIQUE " : "";

                sb.AppendLine($"IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[{tbl}]') AND name = N'{idx}')");
                sb.AppendLine("BEGIN");
                sb.AppendLine($"    CREATE {uqStr}INDEX [{idx}] ON [{tbl}] ({cols});");
                sb.AppendLine("END;");
                sb.AppendLine("GO");
            }
            idxReader.Close();
            sb.AppendLine();

            // Foreign Keys
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine("-- SECTION 3: FOREIGN KEYS");
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine();

            using var fkCmd = conn.CreateCommand();
            fkCmd.CommandText = @"
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    STRING_AGG('[' + cp.name + ']', ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS ParentColumns,
    tr.name AS ReferencedTable,
    STRING_AGG('[' + cr.name + ']', ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS ReferencedColumns,
    fk.delete_referential_action_desc AS DeleteAction
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
GROUP BY fk.name, tp.name, tr.name, fk.delete_referential_action_desc
ORDER BY tp.name, fk.name;";
            using var fkReader = fkCmd.ExecuteReader();
            while (fkReader.Read())
            {
                string fkName = fkReader.GetString(0);
                string pTable = fkReader.GetString(1);
                string pCols = fkReader.GetString(2);
                string rTable = fkReader.GetString(3);
                string rCols = fkReader.GetString(4);
                string delAct = fkReader.GetString(5);
                string onDel = delAct switch
                {
                    "CASCADE" => " ON DELETE CASCADE",
                    "SET_NULL" => " ON DELETE SET NULL",
                    "SET_DEFAULT" => " ON DELETE SET DEFAULT",
                    _ => ""
                };

                sb.AppendLine($"IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[{fkName}]') AND parent_object_id = OBJECT_ID(N'[{pTable}]'))");
                sb.AppendLine("BEGIN");
                sb.AppendLine($"    ALTER TABLE [{pTable}] WITH CHECK ADD CONSTRAINT [{fkName}] FOREIGN KEY ({pCols}) REFERENCES [{rTable}] ({rCols}){onDel};");
                sb.AppendLine($"    ALTER TABLE [{pTable}] CHECK CONSTRAINT [{fkName}];");
                sb.AppendLine("END;");
                sb.AppendLine("GO");
            }
            fkReader.Close();
            sb.AppendLine();

            // Data Insertion
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine("-- SECTION 4: TABLE DATA INSERTION");
            sb.AppendLine("-- -----------------------------------------------------------------------------");
            sb.AppendLine();

            string[] dataTables = new[]
            {
                "__EFMigrationsHistory",
                "Categories",
                "Users",
                "Characters",
                "ContentItems",
                "EventItems",
                "FanSubmissions",
                "FeedbackItems",
                "MediaItems",
                "MerchandiseItems",
                "UpcomingReleases",
                "MediaRatings",
                "PasswordResetTokens",
                "UserBookmarks"
            };

            foreach (var tbl in dataTables)
            {
                using var tColCmd = conn.CreateCommand();
                tColCmd.CommandText = @"
SELECT c.name, ty.name, c.is_identity
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE t.name = @tbl
ORDER BY c.column_id;";
                tColCmd.Parameters.AddWithValue("@tbl", tbl);
                using var tColReader = tColCmd.ExecuteReader();
                var cols = new List<(string Name, string Type, bool IsIdentity)>();
                while (tColReader.Read())
                {
                    cols.Add((tColReader.GetString(0), tColReader.GetString(1), tColReader.GetBoolean(2)));
                }
                tColReader.Close();

                bool hasIdentity = cols.Any(c => c.IsIdentity);
                string colListStr = string.Join(", ", cols.Select(c => $"[{c.Name}]"));

                using var dataCmd = conn.CreateCommand();
                dataCmd.CommandText = $"SELECT * FROM [{tbl}]";
                if (hasIdentity) dataCmd.CommandText += " ORDER BY [Id]";

                using var da = new SqlDataAdapter(dataCmd);
                var dt = new DataTable();
                da.Fill(dt);

                sb.AppendLine($"-- Data: [{tbl}] ({dt.Rows.Count} rows)");
                if (dt.Rows.Count == 0)
                {
                    sb.AppendLine("-- (No rows to insert)");
                    sb.AppendLine();
                    continue;
                }

                sb.AppendLine($"IF NOT EXISTS (SELECT 1 FROM [{tbl}])");
                sb.AppendLine("BEGIN");
                if (hasIdentity) sb.AppendLine($"    SET IDENTITY_INSERT [{tbl}] ON;");

                int chunkSize = 40;
                for (int i = 0; i < dt.Rows.Count; i += chunkSize)
                {
                    int take = Math.Min(chunkSize, dt.Rows.Count - i);
                    sb.AppendLine($"    INSERT INTO [{tbl}] ({colListStr}) VALUES");
                    var valLines = new List<string>();

                    for (int j = 0; j < take; j++)
                    {
                        var row = dt.Rows[i + j];
                        var rowVals = new List<string>();

                        foreach (var c in cols)
                        {
                            object val = row[c.Name];
                            rowVals.Add(FormatSqlValue(val, c.Type));
                        }

                        valLines.Add($"    ({string.Join(", ", rowVals)})");
                    }

                    sb.AppendLine(string.Join(",\r\n", valLines) + ";");
                }

                if (hasIdentity) sb.AppendLine($"    SET IDENTITY_INSERT [{tbl}] OFF;");
                sb.AppendLine("END;");
                sb.AppendLine("GO");
                sb.AppendLine();
            }

            File.WriteAllText(outputFile, sb.ToString(), Encoding.UTF8);
            Console.WriteLine($"Successfully generated {outputFile} ({new FileInfo(outputFile).Length} bytes).");
        }

        static string FormatSqlValue(object val, string type)
        {
            if (val == null || val == DBNull.Value) return "NULL";

            switch (type.ToLowerInvariant())
            {
                case "bit":
                    if (val is bool b) return b ? "1" : "0";
                    return Convert.ToInt32(val) == 1 ? "1" : "0";

                case "int":
                case "bigint":
                case "smallint":
                case "tinyint":
                    return val.ToString()!;

                case "decimal":
                case "numeric":
                case "float":
                case "real":
                    return Convert.ToString(val, System.Globalization.CultureInfo.InvariantCulture)!;

                case "datetime":
                case "datetime2":
                case "smalldatetime":
                case "date":
                    if (val is DateTime dt)
                    {
                        return $"'{dt:yyyy-MM-dd HH:mm:ss.ffffff}'";
                    }
                    return $"'{val}'";

                default:
                    string s = val.ToString()!;
                    string escaped = s.Replace("'", "''");
                    return $"N'{escaped}'";
            }
        }
    }
}
