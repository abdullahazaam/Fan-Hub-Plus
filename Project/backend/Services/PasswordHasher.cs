using System.Security.Cryptography;
using System.Text;

namespace FanHubPlus.Services;

/// <summary>
/// Generates cryptographically secure password hashes using PBKDF2-HMAC-SHA256 with a random 128-bit salt.
/// No plaintext passwords are ever stored or returned.
/// </summary>
public static class PasswordHasher
{
    private const int SaltSize = 16;      // 128-bit salt
    private const int HashSize = 32;      // 256-bit output
    private const int Iterations = 100_000;

    /// <summary>
    /// Creates a Base64-encoded salt and a Base64-encoded PBKDF2 hash from the given password.
    /// </summary>
    public static (string Hash, string Salt) Hash(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(SaltSize);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password: Encoding.UTF8.GetBytes(password),
            salt: saltBytes,
            iterations: Iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: HashSize);

        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }

    /// <summary>
    /// Verifies a candidate password against a stored hash and salt.
    /// Uses constant-time comparison to prevent timing attacks.
    /// </summary>
    public static bool Verify(string password, string storedHash, string storedSalt)
    {
        var saltBytes = Convert.FromBase64String(storedSalt);
        var candidateHash = Rfc2898DeriveBytes.Pbkdf2(
            password: Encoding.UTF8.GetBytes(password),
            salt: saltBytes,
            iterations: Iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: HashSize);

        var storedHashBytes = Convert.FromBase64String(storedHash);
        return CryptographicOperations.FixedTimeEquals(candidateHash, storedHashBytes);
    }

    /// <summary>
    /// Computes a SHA-256 hash of an arbitrary token string for safe storage.
    /// The raw token is never stored in the database.
    /// </summary>
    public static string HashToken(string rawToken)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(rawToken);
        var hashBytes = SHA256.HashData(tokenBytes);
        return Convert.ToBase64String(hashBytes);
    }
}
