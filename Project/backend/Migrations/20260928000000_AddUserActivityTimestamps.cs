using FanHubPlus.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FanHubPlus.Migrations;

[DbContext(typeof(FanHubDbContext))]
[Migration("20260928000000_AddUserActivityTimestamps")]
public class AddUserActivityTimestamps : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(name: "LastLoginAt", table: "Users", type: "datetime2", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "LastActiveAt", table: "Users", type: "datetime2", nullable: true);
        migrationBuilder.CreateIndex(name: "IX_Users_LastActiveAt", table: "Users", column: "LastActiveAt");
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Users_LastActiveAt", table: "Users");
        migrationBuilder.DropColumn(name: "LastActiveAt", table: "Users");
        migrationBuilder.DropColumn(name: "LastLoginAt", table: "Users");
    }
}
