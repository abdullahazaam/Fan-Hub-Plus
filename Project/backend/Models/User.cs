namespace FanHubPlus.Models;

public class User
{
    public int Id { get; set; }

    // Authentication
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;

    // Role: "Admin" or "User"
    public string Role { get; set; } = "User";

    // Profile
    public string DisplayName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string FavoriteCategory { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // UTC; null means no activity has been recorded yet.
    public DateTime? LastLoginAt { get; set; }
    public DateTime? LastActiveAt { get; set; }

    public bool EmailVerified { get; set; }
    public string? EmailVerificationHash { get; set; }
    public DateTime? EmailVerificationExpiresAt { get; set; }

    // Navigation
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
}
