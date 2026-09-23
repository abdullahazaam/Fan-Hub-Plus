using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanHubPlus.Migrations;

/// <inheritdoc />
public partial class InitialFandomContent : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Categories",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                DisplayOrder = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Categories", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "ContentItems",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                CategoryId = table.Column<int>(type: "int", nullable: false),
                Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                FandomUniverse = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                ContentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                ContentText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ThumbnailUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                MediaUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                Author = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Tags = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                PopularityScore = table.Column<int>(type: "int", nullable: false),
                ReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ContentItems", x => x.Id);
                table.ForeignKey(
                    name: "FK_ContentItems_Categories_CategoryId",
                    column: x => x.CategoryId,
                    principalTable: "Categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Categories_Slug",
            table: "Categories",
            column: "Slug",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ContentItems_CategoryId",
            table: "ContentItems",
            column: "CategoryId");

        migrationBuilder.CreateIndex(
            name: "IX_ContentItems_ContentType",
            table: "ContentItems",
            column: "ContentType");

        migrationBuilder.CreateIndex(
            name: "IX_ContentItems_PopularityScore",
            table: "ContentItems",
            column: "PopularityScore");

        migrationBuilder.CreateIndex(
            name: "IX_ContentItems_ReleaseDate",
            table: "ContentItems",
            column: "ReleaseDate");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ContentItems");

        migrationBuilder.DropTable(
            name: "Categories");
    }
}
