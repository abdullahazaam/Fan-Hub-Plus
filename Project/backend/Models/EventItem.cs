namespace FanHubPlus.Models;

public class EventItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string City { get; set; } = "Tokyo"; // Tokyo, Los Angeles, Seoul, London, Paris, New York, Online
    public string Venue { get; set; } = string.Empty;
    public string Coordinates { get; set; } = "35.6762, 139.6503";
    public DateTime EventDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TicketUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Tickets Available"; // Tickets Available, Selling Fast, Free Entry, Virtual Stream
}
