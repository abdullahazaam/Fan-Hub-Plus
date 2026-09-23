namespace FanHubPlus.Models;

public class ContentItem
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Title { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public string ContentType { get; set; } = "Article"; // Article, Video, Audio, Image
    public string Description { get; set; } = string.Empty;
    public string ContentText { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string MediaUrl { get; set; } = string.Empty;
    public string Author { get; set; } = "Fan Hub Plus Staff";
    public string Tags { get; set; } = string.Empty;
    public int PopularityScore { get; set; } = 85;
    public DateTime ReleaseDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
