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
    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

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

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.NormalizedEmail).IsRequired().HasMaxLength(256);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.PasswordSalt).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasMaxLength(50).HasDefaultValue("User");
            entity.Property(u => u.DisplayName).HasMaxLength(120);
            entity.Property(u => u.Bio).HasMaxLength(500);
            entity.Property(u => u.AvatarUrl).HasMaxLength(1000);
            entity.Property(u => u.FavoriteCategory).HasMaxLength(100);

            // Unique constraints — email and username must be unique across all users
            entity.HasIndex(u => u.NormalizedEmail).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // PasswordResetToken Configuration
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(t => t.Id);
            // Only the SHA-256 hash of the token is stored, never the raw value
            entity.Property(t => t.TokenHash).IsRequired().HasMaxLength(512);
            entity.Property(t => t.ExpiresAt).IsRequired();
            entity.Property(t => t.IsUsed).HasDefaultValue(false);

            entity.HasOne(t => t.User)
                  .WithMany(u => u.PasswordResetTokens)
                  .HasForeignKey(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(t => t.TokenHash);
            entity.HasIndex(t => t.UserId);
        });
    }
}
