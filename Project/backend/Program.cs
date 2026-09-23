using FanHubPlus.Data;
using FanHubPlus.DTOs;
using FanHubPlus.Models;
using Microsoft.EntityFrameworkCore;

// Hook up custom assembly resolver for local runtime assemblies in base directory
AppDomain.CurrentDomain.AssemblyResolve += (sender, args) =>
{
    var assemblyName = new System.Reflection.AssemblyName(args.Name).Name + ".dll";
    var assemblyPath = Path.Combine(AppContext.BaseDirectory, assemblyName);
    return File.Exists(assemblyPath) ? System.Reflection.Assembly.LoadFrom(assemblyPath) : null;
};

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Services
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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 2. Initialize Database and Seed Data
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<FanHubDbContext>();
        DbInitializer.Initialize(db);
        logger.LogInformation("Fan Hub Plus database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database initialization/seeding.");
    }
}

// 3. Configure HTTP Pipeline
app.UseCors("AllowFrontend");

// --- Health Check Endpoint ---
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "Fan Hub Plus Web API",
    database = "SQL Server Connected",
    timestamp = DateTime.UtcNow,
    version = "1.1.0"
}));

// --- Categories Endpoint ---
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

// --- Content Listing (Visitor browse, search, filter, sort, paginate) ---
app.MapGet("/api/content", async (
    FanHubDbContext db,
    string? search,
    int? categoryId,
    string? contentType,
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
    {
        query = query.Where(c => c.CategoryId == categoryId.Value);
    }

    if (!string.IsNullOrWhiteSpace(contentType) && !contentType.Equals("all", StringComparison.OrdinalIgnoreCase))
    {
        query = query.Where(c => c.ContentType.ToLower() == contentType.ToLower());
    }

    // Sort order
    query = sortBy?.ToLower() switch
    {
        "latest" => query.OrderByDescending(c => c.ReleaseDate).ThenByDescending(c => c.Id),
        "title" => query.OrderBy(c => c.Title),
        _ => query.OrderByDescending(c => c.PopularityScore).ThenByDescending(c => c.Id)
    };

    var totalCount = await query.CountAsync();

    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new ContentResponseDto(
            c.Id,
            c.CategoryId,
            c.Category != null ? c.Category.Name : string.Empty,
            c.Category != null ? c.Category.Slug : string.Empty,
            c.Title,
            c.FandomUniverse,
            c.ContentType,
            c.Description,
            c.ContentText,
            c.ThumbnailUrl,
            c.MediaUrl,
            c.Author,
            c.Tags,
            c.PopularityScore,
            c.ReleaseDate,
            c.CreatedAt,
            c.UpdatedAt
        ))
        .ToListAsync();

    return Results.Ok(new PagedResult<ContentResponseDto>(items, totalCount, page, pageSize));
});

// --- Content Detail (Visitor detail page) ---
app.MapGet("/api/content/{id:int}", async (FanHubDbContext db, int id) =>
{
    var item = await db.ContentItems
        .Include(c => c.Category)
        .FirstOrDefaultAsync(c => c.Id == id);

    if (item is null)
    {
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });
    }

    var dto = new ContentResponseDto(
        item.Id,
        item.CategoryId,
        item.Category != null ? item.Category.Name : string.Empty,
        item.Category != null ? item.Category.Slug : string.Empty,
        item.Title,
        item.FandomUniverse,
        item.ContentType,
        item.Description,
        item.ContentText,
        item.ThumbnailUrl,
        item.MediaUrl,
        item.Author,
        item.Tags,
        item.PopularityScore,
        item.ReleaseDate,
        item.CreatedAt,
        item.UpdatedAt
    );

    return Results.Ok(dto);
});

// --- Admin Flow: Create Content Item ---
app.MapPost("/api/content", async (FanHubDbContext db, CreateContentDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest(new { message = "Title is required." });
    }

    var categoryExists = await db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
    {
        return Results.BadRequest(new { message = "Invalid CategoryId specified." });
    }

    var contentItem = new ContentItem
    {
        CategoryId = dto.CategoryId,
        Title = dto.Title.Trim(),
        FandomUniverse = string.IsNullOrWhiteSpace(dto.FandomUniverse) ? "Original Universe" : dto.FandomUniverse.Trim(),
        ContentType = string.IsNullOrWhiteSpace(dto.ContentType) ? "Article" : dto.ContentType.Trim(),
        Description = dto.Description.Trim(),
        ContentText = dto.ContentText.Trim(),
        ThumbnailUrl = string.IsNullOrWhiteSpace(dto.ThumbnailUrl) ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80" : dto.ThumbnailUrl.Trim(),
        MediaUrl = string.IsNullOrWhiteSpace(dto.MediaUrl) ? dto.ThumbnailUrl : dto.MediaUrl.Trim(),
        Author = string.IsNullOrWhiteSpace(dto.Author) ? "Fan Hub Curator" : dto.Author.Trim(),
        Tags = dto.Tags.Trim(),
        PopularityScore = dto.PopularityScore > 0 ? dto.PopularityScore : 85,
        ReleaseDate = dto.ReleaseDate ?? DateTime.UtcNow,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    db.ContentItems.Add(contentItem);
    await db.SaveChangesAsync();

    // Reload with Category
    await db.Entry(contentItem).Reference(c => c.Category).LoadAsync();

    var responseDto = new ContentResponseDto(
        contentItem.Id,
        contentItem.CategoryId,
        contentItem.Category != null ? contentItem.Category.Name : string.Empty,
        contentItem.Category != null ? contentItem.Category.Slug : string.Empty,
        contentItem.Title,
        contentItem.FandomUniverse,
        contentItem.ContentType,
        contentItem.Description,
        contentItem.ContentText,
        contentItem.ThumbnailUrl,
        contentItem.MediaUrl,
        contentItem.Author,
        contentItem.Tags,
        contentItem.PopularityScore,
        contentItem.ReleaseDate,
        contentItem.CreatedAt,
        contentItem.UpdatedAt
    );

    return Results.Created($"/api/content/{contentItem.Id}", responseDto);
});

// --- Admin Flow: Update Content Item ---
app.MapPut("/api/content/{id:int}", async (FanHubDbContext db, int id, UpdateContentDto dto) =>
{
    var item = await db.ContentItems.Include(c => c.Category).FirstOrDefaultAsync(c => c.Id == id);
    if (item is null)
    {
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });
    }

    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest(new { message = "Title is required." });
    }

    var categoryExists = await db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
    {
        return Results.BadRequest(new { message = "Invalid CategoryId specified." });
    }

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

    // Reload category if changed
    await db.Entry(item).Reference(c => c.Category).LoadAsync();

    var responseDto = new ContentResponseDto(
        item.Id,
        item.CategoryId,
        item.Category != null ? item.Category.Name : string.Empty,
        item.Category != null ? item.Category.Slug : string.Empty,
        item.Title,
        item.FandomUniverse,
        item.ContentType,
        item.Description,
        item.ContentText,
        item.ThumbnailUrl,
        item.MediaUrl,
        item.Author,
        item.Tags,
        item.PopularityScore,
        item.ReleaseDate,
        item.CreatedAt,
        item.UpdatedAt
    );

    return Results.Ok(responseDto);
});

// --- Admin Flow: Delete Content Item ---
app.MapDelete("/api/content/{id:int}", async (FanHubDbContext db, int id) =>
{
    var item = await db.ContentItems.FindAsync(id);
    if (item is null)
    {
        return Results.NotFound(new { message = $"Content item with ID {id} was not found." });
    }

    db.ContentItems.Remove(item);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
