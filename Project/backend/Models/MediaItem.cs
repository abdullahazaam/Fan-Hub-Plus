namespace FanHubPlus.Models;

public class MediaItem
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Title { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public string MediaType { get; set; } = "Video"; // "Video" or "Audio"
    public string MediaUrl { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public int DurationSeconds { get; set; } = 0;
    public double AverageRating { get; set; } = 0.0;
    public int RatingsCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MediaRating> Ratings { get; set; } = new List<MediaRating>();
}
