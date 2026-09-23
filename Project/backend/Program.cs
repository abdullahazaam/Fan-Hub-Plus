using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using FanHubPlus.Data;
using FanHubPlus.DTOs;
using FanHubPlus.Models;
using FanHubPlus.Services;
using Microsoft.EntityFrameworkCore;

// ─────────────────────────────────────────────────────────────────────────────
// Custom assembly resolver for local runtime assemblies (offline lib/ folder)
// ─────────────────────────────────────────────────────────────────────────────
AppDomain.CurrentDomain.AssemblyResolve += (sender, args) =>
{
    var assemblyName = new System.Reflection.AssemblyName(args.Name).Name + ".dll";
    var assemblyPath = Path.Combine(AppContext.BaseDirectory, assemblyName);
    return File.Exists(assemblyPath) ? System.Reflection.Assembly.LoadFrom(assemblyPath) : null;
};

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────────────────────
// Validate that JWT signing key is present in configuration before startup.
// Key is read from the FAN_HUB_JWT_KEY environment variable (mapped below).
// Startup is intentionally aborted if the key is missing or too short.
// ─────────────────────────────────────────────────────────────────────────────
var jwtKey = Environment.GetEnvironmentVariable("FAN_HUB_JWT_KEY")
    ?? builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.Error.WriteLine(
        "STARTUP FAILED: JWT signing key is missing or too short (minimum 32 characters).\n" +
        "Set the FAN_HUB_JWT_KEY environment variable before starting the server.\n" +
        "Example (PowerShell): $env:FAN_HUB_JWT_KEY='<YourSecureRandomKeyAtLeast32Chars>'\n" +
        "Example (cmd):        set FAN_HUB_JWT_KEY=<YourSecureRandomKeyAtLeast32Chars>");
    Console.ResetColor();
    return;
}

// Override config so TokenService can read it uniformly
builder.Configuration["Jwt:Key"] = jwtKey;

// ─────────────────────────────────────────────────────────────────────────────
// Service Registration
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<FanHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddSingleton<TokenService>();

var app = builder.Build();

// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate limiting stores (per-IP sliding window)
// ─────────────────────────────────────────────────────────────────────────────
var loginRateStore = new ConcurrentDictionary<string, (int Count, DateTime WindowStart)>();
var forgotRateStore = new ConcurrentDictionary<string, (int Count, DateTime WindowStart)>();

bool IsRateLimited(
    ConcurrentDictionary<string, (int Count, DateTime WindowStart)> store,
    string key,
    int windowSeconds,
    int maxRequests)
{
    var now = DateTime.UtcNow;
    var entry = store.GetOrAdd(key, _ => (0, now));

    if ((now - entry.WindowStart).TotalSeconds >= windowSeconds)
    {
        // Reset window
        entry = (1, now);
        store[key] = entry;
        return false;
    }

    if (entry.Count >= maxRequests)
        return true;

    store[key] = (entry.Count + 1, entry.WindowStart);
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Bearer middleware (manual, since Microsoft.AspNetCore.Authentication.JwtBearer
// is not present in the local offline lib/ folder)
// ─────────────────────────────────────────────────────────────────────────────
app.UseCors("AllowFrontend");

// Custom JWT bearer extraction middleware — attaches ClaimsPrincipal to HttpContext
app.Use(async (ctx, next) =>
{
    var authHeader = ctx.Request.Headers.Authorization.ToString();
    if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        var rawToken = authHeader["Bearer ".Length..].Trim();
        var tokenService = ctx.RequestServices.GetRequiredService<TokenService>();
        var principal = tokenService.ValidateToken(rawToken);
        if (principal is not null)
        {
            ctx.User = principal;
        }
    }
    await next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract authenticated user ID and role from ClaimsPrincipal
// ─────────────────────────────────────────────────────────────────────────────
static (bool isAuth, int userId, string role) GetAuthInfo(ClaimsPrincipal user)
{
    if (user?.Identity?.IsAuthenticated != true)
        return (false, 0, string.Empty);

    var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? user.FindFirstValue("sub");

    if (!int.TryParse(sub, out var uid))
        return (false, 0, string.Empty);

    var role = user.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    return (true, uid, role);
}

// ─────────────────────────────────────────────────────────────────────────────
// Database Initialization
// ─────────────────────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<FanHubDbContext>();
        var isDev = app.Environment.IsDevelopment();
        DbInitializer.Initialize(db, isDev);
        logger.LogInformation("Fan Hub Plus database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database initialization/seeding.");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "Fan Hub Plus Web API",
    database = "SQL Server Connected",
    timestamp = DateTime.UtcNow,
    version = "1.2.0"
}));

