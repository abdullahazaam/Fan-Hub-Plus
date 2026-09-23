namespace FanHubPlus.DTOs;

public record CreateContentDto(
    int CategoryId,
    string Title,
    string FandomUniverse,
    string ContentType,
    string Description,
    string ContentText,
    string ThumbnailUrl,
    string MediaUrl,
    string Author,
    string Tags,
    int PopularityScore,
    DateTime? ReleaseDate
);

public record UpdateContentDto(
    int CategoryId,
    string Title,
    string FandomUniverse,
    string ContentType,
    string Description,
    string ContentText,
    string ThumbnailUrl,
    string MediaUrl,
    string Author,
    string Tags,
    int PopularityScore,
    DateTime? ReleaseDate
);

public record ContentResponseDto(
    int Id,
    int CategoryId,
    string CategoryName,
    string CategorySlug,
    string Title,
    string FandomUniverse,
    string ContentType,
    string Description,
    string ContentText,
    string ThumbnailUrl,
    string MediaUrl,
    string Author,
    string Tags,
    int PopularityScore,
    DateTime ReleaseDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);
