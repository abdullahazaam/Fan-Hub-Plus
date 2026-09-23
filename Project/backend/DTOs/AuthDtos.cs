namespace FanHubPlus.DTOs;

// ---------- Registration ----------
public record RegisterDto(
    string Username,
    string Email,
    string Password,
    string DisplayName
);

// ---------- Login ----------
public record LoginDto(
    string Email,
    string Password
);

// ---------- Auth Response (returned on login / register) ----------
public record AuthResponseDto(
    string Token,
    string Role,
    int UserId,
    string Email,
    string Username,
    string DisplayName,
    string AvatarUrl
);

// ---------- Forgot Password (request) ----------
public record ForgotPasswordDto(string Email);

// ---------- Reset Password ----------
public record ResetPasswordDto(
    string Token,
    string NewPassword
);

// ---------- User Profile (read) ----------
public record UserProfileDto(
    int Id,
    string Email,
    string Username,
    string Role,
    string DisplayName,
    string Bio,
    string AvatarUrl,
    string FavoriteCategory,
    DateTime CreatedAt
);

// ---------- Update Profile ----------
public record UpdateProfileDto(
    string DisplayName,
    string Bio,
    string AvatarUrl,
    string FavoriteCategory
);
