namespace FanHubPlus.Models;

public class PasswordResetToken
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Only a SHA-256 hash of the actual token is stored in the database.
    // The raw token is generated in-memory, shown once (in Development), and never persisted.
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    // One-time use: once consumed, no further resets with this token
    public bool IsUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
