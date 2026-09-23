using FanHubPlus.Models;
using Microsoft.EntityFrameworkCore;

namespace FanHubPlus.Data;

public class FanHubDbContext : DbContext
{
    public FanHubDbContext(DbContextOptions<FanHubDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ContentItem> ContentItems => Set<ContentItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Slug).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Description).HasMaxLength(500);
            entity.Property(c => c.Icon).HasMaxLength(50);
            entity.HasIndex(c => c.Slug).IsUnique();
        });

        // ContentItem Configuration
        modelBuilder.Entity<ContentItem>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Title).IsRequired().HasMaxLength(250);
            entity.Property(c => c.FandomUniverse).IsRequired().HasMaxLength(150);
            entity.Property(c => c.ContentType).IsRequired().HasMaxLength(50);
            entity.Property(c => c.Description).HasMaxLength(1000);
            entity.Property(c => c.ThumbnailUrl).HasMaxLength(1000);
            entity.Property(c => c.MediaUrl).HasMaxLength(1000);
            entity.Property(c => c.Author).HasMaxLength(100);
            entity.Property(c => c.Tags).HasMaxLength(300);

            entity.HasOne(c => c.Category)
                  .WithMany(cat => cat.ContentItems)
                  .HasForeignKey(c => c.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.CategoryId);
            entity.HasIndex(c => c.ContentType);
            entity.HasIndex(c => c.PopularityScore);
            entity.HasIndex(c => c.ReleaseDate);
        });
    }
}
