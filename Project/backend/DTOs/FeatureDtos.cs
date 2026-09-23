namespace FanHubPlus.DTOs;

public record CharacterDto(
    int Id,
    int CategoryId,
    string CategoryName,
    string Name,
    string FandomUniverse,
    string RoleTitle,
    string Bio,
    string Abilities,
    string Backstory,
    string AvatarUrl,
    string BannerUrl,
    string OriginUniverse,
    string VoiceActor,
    int PopularityScore,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record UpsertCharacterDto(
    int CategoryId,
    string Name,
    string FandomUniverse,
    string RoleTitle,
    string Bio,
    string Abilities,
    string Backstory,
    string AvatarUrl,
    string BannerUrl,
    string OriginUniverse,
    string VoiceActor,
    int PopularityScore
);

public record MediaItemDto(
    int Id,
    int CategoryId,
    string CategoryName,
    string Title,
    string FandomUniverse,
    string MediaType,
    string MediaUrl,
    string ThumbnailUrl,
    string Description,
    string Tags,
    int DurationSeconds,
    double AverageRating,
    int RatingsCount,
    int? UserRating,
    DateTime CreatedAt
);

public record UpsertMediaItemDto(
    int CategoryId,
    string Title,
    string FandomUniverse,
    string MediaType,
    string MediaUrl,
    string ThumbnailUrl,
    string Description,
    string Tags,
    int DurationSeconds
);

public record RateMediaDto(
    int Score // 1 to 5
);

public record BookmarkDto(
    int Id,
    string ItemType,
    int ItemId,
    string ItemTitle,
    string ItemSubtitle,
    string ItemImageUrl,
    DateTime CreatedAt
);

public record CreateBookmarkDto(
    string ItemType,
    int ItemId,
    string ItemTitle,
    string ItemSubtitle,
    string ItemImageUrl
);
