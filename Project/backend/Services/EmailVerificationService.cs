using System.Security.Cryptography;
using FanHubPlus.Data;
using FanHubPlus.Models;
using Microsoft.EntityFrameworkCore;

namespace FanHubPlus.Services;
public sealed class EmailVerificationService(PasswordResetEmailSender sender, ILogger<EmailVerificationService> logger)
{
    public async Task SendAsync(User user, FanHubDbContext db, CancellationToken ct)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var hash = PasswordHasher.HashToken(token);
        var now = DateTime.UtcNow;
        // Atomic cooldown across concurrent requests and API instances.
        var changed = await db.Users.Where(u => u.Id == user.Id && !u.EmailVerified &&
            (u.EmailVerificationExpiresAt == null || u.EmailVerificationExpiresAt <= now.AddMinutes(29)))
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.EmailVerificationHash, hash)
                .SetProperty(u => u.EmailVerificationExpiresAt, now.AddMinutes(30)), ct);
        if (changed == 0) return;
        try { await sender.SendVerificationAsync(user.Email, token, ct); }
        catch (Exception ex) when (ex is System.Net.Mail.SmtpException or InvalidOperationException or FormatException or OperationCanceledException)
        {
            await db.Users.Where(u => u.Id == user.Id && u.EmailVerificationHash == hash)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.EmailVerificationHash, (string?)null)
                    .SetProperty(u => u.EmailVerificationExpiresAt, (DateTime?)null));
            logger.LogError("Verification email delivery failed ({FailureType}). Check SMTP configuration.", ex.GetType().Name);
        }
    }
}
