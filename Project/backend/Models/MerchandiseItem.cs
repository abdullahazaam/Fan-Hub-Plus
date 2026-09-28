namespace FanHubPlus.Models;

public class MerchandiseItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FandomUniverse { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string ImageUrl { get; set; } = string.Empty;
    public string Tag { get; set; } = "Collectible"; // Limited Edition, Pre-Order, Collectible, Official Artifact
    public string Description { get; set; } = string.Empty;
    public string StockStatus { get; set; } = "In Stock"; // In Stock, Pre-Order, Limited Stock
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
