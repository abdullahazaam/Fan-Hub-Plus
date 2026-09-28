namespace FanHubPlus.Models;

public class UpcomingRelease
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string MediaType { get; set; } = "Anime"; // Anime, Gaming, Movies, TV Shows, Comics, Merchandise
    public DateTime ReleaseDate { get; set; }
    public string ReleaseWindow { get; set; } = "Q4 2026";
    public string Platform { get; set; } = "Cinema";
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string Synopsis { get; set; } = string.Empty;
    public int HypeScore { get; set; } = 95; // 1 to 100
}
