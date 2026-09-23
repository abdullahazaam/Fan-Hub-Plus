namespace FanHubPlus.Models;

public class Character
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public string RoleTitle { get; set; } = string.Empty; // e.g., Protagonist, Antagonist, Mentor
    public string Bio { get; set; } = string.Empty;
    public string Abilities { get; set; } = string.Empty;
    public string Backstory { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    public string OriginUniverse { get; set; } = string.Empty;
    public string VoiceActor { get; set; } = string.Empty;
    public int PopularityScore { get; set; } = 90;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