// ─────────────────────────────────────────────────────────────────────────────
// Categories (public read)
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/categories", async (FanHubDbContext db) =>
{
    var categories = await db.Categories
        .OrderBy(c => c.DisplayOrder)
        .Select(c => new
        {
            c.Id,
            c.Name,
            c.Slug,
            c.Description,
            c.Icon,
            c.DisplayOrder,
            ItemCount = c.ContentItems.Count
        })
        .ToListAsync();

    return Results.Ok(categories);
});

// ─────────────────────────────────────────────────────────────────────────────
// Content Listing – public read
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/content", async (
    FanHubDbContext db,
    string? search,
    int? categoryId,
    string? contentType,
    string? genre,
    int? releaseYear,
    int? minPopularity,
    string? sortBy,
    int page = 1,
    int pageSize = 12) =>
{
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 50) pageSize = 12;

    var query = db.ContentItems.Include(c => c.Category).AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = search.Trim().ToLower();
        query = query.Where(c =>
            c.Title.ToLower().Contains(term) ||
            c.FandomUniverse.ToLower().Contains(term) ||
            c.Description.ToLower().Contains(term) ||
            c.Tags.ToLower().Contains(term));
    }

    if (categoryId.HasValue && categoryId.Value > 0)
        query = query.Where(c => c.CategoryId == categoryId.Value);

    if (!string.IsNullOrWhiteSpace(contentType) && !contentType.Equals("all", StringComparison.OrdinalIgnoreCase))
        query = query.Where(c => c.ContentType.ToLower() == contentType.ToLower());

    if (!string.IsNullOrWhiteSpace(genre) && !genre.Equals("all", StringComparison.OrdinalIgnoreCase))
    {
        var genreTerm = genre.Trim().ToLower();
        query = query.Where(c => c.Tags.ToLower().Contains(genreTerm));
    }

    if (releaseYear.HasValue && releaseYear.Value > 1900)
    {
        query = query.Where(c => c.ReleaseDate.Year == releaseYear.Value);
    }

    if (minPopularity.HasValue && minPopularity.Value > 0)
    {
        query = query.Where(c => c.PopularityScore >= minPopularity.Value);
    }

    query = sortBy?.ToLower() switch
    {
        "latest" => query.OrderByDescending(c => c.ReleaseDate).ThenByDescending(c => c.Id),
        "title"  => query.OrderBy(c => c.Title),
        _        => query.OrderByDescending(c => c.PopularityScore).ThenByDescending(c => c.Id)
    };

    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new ContentResponseDto(
            c.Id, c.CategoryId,
            c.Category != null ? c.Category.Name : string.Empty,
            c.Category != null ? c.Category.Slug : string.Empty,
            c.Title, c.FandomUniverse, c.ContentType,
            c.Description, c.ContentText, c.ThumbnailUrl, c.MediaUrl,
            c.Author, c.Tags, c.PopularityScore,
            c.ReleaseDate, c.CreatedAt, c.UpdatedAt))
        .ToListAsync();

    return Results.Ok(new PagedResult<ContentResponseDto>(items, totalCount, page, pageSize));
});

