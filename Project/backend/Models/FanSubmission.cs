namespace FanHubPlus.Models;

public class FanSubmission
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorEmail { get; set; }
    public int? UserId { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string FandomUniverse { get; set; } = string.Empty;
    public string SubmissionType { get; set; } = "Article"; // Article, Theory, Art, Review, Cosplay, Video
    public string ContentText { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? AdminNotes { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
}
