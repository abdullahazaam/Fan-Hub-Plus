namespace FanHubPlus.Models;

public class FeedbackItem
{
    public int Id { get; set; }
    public string FeedbackType { get; set; } = "Query"; // Bug, Suggestion, Query
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? UserName { get; set; }
    public string Status { get; set; } = "Open"; // Open, In Review, Resolved
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