// ─────────────────────────────────────────────────────────────────────────────
// Content Detail – public read
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/content/{id:int}", async (FanHubDbContext db, int id) =>
{
    var item = await db.ContentItems.Include(c => c.Category)
        .FirstOrDefaultAsync(c => c.Id == id);

    if (item is null)
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });

    return Results.Ok(new ContentResponseDto(
        item.Id, item.CategoryId,
        item.Category?.Name ?? string.Empty,
        item.Category?.Slug ?? string.Empty,
        item.Title, item.FandomUniverse, item.ContentType,
        item.Description, item.ContentText, item.ThumbnailUrl, item.MediaUrl,
        item.Author, item.Tags, item.PopularityScore,
        item.ReleaseDate, item.CreatedAt, item.UpdatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Create Content – REQUIRES Admin role (enforced by API)
// ─────────────────────────────────────────────────────────────────────────────
app.MapPost("/api/content", async (HttpContext ctx, FanHubDbContext db, CreateContentDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required." });

    var categoryExists = await db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
        return Results.BadRequest(new { message = "Invalid CategoryId specified." });

    var item = new ContentItem
    {
        CategoryId = dto.CategoryId,
        Title = dto.Title.Trim(),
        FandomUniverse = string.IsNullOrWhiteSpace(dto.FandomUniverse) ? "Original Universe" : dto.FandomUniverse.Trim(),
        ContentType = string.IsNullOrWhiteSpace(dto.ContentType) ? "Article" : dto.ContentType.Trim(),
        Description = dto.Description.Trim(),
        ContentText = dto.ContentText.Trim(),
        ThumbnailUrl = string.IsNullOrWhiteSpace(dto.ThumbnailUrl)
            ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80"
            : dto.ThumbnailUrl.Trim(),
        MediaUrl = string.IsNullOrWhiteSpace(dto.MediaUrl) ? dto.ThumbnailUrl : dto.MediaUrl.Trim(),
        Author = string.IsNullOrWhiteSpace(dto.Author) ? "Fan Hub Curator" : dto.Author.Trim(),
        Tags = dto.Tags.Trim(),
        PopularityScore = dto.PopularityScore > 0 ? dto.PopularityScore : 85,
        ReleaseDate = dto.ReleaseDate ?? DateTime.UtcNow,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    db.ContentItems.Add(item);
    await db.SaveChangesAsync();
    await db.Entry(item).Reference(c => c.Category).LoadAsync();

    return Results.Created($"/api/content/{item.Id}", new ContentResponseDto(
        item.Id, item.CategoryId,
        item.Category?.Name ?? string.Empty, item.Category?.Slug ?? string.Empty,
        item.Title, item.FandomUniverse, item.ContentType,
        item.Description, item.ContentText, item.ThumbnailUrl, item.MediaUrl,
        item.Author, item.Tags, item.PopularityScore,
        item.ReleaseDate, item.CreatedAt, item.UpdatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Update Content – REQUIRES Admin role (enforced by API)
// ─────────────────────────────────────────────────────────────────────────────
app.MapPut("/api/content/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id, UpdateContentDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var item = await db.ContentItems.Include(c => c.Category)
        .FirstOrDefaultAsync(c => c.Id == id);
    if (item is null)
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });

    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { message = "Title is required." });

    var categoryExists = await db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
        return Results.BadRequest(new { message = "Invalid CategoryId specified." });

    item.CategoryId = dto.CategoryId;
    item.Title = dto.Title.Trim();
    item.FandomUniverse = dto.FandomUniverse.Trim();
    item.ContentType = dto.ContentType.Trim();
    item.Description = dto.Description.Trim();
    item.ContentText = dto.ContentText.Trim();
    item.ThumbnailUrl = dto.ThumbnailUrl.Trim();
    item.MediaUrl = dto.MediaUrl.Trim();
    item.Author = dto.Author.Trim();
    item.Tags = dto.Tags.Trim();
    item.PopularityScore = dto.PopularityScore;
    if (dto.ReleaseDate.HasValue) item.ReleaseDate = dto.ReleaseDate.Value;
    item.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    await db.Entry(item).Reference(c => c.Category).LoadAsync();

    return Results.Ok(new ContentResponseDto(
        item.Id, item.CategoryId,
        item.Category?.Name ?? string.Empty, item.Category?.Slug ?? string.Empty,
        item.Title, item.FandomUniverse, item.ContentType,
        item.Description, item.ContentText, item.ThumbnailUrl, item.MediaUrl,
        item.Author, item.Tags, item.PopularityScore,
        item.ReleaseDate, item.CreatedAt, item.UpdatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Delete Content – REQUIRES Admin role (enforced by API)
// ─────────────────────────────────────────────────────────────────────────────
app.MapDelete("/api/content/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var item = await db.ContentItems.FindAsync(id);
    if (item is null)
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });

    db.ContentItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth: Register
// ─────────────────────────────────────────────────────────────────────────────
app.MapPost("/api/auth/register", async (FanHubDbContext db, TokenService tokens, RegisterDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password)
        || string.IsNullOrWhiteSpace(dto.Username))
        return Results.BadRequest(new { message = "Email, username, and password are required." });

    if (dto.Password.Length < 8)
        return Results.BadRequest(new { message = "Password must be at least 8 characters." });

    var normalizedEmail = dto.Email.Trim().ToUpper();
    var normalizedUsername = dto.Username.Trim().ToLower();

    if (await db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
        return Results.Conflict(new { message = "An account with this email already exists." });

    if (await db.Users.AnyAsync(u => u.Username == normalizedUsername))
        return Results.Conflict(new { message = "This username is already taken." });

    var (hash, salt) = PasswordHasher.Hash(dto.Password);
    var user = new User
    {
        Email = dto.Email.Trim(),
        NormalizedEmail = normalizedEmail,
        Username = normalizedUsername,
        PasswordHash = hash,
        PasswordSalt = salt,
        Role = "User",
        DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? normalizedUsername : dto.DisplayName.Trim(),
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    var token = tokens.IssueToken(user);
    return Results.Created("/api/auth/me", new AuthResponseDto(
        token, user.Role, user.Id, user.Email,
        user.Username, user.DisplayName, user.AvatarUrl));
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth: Login (rate-limited)
// ─────────────────────────────────────────────────────────────────────────────
app.MapPost("/api/auth/login", async (HttpContext ctx, FanHubDbContext db, TokenService tokens, LoginDto dto) =>
{
    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var windowSec = int.Parse(builder.Configuration["RateLimit:LoginWindowSeconds"] ?? "60");
    var maxReq = int.Parse(builder.Configuration["RateLimit:LoginMaxRequests"] ?? "10");

    if (IsRateLimited(loginRateStore, ip, windowSec, maxReq))
        return Results.Json(new { message = "Too many login attempts. Please wait and try again." },
            statusCode: 429);

    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest(new { message = "Email and password are required." });

    var normalizedEmail = dto.Email.Trim().ToUpper();
    var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

    // Always run password check to prevent user enumeration via timing
    var passwordValid = user is not null &&
        PasswordHasher.Verify(dto.Password, user.PasswordHash, user.PasswordSalt);

    if (!passwordValid)
        return Results.Unauthorized();

    var token = tokens.IssueToken(user!);
    return Results.Ok(new AuthResponseDto(
        token, user!.Role, user.Id, user.Email,
        user.Username, user.DisplayName, user.AvatarUrl));
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth: Me – returns current user info from JWT
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/auth/me", async (HttpContext ctx, FanHubDbContext db) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var user = await db.Users.FindAsync(userId);
    if (user is null) return Results.NotFound();

    return Results.Ok(new UserProfileDto(
        user.Id, user.Email, user.Username, user.Role,
        user.DisplayName, user.Bio, user.AvatarUrl,
        user.FavoriteCategory, user.CreatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth: Forgot Password (rate-limited)
// 
// SECURITY CONTRACT:
//   - Always returns the same public response whether the email exists or not
//     (prevents user enumeration).
//   - Only the SHA-256 hash of the reset token is stored in SQL Server.
//   - The raw token is ONLY included in the response when ASPNETCORE_ENVIRONMENT
//     is "Development". It is never included in Production.
// ─────────────────────────────────────────────────────────────────────────────
app.MapPost("/api/auth/forgot-password", async (HttpContext ctx, FanHubDbContext db, ForgotPasswordDto dto, IWebHostEnvironment env, ILogger<Program> logger) =>
{
    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var windowSec = int.Parse(builder.Configuration["RateLimit:ForgotPasswordWindowSeconds"] ?? "300");
    var maxReq = int.Parse(builder.Configuration["RateLimit:ForgotPasswordMaxRequests"] ?? "5");

    if (IsRateLimited(forgotRateStore, ip, windowSec, maxReq))
        return Results.Json(new { message = "Too many requests. Please wait before requesting another reset." },
            statusCode: 429);

    // Standard (always-identical) public response — prevents email enumeration
    object publicResponse = new
    {
        message = "If an account with that email exists, a password reset token has been generated. " +
                  "Check the console (Development only) or contact your administrator."
    };

    if (string.IsNullOrWhiteSpace(dto.Email))
        return Results.Ok(publicResponse);

    var normalizedEmail = dto.Email.Trim().ToUpper();
    var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

    if (user is null)
        return Results.Ok(publicResponse); // Do not reveal whether email exists

    // Generate a cryptographically secure raw token (never stored)
    var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    var tokenHash = PasswordHasher.HashToken(rawToken);
    var expiresAt = DateTime.UtcNow.AddMinutes(30);

    // Invalidate any prior unused tokens for this user
    var oldTokens = await db.PasswordResetTokens
        .Where(t => t.UserId == user.Id && !t.IsUsed)
        .ToListAsync();
    foreach (var old in oldTokens) old.IsUsed = true;

    db.PasswordResetTokens.Add(new PasswordResetToken
    {
        UserId = user.Id,
        TokenHash = tokenHash,
        ExpiresAt = expiresAt,
        IsUsed = false,
        CreatedAt = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    // In Development: log the raw token to console and include it in the response
    // to facilitate local testing without an email server.
    // This code path is NEVER reached in Production.
    if (env.IsDevelopment())
    {
        logger.LogWarning(
            "[DEV-ONLY] Password reset token for {Email}: {Token} (expires at {Expires} UTC). " +
            "This token is NOT emailed in development; copy it from here or from the API response.",
            user.Email, rawToken, expiresAt.ToString("o"));

        return Results.Ok(new
        {
            message = "If an account with that email exists, a password reset token has been generated. " +
                      "Check the console (Development only) or contact your administrator.",
            // ── LOCAL DEV CONVENIENCE ─────────────────────────────────────────
            // devNotice and devResetToken are ONLY present in Development builds.
            // They are absent from the response in any non-Development environment.
            // ─────────────────────────────────────────────────────────────────
            devNotice = "[DEVELOPMENT ONLY] Raw reset token shown here for local testing. " +
                        "In production this field will not be present and tokens are delivered by email.",
            devResetToken = rawToken,
            devExpiresAt = expiresAt
        });
    }

    return Results.Ok(publicResponse);
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth: Reset Password
// Enforces: valid token hash match, expiry, one-time use
// ─────────────────────────────────────────────────────────────────────────────
app.MapPost("/api/auth/reset-password", async (FanHubDbContext db, ResetPasswordDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
        return Results.BadRequest(new { message = "Token and new password are required." });

    if (dto.NewPassword.Length < 8)
        return Results.BadRequest(new { message = "New password must be at least 8 characters." });

    var tokenHash = PasswordHasher.HashToken(dto.Token);

    var resetEntry = await db.PasswordResetTokens
        .Include(t => t.User)
        .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

    if (resetEntry is null || resetEntry.IsUsed)
        return Results.BadRequest(new { message = "Invalid or already-used reset token." });

    if (resetEntry.ExpiresAt < DateTime.UtcNow)
        return Results.BadRequest(new { message = "This reset token has expired. Please request a new one." });

    // Invalidate the token (one-time use)
    resetEntry.IsUsed = true;

    // Update password with new PBKDF2 hash
    var (newHash, newSalt) = PasswordHasher.Hash(dto.NewPassword);
    resetEntry.User.PasswordHash = newHash;
    resetEntry.User.PasswordSalt = newSalt;
    resetEntry.User.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Password has been reset successfully. You may now sign in." });
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile: Get (authenticated)
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/profile", async (HttpContext ctx, FanHubDbContext db) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var user = await db.Users.FindAsync(userId);
    if (user is null) return Results.NotFound();

    return Results.Ok(new UserProfileDto(
        user.Id, user.Email, user.Username, user.Role,
        user.DisplayName, user.Bio, user.AvatarUrl,
        user.FavoriteCategory, user.CreatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile: Update (authenticated)
// ─────────────────────────────────────────────────────────────────────────────
app.MapPut("/api/profile", async (HttpContext ctx, FanHubDbContext db, UpdateProfileDto dto) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var user = await db.Users.FindAsync(userId);
    if (user is null) return Results.NotFound();

    user.DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? user.DisplayName : dto.DisplayName.Trim();
    user.Bio = dto.Bio?.Trim() ?? string.Empty;
    user.AvatarUrl = dto.AvatarUrl?.Trim() ?? string.Empty;
    user.FavoriteCategory = dto.FavoriteCategory?.Trim() ?? string.Empty;
    user.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(new UserProfileDto(
        user.Id, user.Email, user.Username, user.Role,
        user.DisplayName, user.Bio, user.AvatarUrl,
        user.FavoriteCategory, user.CreatedAt));
});

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTERS: Public Browse & Detail
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/characters", async (
    FanHubDbContext db,
    string? search,
    int? categoryId,
    string? sortBy,
    int page = 1,
    int pageSize = 12) =>
{
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 50) pageSize = 12;

    var query = db.Characters.Include(c => c.Category).AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = search.Trim().ToLower();
        query = query.Where(c =>
            c.Name.ToLower().Contains(term) ||
            c.FandomUniverse.ToLower().Contains(term) ||
            c.RoleTitle.ToLower().Contains(term) ||
            c.Bio.ToLower().Contains(term) ||
            c.Abilities.ToLower().Contains(term));
    }

    if (categoryId.HasValue && categoryId.Value > 0)
        query = query.Where(c => c.CategoryId == categoryId.Value);

    query = sortBy?.ToLower() switch
    {
        "name"   => query.OrderBy(c => c.Name),
        "latest" => query.OrderByDescending(c => c.CreatedAt),
        _        => query.OrderByDescending(c => c.PopularityScore)
    };

    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new CharacterDto(
            c.Id, c.CategoryId, c.Category != null ? c.Category.Name : string.Empty,
            c.Name, c.FandomUniverse, c.RoleTitle, c.Bio, c.Abilities, c.Backstory,
            c.AvatarUrl, c.BannerUrl, c.OriginUniverse, c.VoiceActor, c.PopularityScore,
            c.CreatedAt, c.UpdatedAt))
        .ToListAsync();

    return Results.Ok(new PagedResult<CharacterDto>(items, totalCount, page, pageSize));
});

app.MapGet("/api/characters/{id:int}", async (FanHubDbContext db, int id) =>
{
    var c = await db.Characters.Include(ch => ch.Category).FirstOrDefaultAsync(ch => ch.Id == id);
    if (c is null) return Results.NotFound(new { message = $"Character {id} not found." });

    return Results.Ok(new CharacterDto(
        c.Id, c.CategoryId, c.Category?.Name ?? string.Empty,
        c.Name, c.FandomUniverse, c.RoleTitle, c.Bio, c.Abilities, c.Backstory,
        c.AvatarUrl, c.BannerUrl, c.OriginUniverse, c.VoiceActor, c.PopularityScore,
        c.CreatedAt, c.UpdatedAt));
});

// Admin Character CRUD
app.MapPost("/api/characters", async (HttpContext ctx, FanHubDbContext db, UpsertCharacterDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    if (string.IsNullOrWhiteSpace(dto.Name))
        return Results.BadRequest(new { message = "Character name is required." });

    var character = new Character
    {
        CategoryId = dto.CategoryId,
        Name = dto.Name.Trim(),
        FandomUniverse = dto.FandomUniverse.Trim(),
        RoleTitle = dto.RoleTitle.Trim(),
        Bio = dto.Bio.Trim(),
        Abilities = dto.Abilities.Trim(),
        Backstory = dto.Backstory.Trim(),
        AvatarUrl = string.IsNullOrWhiteSpace(dto.AvatarUrl) ? "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80" : dto.AvatarUrl.Trim(),
        BannerUrl = string.IsNullOrWhiteSpace(dto.BannerUrl) ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80" : dto.BannerUrl.Trim(),
        OriginUniverse = dto.OriginUniverse.Trim(),
        VoiceActor = dto.VoiceActor.Trim(),
        PopularityScore = dto.PopularityScore > 0 ? dto.PopularityScore : 90,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    db.Characters.Add(character);
    await db.SaveChangesAsync();
    await db.Entry(character).Reference(c => c.Category).LoadAsync();

    return Results.Created($"/api/characters/{character.Id}", new CharacterDto(
        character.Id, character.CategoryId, character.Category?.Name ?? string.Empty,
        character.Name, character.FandomUniverse, character.RoleTitle, character.Bio,
        character.Abilities, character.Backstory, character.AvatarUrl, character.BannerUrl,
        character.OriginUniverse, character.VoiceActor, character.PopularityScore,
        character.CreatedAt, character.UpdatedAt));
});

app.MapPut("/api/characters/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id, UpsertCharacterDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var character = await db.Characters.Include(c => c.Category).FirstOrDefaultAsync(c => c.Id == id);
    if (character is null) return Results.NotFound(new { message = $"Character {id} not found." });

    character.CategoryId = dto.CategoryId;
    character.Name = dto.Name.Trim();
    character.FandomUniverse = dto.FandomUniverse.Trim();
    character.RoleTitle = dto.RoleTitle.Trim();
    character.Bio = dto.Bio.Trim();
    character.Abilities = dto.Abilities.Trim();
    character.Backstory = dto.Backstory.Trim();
    character.AvatarUrl = dto.AvatarUrl.Trim();
    character.BannerUrl = dto.BannerUrl.Trim();
    character.OriginUniverse = dto.OriginUniverse.Trim();
    character.VoiceActor = dto.VoiceActor.Trim();
    character.PopularityScore = dto.PopularityScore;
    character.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    await db.Entry(character).Reference(c => c.Category).LoadAsync();

    return Results.Ok(new CharacterDto(
        character.Id, character.CategoryId, character.Category?.Name ?? string.Empty,
        character.Name, character.FandomUniverse, character.RoleTitle, character.Bio,
        character.Abilities, character.Backstory, character.AvatarUrl, character.BannerUrl,
        character.OriginUniverse, character.VoiceActor, character.PopularityScore,
        character.CreatedAt, character.UpdatedAt));
});

app.MapDelete("/api/characters/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var character = await db.Characters.FindAsync(id);
    if (character is null) return Results.NotFound(new { message = $"Character {id} not found." });

    db.Characters.Remove(character);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ─────────────────────────────────────────────────────────────────────────────
// MULTIMEDIA: Videos, Trailers, Audio, and User Ratings
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/media", async (
    HttpContext ctx,
    FanHubDbContext db,
    string? mediaType,
    int? categoryId,
    string? search,
    int page = 1,
    int pageSize = 12) =>
{
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 50) pageSize = 12;

    var (isAuth, currentUserId, _) = GetAuthInfo(ctx.User);

    var query = db.MediaItems.Include(m => m.Category).Include(m => m.Ratings).AsQueryable();

    if (!string.IsNullOrWhiteSpace(mediaType) && !mediaType.Equals("all", StringComparison.OrdinalIgnoreCase))
        query = query.Where(m => m.MediaType.ToLower() == mediaType.ToLower());

    if (categoryId.HasValue && categoryId.Value > 0)
        query = query.Where(m => m.CategoryId == categoryId.Value);

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = search.Trim().ToLower();
        query = query.Where(m =>
            m.Title.ToLower().Contains(term) ||
            m.FandomUniverse.ToLower().Contains(term) ||
            m.Tags.ToLower().Contains(term) ||
            m.Description.ToLower().Contains(term));
    }

    var totalCount = await query.CountAsync();
    var rawItems = await query
        .OrderByDescending(m => m.AverageRating)
        .ThenByDescending(m => m.Id)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    var dtos = rawItems.Select(m =>
    {
        int? myRating = isAuth ? m.Ratings.FirstOrDefault(r => r.UserId == currentUserId)?.Score : null;
        return new MediaItemDto(
            m.Id, m.CategoryId, m.Category?.Name ?? string.Empty,
            m.Title, m.FandomUniverse, m.MediaType, m.MediaUrl, m.ThumbnailUrl,
            m.Description, m.Tags, m.DurationSeconds, m.AverageRating, m.RatingsCount,
            myRating, m.CreatedAt);
    }).ToList();

    return Results.Ok(new PagedResult<MediaItemDto>(dtos, totalCount, page, pageSize));
});

// Admin Media CRUD
app.MapPost("/api/media", async (HttpContext ctx, FanHubDbContext db, UpsertMediaItemDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.MediaUrl))
        return Results.BadRequest(new { message = "Title and Media URL are required." });

    var item = new MediaItem
    {
        CategoryId = dto.CategoryId,
        Title = dto.Title.Trim(),
        FandomUniverse = dto.FandomUniverse.Trim(),
        MediaType = string.IsNullOrWhiteSpace(dto.MediaType) ? "Video" : dto.MediaType.Trim(),
        MediaUrl = dto.MediaUrl.Trim(),
        ThumbnailUrl = dto.ThumbnailUrl.Trim(),
        Description = dto.Description.Trim(),
        Tags = dto.Tags.Trim(),
        DurationSeconds = dto.DurationSeconds,
        AverageRating = 5.0,
        RatingsCount = 1,
        CreatedAt = DateTime.UtcNow
    };

    db.MediaItems.Add(item);
    await db.SaveChangesAsync();
    await db.Entry(item).Reference(m => m.Category).LoadAsync();

    return Results.Created($"/api/media/{item.Id}", new MediaItemDto(
        item.Id, item.CategoryId, item.Category?.Name ?? string.Empty,
        item.Title, item.FandomUniverse, item.MediaType, item.MediaUrl,
        item.ThumbnailUrl, item.Description, item.Tags, item.DurationSeconds,
        item.AverageRating, item.RatingsCount, null, item.CreatedAt));
});

app.MapPut("/api/media/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id, UpsertMediaItemDto dto) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var item = await db.MediaItems.Include(m => m.Category).FirstOrDefaultAsync(m => m.Id == id);
    if (item is null) return Results.NotFound(new { message = $"Media item {id} not found." });

    item.CategoryId = dto.CategoryId;
    item.Title = dto.Title.Trim();
    item.FandomUniverse = dto.FandomUniverse.Trim();
    item.MediaType = dto.MediaType.Trim();
    item.MediaUrl = dto.MediaUrl.Trim();
    item.ThumbnailUrl = dto.ThumbnailUrl.Trim();
    item.Description = dto.Description.Trim();
    item.Tags = dto.Tags.Trim();
    item.DurationSeconds = dto.DurationSeconds;

    await db.SaveChangesAsync();

    return Results.Ok(new MediaItemDto(
        item.Id, item.CategoryId, item.Category?.Name ?? string.Empty,
        item.Title, item.FandomUniverse, item.MediaType, item.MediaUrl,
        item.ThumbnailUrl, item.Description, item.Tags, item.DurationSeconds,
        item.AverageRating, item.RatingsCount, null, item.CreatedAt));
});

app.MapDelete("/api/media/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id) =>
{
    var (isAuth, _, role) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();
    if (role != "Admin") return Results.Json(new { message = "Forbidden: Admin role required." }, statusCode: 403);

    var item = await db.MediaItems.FindAsync(id);
    if (item is null) return Results.NotFound(new { message = $"Media item {id} not found." });

    db.MediaItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Authenticated User Rating (1 to 5 stars)
app.MapPost("/api/media/{id:int}/rate", async (HttpContext ctx, FanHubDbContext db, int id, RateMediaDto dto) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    if (dto.Score < 1 || dto.Score > 5)
        return Results.BadRequest(new { message = "Rating score must be between 1 and 5." });

    var media = await db.MediaItems.Include(m => m.Ratings).FirstOrDefaultAsync(m => m.Id == id);
    if (media is null) return Results.NotFound(new { message = $"Media item {id} not found." });

    var existingRating = await db.MediaRatings.FirstOrDefaultAsync(r => r.MediaItemId == id && r.UserId == userId);
    if (existingRating != null)
    {
        existingRating.Score = dto.Score;
        existingRating.UpdatedAt = DateTime.UtcNow;
    }
    else
    {
        db.MediaRatings.Add(new MediaRating
        {
            MediaItemId = id,
            UserId = userId,
            Score = dto.Score,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
    }

    await db.SaveChangesAsync();

    // Recalculate average rating
    var allRatings = await db.MediaRatings.Where(r => r.MediaItemId == id).Select(r => r.Score).ToListAsync();
    media.RatingsCount = allRatings.Count;
    media.AverageRating = Math.Round(allRatings.Average(), 1);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        mediaItemId = id,
        userRating = dto.Score,
        averageRating = media.AverageRating,
        ratingsCount = media.RatingsCount
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER BOOKMARKS: Personal Saved Items
// ─────────────────────────────────────────────────────────────────────────────
app.MapGet("/api/bookmarks", async (HttpContext ctx, FanHubDbContext db) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var bookmarks = await db.UserBookmarks
        .Where(b => b.UserId == userId)
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => new BookmarkDto(
            b.Id, b.ItemType, b.ItemId, b.ItemTitle, b.ItemSubtitle, b.ItemImageUrl, b.CreatedAt))
        .ToListAsync();

    return Results.Ok(bookmarks);
});

app.MapPost("/api/bookmarks", async (HttpContext ctx, FanHubDbContext db, CreateBookmarkDto dto) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(dto.ItemType) || dto.ItemId <= 0)
        return Results.BadRequest(new { message = "ItemType and valid ItemId are required." });

    var existing = await db.UserBookmarks
        .FirstOrDefaultAsync(b => b.UserId == userId && b.ItemType == dto.ItemType && b.ItemId == dto.ItemId);

    if (existing != null)
    {
        return Results.Ok(new BookmarkDto(
            existing.Id, existing.ItemType, existing.ItemId,
            existing.ItemTitle, existing.ItemSubtitle, existing.ItemImageUrl, existing.CreatedAt));
    }

    var bookmark = new UserBookmark
    {
        UserId = userId,
        ItemType = dto.ItemType.Trim(),
        ItemId = dto.ItemId,
        ItemTitle = dto.ItemTitle.Trim(),
        ItemSubtitle = dto.ItemSubtitle.Trim(),
        ItemImageUrl = dto.ItemImageUrl.Trim(),
        CreatedAt = DateTime.UtcNow
    };

    db.UserBookmarks.Add(bookmark);
    await db.SaveChangesAsync();

    return Results.Created($"/api/bookmarks/{bookmark.Id}", new BookmarkDto(
        bookmark.Id, bookmark.ItemType, bookmark.ItemId,
        bookmark.ItemTitle, bookmark.ItemSubtitle, bookmark.ItemImageUrl, bookmark.CreatedAt));
});

app.MapDelete("/api/bookmarks/{id:int}", async (HttpContext ctx, FanHubDbContext db, int id) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var bookmark = await db.UserBookmarks.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    if (bookmark is null) return Results.NotFound(new { message = "Bookmark not found or belongs to another user." });

    db.UserBookmarks.Remove(bookmark);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/bookmarks/item/{itemType}/{itemId:int}", async (HttpContext ctx, FanHubDbContext db, string itemType, int itemId) =>
{
    var (isAuth, userId, _) = GetAuthInfo(ctx.User);
    if (!isAuth) return Results.Unauthorized();

    var bookmark = await db.UserBookmarks
        .FirstOrDefaultAsync(b => b.UserId == userId && b.ItemType.ToLower() == itemType.ToLower() && b.ItemId == itemId);

    if (bookmark is null) return Results.NotFound();

    db.UserBookmarks.Remove(bookmark);
    await db.SaveChangesAsync();
    return Results.NoContent();
});


app.Run();

