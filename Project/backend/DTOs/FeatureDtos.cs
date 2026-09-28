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
    string? ItemTitle,
    string? ItemSubtitle,
    string? ItemImageUrl
);

// ─── Fan Submissions DTOs ───────────────────────────────────────────────────
public record FanSubmissionDto(
    int Id,
    string Title,
    string AuthorName,
    string? AuthorEmail,
    int? UserId,
    int CategoryId,
    string CategoryName,
    string FandomUniverse,
    string SubmissionType,
    string ContentText,
    string? MediaUrl,
    string Status,
    string? AdminNotes,
    DateTime SubmittedAt,
    DateTime? ReviewedAt
);

public record CreateFanSubmissionDto(
    string Title,
    string? AuthorName,
    string? AuthorEmail,
    int? CategoryId,
    string? FandomUniverse,
    string? SubmissionType,
    string ContentText,
    string? MediaUrl
);

public record UpdateSubmissionStatusDto(
    string Status, // Approved, Rejected
    string? AdminNotes,
    bool PublishToContent = false
);

// ─── Feedback DTOs ──────────────────────────────────────────────────────────
public record FeedbackDto(
    int Id,
    string FeedbackType, // Bug, Suggestion, Query
    string Subject,
    string Message,
    string? UserEmail,
    string? UserName,
    string Status, // Open, In Review, Resolved
    DateTime CreatedAt
);

public record CreateFeedbackDto(
    string FeedbackType,
    string Subject,
    string Message,
    string? UserEmail,
    string? UserName
);

public record UpdateFeedbackStatusDto(
    string Status // Open, In Review, Resolved
);

// ─── Admin User Management DTOs ─────────────────────────────────────────────
public record AdminUserDto(
    int Id,
    string Username,
    string Email,
    string DisplayName,
    string Role,
    string? AvatarUrl,
    string? FavoriteCategory,
    int BookmarksCount,
    DateTime CreatedAt
);

public record UpdateUserRoleDto(
    string Role // User, Admin
);

// ─── Analytics DTOs ─────────────────────────────────────────────────────────
public record CategoryAnalyticsDto(
    int CategoryId,
    string CategoryName,
    string Slug,
    int ContentCount,
    int CharacterCount,
    int MediaCount,
    int TotalItems
);

public record PopularItemAnalyticsDto(
    int Id,
    string Title,
    string CategoryName,
    string Type,
    int Popularity
);

public record FandomPopularityDto(
    string FandomUniverse,
    int ItemCount,
    int AveragePopularity,
    string PrimaryCategory
);

public record AdminAnalyticsDto(
    int TotalUsers,
    int ActiveUsers,
    int TotalContent,
    int TotalCharacters,
    int TotalMedia,
    int TotalSubmissions,
    int PendingSubmissions,
    int TotalFeedback,
    int OpenFeedback,
    int TotalBookmarks,
    List<CategoryAnalyticsDto> CategoryStats,
    Dictionary<string, int> ContentTypeBreakdown,
    Dictionary<string, int> FeedbackTypeBreakdown,
    List<PopularItemAnalyticsDto> TopPopularItems,
    Dictionary<string, int>? BookmarkTypeBreakdown = null,
    List<FandomPopularityDto>? PopularFandoms = null
);

// ─── Merchandise DTOs ───────────────────────────────────────────────────────
public record MerchandiseItemDto(
    int Id,
    string Name,
    string FandomUniverse,
    int CategoryId,
    string CategoryName,
    decimal Price,
    string Currency,
    string ImageUrl,
    string Tag,
    string Description,
    string StockStatus,
    DateTime CreatedAt
);

// ─── Upcoming Release DTOs ──────────────────────────────────────────────────
public record UpcomingReleaseDto(
    int Id,
    string Title,
    string FandomUniverse,
    int CategoryId,
    string CategoryName,
    string MediaType,
    DateTime ReleaseDate,
    string ReleaseWindow,
    string Platform,
    string ThumbnailUrl,
    string Synopsis,
    int HypeScore
);

// ─── Event DTOs ─────────────────────────────────────────────────────────────
public record EventItemDto(
    int Id,
    string Title,
    string FandomUniverse,
    int CategoryId,
    string CategoryName,
    string City,
    string Venue,
    string Coordinates,
    DateTime EventDate,
    DateTime? EndDate,
    string ThumbnailUrl,
    string Description,
    string TicketUrl,
    string Status
);

// ─── User Activity DTO ───────────────────────────────────────────────────────
public record UserActivityDto(
    string Id,
    string ActivityType,
    string ActionText,
    string ItemType,
    int TargetId,
    string TargetTitle,
    string? TargetSubtitle,
    string? ImageUrl,
    string? Details,
    DateTime Timestamp
);

