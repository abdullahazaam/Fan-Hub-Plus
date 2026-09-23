using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanHubPlus.Models;
using Microsoft.IdentityModel.Tokens;

namespace FanHubPlus.Services;

/// <summary>
/// Issues and validates JWT tokens.
/// The signing key MUST be provided via the FAN_HUB_JWT_KEY environment variable.
/// The application will refuse to start if the variable is absent or too short.
/// </summary>
public class TokenService
{
    private readonly SymmetricSecurityKey _key;
    private readonly string _issuer;
    private readonly string _audience;

    public TokenService(IConfiguration configuration)
    {
        var raw = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT signing key is missing. " +
                "Set the FAN_HUB_JWT_KEY environment variable (minimum 32 characters). " +
                "Example: $env:FAN_HUB_JWT_KEY='your-32-char-secret-here'");

        if (raw.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT signing key must be at least 32 characters. " +
                $"Current FAN_HUB_JWT_KEY length: {raw.Length} characters.");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(raw));
        _issuer = configuration["Jwt:Issuer"] ?? "FanHubPlus";
        _audience = configuration["Jwt:Audience"] ?? "FanHubPlusClients";
    }

    /// <summary>Issues a signed JWT with user identity claims. Expiry: 8 hours.</summary>
    public string IssueToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("name", user.DisplayName.Length > 0 ? user.DisplayName : user.Username),
            new Claim("username", user.Username)
        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>Validates a JWT string. Returns a ClaimsPrincipal on success, null on failure.</summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _key
            }, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }
}
