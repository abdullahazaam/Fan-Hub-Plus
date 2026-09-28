using FanHubPlus.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
namespace FanHubPlus.Migrations;
[DbContext(typeof(FanHubDbContext))]
[Migration("20260928010000_AddEmailVerification")]
public class AddEmailVerification : Migration
{
 protected override void Up(MigrationBuilder m)
 {
  m.AddColumn<bool>("EmailVerified", "Users", type:"bit", nullable:false, defaultValue:false);
  // Preserve existing accounts; only new registrations require verification.
  m.Sql("UPDATE Users SET EmailVerified = 1");
  m.AddColumn<string>("EmailVerificationHash", "Users", type:"nvarchar(max)", nullable:true);
  m.AddColumn<DateTime>("EmailVerificationExpiresAt", "Users", type:"datetime2", nullable:true);
 }
 protected override void Down(MigrationBuilder m)
 {
  m.DropColumn("EmailVerified", "Users");
  m.DropColumn("EmailVerificationHash", "Users");
  m.DropColumn("EmailVerificationExpiresAt", "Users");
 }
}
