namespace FanHubPlus.Models;

public class MediaRating
{
    public int Id { get; set; }
    public int MediaItemId { get; set; }
    public MediaItem? MediaItem { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int Score { get; set; } // 1 to 5 stars
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
