namespace FanHubPlus.Models;

public class UserBookmark
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    // Target item type: "Content", "Character", "Media"
    public string ItemType { get; set; } = "Content";
    public int ItemId { get; set; }

    // Snapshot metadata for fast display without heavy joins
    public string ItemTitle { get; set; } = string.Empty;
    public string ItemSubtitle { get; set; } = string.Empty; // Universe or Category
    public string ItemImageUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
