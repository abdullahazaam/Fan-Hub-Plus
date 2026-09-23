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
    public DbSet<Character> Characters => Set<Character>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<MediaRating> MediaRatings => Set<MediaRating>();
    public DbSet<UserBookmark> UserBookmarks => Set<UserBookmark>();

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

            entity.HasIndex(u => u.NormalizedEmail).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // PasswordResetToken Configuration
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(t => t.Id);
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

        // Character Configuration
        modelBuilder.Entity<Character>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(150);
            entity.Property(c => c.FandomUniverse).IsRequired().HasMaxLength(150);
            entity.Property(c => c.RoleTitle).HasMaxLength(100);
            entity.Property(c => c.Bio).HasMaxLength(2000);
            entity.Property(c => c.Abilities).HasMaxLength(1000);
            entity.Property(c => c.Backstory).HasMaxLength(4000);
            entity.Property(c => c.AvatarUrl).HasMaxLength(1000);
            entity.Property(c => c.BannerUrl).HasMaxLength(1000);
            entity.Property(c => c.OriginUniverse).HasMaxLength(150);
            entity.Property(c => c.VoiceActor).HasMaxLength(150);

            entity.HasOne(c => c.Category)
                  .WithMany()
                  .HasForeignKey(c => c.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.CategoryId);
            entity.HasIndex(c => c.FandomUniverse);
            entity.HasIndex(c => c.PopularityScore);
        });

        // MediaItem Configuration
        modelBuilder.Entity<MediaItem>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Title).IsRequired().HasMaxLength(250);
            entity.Property(m => m.FandomUniverse).IsRequired().HasMaxLength(150);
            entity.Property(m => m.MediaType).IsRequired().HasMaxLength(50);
            entity.Property(m => m.MediaUrl).IsRequired().HasMaxLength(1500);
            entity.Property(m => m.ThumbnailUrl).HasMaxLength(1000);
            entity.Property(m => m.Description).HasMaxLength(1500);
            entity.Property(m => m.Tags).HasMaxLength(500);

            entity.HasOne(m => m.Category)
                  .WithMany()
                  .HasForeignKey(m => m.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(m => m.CategoryId);
            entity.HasIndex(m => m.MediaType);
            entity.HasIndex(m => m.AverageRating);
        });

        // MediaRating Configuration
        modelBuilder.Entity<MediaRating>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Score).IsRequired();

            entity.HasOne(r => r.MediaItem)
                  .WithMany(m => m.Ratings)
                  .HasForeignKey(r => r.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                  .WithMany()
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // One rating per user per media item
            entity.HasIndex(r => new { r.MediaItemId, r.UserId }).IsUnique();
        });

        // UserBookmark Configuration
        modelBuilder.Entity<UserBookmark>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.ItemType).IsRequired().HasMaxLength(50);
            entity.Property(b => b.ItemTitle).IsRequired().HasMaxLength(250);
            entity.Property(b => b.ItemSubtitle).HasMaxLength(200);
            entity.Property(b => b.ItemImageUrl).HasMaxLength(1000);

            entity.HasOne(b => b.User)
                  .WithMany()
                  .HasForeignKey(b => b.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // A user can bookmark a specific item of a type only once
            entity.HasIndex(b => new { b.UserId, b.ItemType, b.ItemId }).IsUnique();
        });
    }
}
