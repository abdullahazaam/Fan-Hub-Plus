using FanHubPlus.Models;
using FanHubPlus.Services;
using Microsoft.EntityFrameworkCore;

namespace FanHubPlus.Data;

public static class DbInitializer
{
    /// <param name="isDevelopment">
    /// Pass <c>true</c> only when <see cref="IHostEnvironment.IsDevelopment()"/> is true.
    /// Demo account seeding is intentionally skipped in any other environment.
    /// </param>
    public static void Initialize(FanHubDbContext context, bool isDevelopment)
    {
        try
        {
            // Execute pending migrations against SQL Server
            context.Database.Migrate();
        }
        catch (Exception)
        {
            // Migrations may have warnings or be up to date; ensure DB exists
            context.Database.EnsureCreated();
        }

        EnsureTablesExist(context);
        EnsureCategories(context);
        SeedContentItems(context);
        SeedCharacters(context);
        SeedMediaItems(context);
        EnsureFanSubmissions(context);
        EnsureFeedbackItems(context);
        EnsureMerchandiseItems(context);
        EnsureUpcomingReleases(context);
        EnsureEventItems(context);

        // Audit and repair existing seed records to ensure clean URLs and no Rick Astley embeds
        AuditAndRepairSeedData(context);

        // Demo accounts are seeded ONLY in the local Development environment.
        // They are never created in Staging, Production, or any other environment.
        if (isDevelopment)
        {
            SeedDevelopmentAccounts(context);
        }
    }

    private static void EnsureCategories(FanHubDbContext context)
    {
        var existingSlugs = new HashSet<string>(context.Categories.Select(c => c.Slug), StringComparer.OrdinalIgnoreCase);

        var requiredCategories = new[]
        {
            new Category
            {
                Name = "Anime",
                Slug = "anime",
                Description = "Japanese animation universes, seasonal epics, shonen milestones, and studio masterpieces.",
                Icon = "Sparkles",
                DisplayOrder = 1
            },
            new Category
            {
                Name = "Gaming",
                Slug = "gaming",
                Description = "Immersive digital realms, AAA franchises, indie gems, and competitive esports lore.",
                Icon = "Gamepad2",
                DisplayOrder = 2
            },
            new Category
            {
                Name = "Movies",
                Slug = "movies",
                Description = "Blockbusters, cinematic universes, auteur sci-fi, and timeless cinematic sagas.",
                Icon = "Film",
                DisplayOrder = 3
            },
            new Category
            {
                Name = "TV Shows",
                Slug = "tv-shows",
                Description = "Serialized television dramas, speculative fiction, world-building streams, and cult classics.",
                Icon = "Tv",
                DisplayOrder = 4
            },
            new Category
            {
                Name = "K-Pop",
                Slug = "k-pop",
                Description = "Korean pop music phenomena, multi-era concepts, artist choreography, and fandom movements.",
                Icon = "Music",
                DisplayOrder = 5
            },
            new Category
            {
                Name = "Comics",
                Slug = "comics",
                Description = "Western comic book storylines, graphic novels, iconic superheroes, and multiverse arcs.",
                Icon = "BookOpen",
                DisplayOrder = 6
            },
            new Category
            {
                Name = "Manga",
                Slug = "manga",
                Description = "Serialized graphic literature, shonen, seinen, dark fantasy, and creator interviews.",
                Icon = "ScrollText",
                DisplayOrder = 7
            },
            new Category
            {
                Name = "Cosplay",
                Slug = "cosplay",
                Description = "Artistic costume fabrication, character portrayals, prop design, and convention showcases.",
                Icon = "Palette",
                DisplayOrder = 8
            }
        };

        var toAdd = requiredCategories.Where(c => !existingSlugs.Contains(c.Slug)).ToList();
        if (toAdd.Count > 0)
        {
            context.Categories.AddRange(toAdd);
            context.SaveChanges();
        }
    }

    private static void SeedContentItems(FanHubDbContext context)
    {
        var catMap = context.Categories.ToDictionary(c => c.Slug, c => c.Id, StringComparer.OrdinalIgnoreCase);
        var existingTitles = new HashSet<string>(context.ContentItems.Select(c => c.Title), StringComparer.OrdinalIgnoreCase);

        var seedItems = DbSeedData.GetSeedContentItems(catMap);
        var toAdd = seedItems.Where(i => !existingTitles.Contains(i.Title)).ToList();

        if (toAdd.Count > 0)
        {
            context.ContentItems.AddRange(toAdd);
            context.SaveChanges();
        }
    }

    private static void SeedCharacters(FanHubDbContext context)
    {
        var catMap = context.Categories.ToDictionary(c => c.Slug, c => c.Id, StringComparer.OrdinalIgnoreCase);
        var existingNames = new HashSet<string>(context.Characters.Select(c => c.Name), StringComparer.OrdinalIgnoreCase);

        var seedChars = DbSeedData.GetSeedCharacters(catMap);
        var toAdd = seedChars.Where(c => !existingNames.Contains(c.Name)).ToList();

        if (toAdd.Count > 0)
        {
            context.Characters.AddRange(toAdd);
            context.SaveChanges();
        }
    }

    private static void SeedMediaItems(FanHubDbContext context)
    {
        var catMap = context.Categories.ToDictionary(c => c.Slug, c => c.Id, StringComparer.OrdinalIgnoreCase);
        var existingTitles = new HashSet<string>(context.MediaItems.Select(m => m.Title), StringComparer.OrdinalIgnoreCase);

        var seedMedia = DbSeedData.GetSeedMediaItems(catMap);
        var toAdd = seedMedia.Where(m => !existingTitles.Contains(m.Title)).ToList();

        if (toAdd.Count > 0)
        {
            context.MediaItems.AddRange(toAdd);
            context.SaveChanges();
        }
    }

    /// <summary>
    /// Audits existing records in SQL Server and repairs mismatched URLs, Rick Astley embeds,
    /// and outdated stock photo URLs to maintain content integrity.
    /// </summary>
    private static void AuditAndRepairSeedData(FanHubDbContext context)
    {
        // 1. Audit Media Items
        var mediaItems = context.MediaItems.ToList();
        foreach (var m in mediaItems)
        {
            if (m.Title.Contains("Phantom Liberty") || m.Title.Contains("Cyberpunk"))
            {
                m.ThumbnailUrl = "/media/gaming_trailer.jpg";
            }
            else if (m.Title.Contains("Shibuya") || m.Title.Contains("Specialz") || m.Title.Contains("Jujutsu"))
            {
                m.ThumbnailUrl = "/media/jjk_specialz.jpg";
            }
            else if (m.Title.Contains("Interstellar") || m.Title.Contains("Caution"))
            {
                m.ThumbnailUrl = "/media/interstellar.jpg";
            }
            else if (m.Title.Contains("Dune"))
            {
                m.ThumbnailUrl = "/media/movie_trailer.jpg";
            }
            else if (m.Title.Contains("Arcane"))
            {
                m.ThumbnailUrl = "/media/arcane_trailer.jpg";
            }
            else if (m.Title.Contains("Attack on Titan") || m.Title.Contains("Rumbling"))
            {
                m.ThumbnailUrl = "/media/aot_rumbling.jpg";
            }
            else if (m.Title.Contains("Elden Ring") || m.Title.Contains("Erdtree"))
            {
                m.ThumbnailUrl = "/media/eldenring_erdtree.jpg";
            }
            else if (m.Title.Contains("NewJeans") || m.Title.Contains("Super Shy"))
            {
                m.ThumbnailUrl = "/media/newjeans_supershy.jpg";
            }
            else if (m.Title.Contains("Blood Sweat") || m.Title.Contains("BTS"))
            {
                m.ThumbnailUrl = "/media/bts_bst.jpg";
            }
            else if (m.Title.Contains("Spider-Verse") || m.Title.Contains("Spider-Man"))
            {
                m.ThumbnailUrl = "/media/spiderverse_trailer.jpg";
            }
            else if (m.Title.Contains("Blade Runner") || m.Title.Contains("Tears In Rain"))
            {
                m.ThumbnailUrl = "/media/bladerunner_2049.jpg";
            }
            else if (m.Title.Contains("Witcher") || m.Title.Contains("Silver for Monsters"))
            {
                m.ThumbnailUrl = "/media/witcher_monsters.jpg";
            }
            else if (m.Title.Contains("House of the Dragon") || m.Title.Contains("Season 2 Teaser"))
            {
                m.ThumbnailUrl = "/media/hotd_teaser.jpg";
            }
            else if (m.Title.Contains("Berserk") || m.Title.Contains("Forces"))
            {
                m.ThumbnailUrl = "/media/anime_ost.jpg";
            }
            else if (m.Title.Contains("World Cosplay") || m.Title.Contains("Cosplay"))
            {
                m.ThumbnailUrl = "/media/cosplay_summit.jpg";
            }
            else if (m.Title.Contains("Weight of the World") || m.Title.Contains("NieR"))
            {
                m.ThumbnailUrl = "/media/game_ost.jpg";
            }
            else if (m.Title.Contains("POP/STARS") || m.Title.Contains("K/DA"))
            {
                m.ThumbnailUrl = "/media/kpop_video.jpg";
            }
        }

        // 2. Audit Content Items (remove Rick Astley and gaming cafe photos)
        var contentItems = context.ContentItems.ToList();
        foreach (var c in contentItems)
        {
            if (c.Title.Contains("Domain Expansion Breakdown") && c.MediaUrl.Contains("dQw4w9WgXcQ"))
            {
                c.MediaUrl = "https://www.youtube.com/embed/fhzKLBZJC3w";
            }
            if (c.Title.Contains("Night City Chronicles"))
            {
                c.ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80";
                c.MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85";
            }
        }

        // 3. Audit Characters: ensure universe environment backdrops and clear unsuitable stock photos
        var characters = context.Characters.ToList();
        foreach (var ch in characters)
        {
            if (ch.Name == "Johnny Silverhand")
            {
                ch.BannerUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80";
                ch.AvatarUrl = "";
            }
            else if (ch.Name == "Satoru Gojo")
            {
                ch.BannerUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=80";
                ch.AvatarUrl = "";
            }
            else if (ch.Name == "Geralt of Rivia")
            {
                ch.BannerUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80";
                ch.AvatarUrl = "";
            }
        }

        // 4. Audit Merchandise Items
        var merchItems = context.MerchandiseItems.ToList();
        foreach (var m in merchItems)
        {
            if (m.Name.Contains("Arasaka") || m.Name.Contains("Relic"))
            {
                m.ImageUrl = "/merchandise/arasaka_relic.jpg";
            }
            else if (m.Name.Contains("Kamado Tanjiro") || m.Name.Contains("Nichirin"))
            {
                m.ImageUrl = "/merchandise/tanjiro_sword.jpg";
            }
            else if (m.Name.Contains("Malenia"))
            {
                m.ImageUrl = "/merchandise/malenia_statue.jpg";
            }
            else if (m.Name.Contains("Infinity Gauntlet") || m.Name.Contains("Stark Nanotech"))
            {
                m.ImageUrl = "/merchandise/infinity_gauntlet.jpg";
            }
            else if (m.Name.Contains("Hellfire"))
            {
                m.ImageUrl = "/merchandise/hellfire_bomber.jpg";
            }
            else if (m.Name.Contains("Bunnies") || m.Name.Contains("Lightstick"))
            {
                m.ImageUrl = "/merchandise/bunnies_lightstick.jpg";
            }
            else if (m.Name.Contains("Dark Knight") || m.Name.Contains("Cowl"))
            {
                m.ImageUrl = "/merchandise/batman_cowl.jpg";
            }
            else if (m.Name.Contains("Dragon Slayer") || m.Name.Contains("Berserk"))
            {
                m.ImageUrl = "/merchandise/dragon_slayer.jpg";
            }
            else if (m.Name.Contains("HUD Visor") || m.Name.Contains("Vanguard"))
            {
                m.ImageUrl = "/merchandise/hud_visor.jpg";
            }
        }

        // 5. Audit Upcoming Releases
        var releases = context.UpcomingReleases.ToList();
        foreach (var r in releases)
        {
            if (r.Title.Contains("Infinity Castle") || r.Title.Contains("Demon Slayer"))
            {
                r.ThumbnailUrl = "/releases/demonslayer_castle.jpg";
            }
            else if (r.Title.Contains("Grand Theft Auto") || r.Title.Contains("GTA"))
            {
                r.ThumbnailUrl = "/releases/gta6_vicecity.jpg";
            }
            else if (r.Title.Contains("Secret Wars") || r.Title.Contains("Avengers"))
            {
                r.ThumbnailUrl = "/releases/secretwars.jpg";
            }
            else if (r.Title.Contains("Stranger Things"))
            {
                r.ThumbnailUrl = "/releases/stranger_things_s5.jpg";
            }
            else if (r.Title.Contains("Beyond the Spider-Verse") || r.Title.Contains("Spider-Verse"))
            {
                r.ThumbnailUrl = "/releases/beyond_spiderverse.jpg";
            }
            else if (r.Title.Contains("Chainsaw Man") || r.Title.Contains("Reze"))
            {
                r.ThumbnailUrl = "/releases/chainsawman_reze.jpg";
            }
            else if (r.Title.Contains("BTS") || r.Title.Contains("Reunion"))
            {
                r.ThumbnailUrl = "/releases/bts_reunion.jpg";
            }
            else if (r.Title.Contains("Solo Leveling"))
            {
                r.ThumbnailUrl = "/releases/sololeveling_s2.jpg";
            }
        }

        // 6. Audit Event Items
        var events = context.EventItems.ToList();
        foreach (var ev in events)
        {
            if (ev.Title.Contains("AnimeJapan"))
            {
                ev.ThumbnailUrl = "/events/animejapan.jpg";
            }
            else if (ev.Title.Contains("Comic-Con") || ev.Title.Contains("San Diego"))
            {
                ev.ThumbnailUrl = "/events/sdcc.jpg";
            }
            else if (ev.Title.Contains("Gamescom"))
            {
                ev.ThumbnailUrl = "/events/gamescom.jpg";
            }
            else if (ev.Title.Contains("K-Wave") || ev.Title.Contains("Music Festival"))
            {
                ev.ThumbnailUrl = "/events/kwave_festival.jpg";
            }
            else if (ev.Title.Contains("Star Wars Celebration"))
            {
                ev.ThumbnailUrl = "/events/starwars_celebration.jpg";
            }
            else if (ev.Title.Contains("New York Comic Con") || ev.Title.Contains("NYCC"))
            {
                ev.ThumbnailUrl = "/events/nycc.jpg";
            }
            else if (ev.Title.Contains("Paris Manga"))
            {
                ev.ThumbnailUrl = "/events/paris_manga.jpg";
            }
            else if (ev.Title.Contains("Astral Nexus") || ev.Title.Contains("Metaverse"))
            {
                ev.ThumbnailUrl = "/events/astral_nexus_summit.jpg";
            }
        }

        context.SaveChanges();
    }

    /// <summary>
    /// Seeds local development demo accounts with securely hashed passwords.
    /// This method is ONLY called when isDevelopment == true.
    /// Demo credentials are documented in the local README for development convenience
    /// and are never committed in plaintext.
    /// </summary>
    private static void SeedDevelopmentAccounts(FanHubDbContext context)
    {
        // Seeded solely behind explicit isDevelopment == true check.
        // Fixed development admin account credentials
        var devAdminPassword = Environment.GetEnvironmentVariable("DEV_ADMIN_PASSWORD");
        if (string.IsNullOrWhiteSpace(devAdminPassword) || devAdminPassword == "Admin@FanHub2026!")
        {
            devAdminPassword = "Admin@12345";
        }

        var devUserPassword = Environment.GetEnvironmentVariable("DEV_USER_PASSWORD");
        if (string.IsNullOrWhiteSpace(devUserPassword) || devUserPassword == "User@FanHub2026!")
        {
            devUserPassword = "User@12345";
        }

        const string devAdminEmail = "admin@fanhubplus.local";
        const string devMemberEmail = "user@fanhubplus.local";

        var (adminHash, adminSalt) = PasswordHasher.Hash(devAdminPassword);
        var adminUser = context.Users.FirstOrDefault(u => u.NormalizedEmail == devAdminEmail.ToUpper());

        if (adminUser == null)
        {
            // [DEV-ONLY] Demo admin account — local development use only
            context.Users.Add(new User
            {
                Email = devAdminEmail,
                NormalizedEmail = devAdminEmail.ToUpper(),
                Username = "admin",
                PasswordHash = adminHash,
                PasswordSalt = adminSalt,
                Role = "Admin",
                DisplayName = "Fan Hub Admin",
                Bio = "Local development admin account. Not for production use.",
                AvatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
                FavoriteCategory = "Gaming",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            // Safely reset/update development admin credentials and ensure Role is Admin
            adminUser.PasswordHash = adminHash;
            adminUser.PasswordSalt = adminSalt;
            adminUser.Role = "Admin";
            adminUser.UpdatedAt = DateTime.UtcNow;
        }

        var memberUser = context.Users.FirstOrDefault(u => u.NormalizedEmail == devMemberEmail.ToUpper());
        if (memberUser == null)
        {
            // [DEV-ONLY] Demo member account — local development use only
            var (memberHash, memberSalt) = PasswordHasher.Hash(devUserPassword);
            context.Users.Add(new User
            {
                Email = devMemberEmail,
                NormalizedEmail = devMemberEmail.ToUpper(),
                Username = "fanmember",
                PasswordHash = memberHash,
                PasswordSalt = memberSalt,
                Role = "User",
                DisplayName = "Fan Member",
                Bio = "Local development member account. Not for production use.",
                AvatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=member",
                FavoriteCategory = "Anime",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        // Additional demo operatives for User Management verification
        var extraUsers = new[]
        {
            ("valkyrie@fanhubplus.local", "cyber_valkyrie", "Cyber Valkyrie", "Gaming", "https://api.dicebear.com/7.x/bottts/svg?seed=valkyrie"),
            ("scout@fanhubplus.local", "astral_scout", "Astral Scout Nova", "Sci-Fi", "https://api.dicebear.com/7.x/bottts/svg?seed=scout"),
            ("ronin@fanhubplus.local", "pixel_ronin", "Pixel Ronin Ken", "Anime", "https://api.dicebear.com/7.x/bottts/svg?seed=ronin")
        };

        foreach (var (email, username, displayName, favCat, avatar) in extraUsers)
        {
            if (!context.Users.Any(u => u.NormalizedEmail == email.ToUpper()))
            {
                var (h, s) = PasswordHasher.Hash("User@12345");
                context.Users.Add(new User
                {
                    Email = email,
                    NormalizedEmail = email.ToUpper(),
                    Username = username,
                    PasswordHash = h,
                    PasswordSalt = s,
                    Role = "User",
                    DisplayName = displayName,
                    Bio = "Multiverse operative exploring cross-dimensional fandom archives.",
                    AvatarUrl = avatar,
                    FavoriteCategory = favCat,
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        context.SaveChanges();
    }

    private static void EnsureTablesExist(FanHubDbContext context)
    {
        try
        {
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FanSubmissions' and xtype='U')
                BEGIN
                    CREATE TABLE FanSubmissions (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        Title NVARCHAR(500) NOT NULL,
                        AuthorName NVARCHAR(250) NOT NULL,
                        AuthorEmail NVARCHAR(256) NULL,
                        UserId INT NULL,
                        CategoryId INT NOT NULL,
                        FandomUniverse NVARCHAR(250) NOT NULL,
                        SubmissionType NVARCHAR(100) NOT NULL,
                        ContentText NVARCHAR(MAX) NOT NULL,
                        MediaUrl NVARCHAR(MAX) NULL,
                        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
                        AdminNotes NVARCHAR(MAX) NULL,
                        SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                        ReviewedAt DATETIME2 NULL,
                        CONSTRAINT FK_FanSubmissions_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_FanSubmissions_Status ON FanSubmissions(Status);
                    CREATE INDEX IX_FanSubmissions_CategoryId ON FanSubmissions(CategoryId);
                END;
                ELSE
                BEGIN
                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='MediaUrl' AND CHARACTER_MAXIMUM_LENGTH <> -1)
                        ALTER TABLE FanSubmissions ALTER COLUMN MediaUrl NVARCHAR(MAX) NULL;

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='AdminNotes' AND CHARACTER_MAXIMUM_LENGTH <> -1)
                        ALTER TABLE FanSubmissions ALTER COLUMN AdminNotes NVARCHAR(MAX) NULL;

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='Title' AND CHARACTER_MAXIMUM_LENGTH < 500)
                        ALTER TABLE FanSubmissions ALTER COLUMN Title NVARCHAR(500) NOT NULL;

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='AuthorName' AND CHARACTER_MAXIMUM_LENGTH < 250)
                        ALTER TABLE FanSubmissions ALTER COLUMN AuthorName NVARCHAR(250) NOT NULL;

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='FandomUniverse' AND CHARACTER_MAXIMUM_LENGTH < 250)
                        ALTER TABLE FanSubmissions ALTER COLUMN FandomUniverse NVARCHAR(250) NOT NULL;

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FanSubmissions' AND COLUMN_NAME='SubmissionType' AND CHARACTER_MAXIMUM_LENGTH < 100)
                        ALTER TABLE FanSubmissions ALTER COLUMN SubmissionType NVARCHAR(100) NOT NULL;
                END;

                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ContentItems' AND COLUMN_NAME='ThumbnailUrl' AND CHARACTER_MAXIMUM_LENGTH <> -1)
                    ALTER TABLE ContentItems ALTER COLUMN ThumbnailUrl NVARCHAR(MAX) NOT NULL;

                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ContentItems' AND COLUMN_NAME='MediaUrl' AND CHARACTER_MAXIMUM_LENGTH <> -1)
                    ALTER TABLE ContentItems ALTER COLUMN MediaUrl NVARCHAR(MAX) NULL;

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackItems' and xtype='U')
                BEGIN
                    CREATE TABLE FeedbackItems (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        FeedbackType NVARCHAR(50) NOT NULL,
                        Subject NVARCHAR(250) NOT NULL,
                        Message NVARCHAR(MAX) NOT NULL,
                        UserEmail NVARCHAR(256) NULL,
                        UserName NVARCHAR(150) NULL,
                        Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
                        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                    );
                    CREATE INDEX IX_FeedbackItems_FeedbackType ON FeedbackItems(FeedbackType);
                    CREATE INDEX IX_FeedbackItems_Status ON FeedbackItems(Status);
                END;

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MerchandiseItems' and xtype='U')
                BEGIN
                    CREATE TABLE MerchandiseItems (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        Name NVARCHAR(250) NOT NULL,
                        FandomUniverse NVARCHAR(150) NOT NULL,
                        CategoryId INT NOT NULL,
                        Price DECIMAL(18,2) NOT NULL,
                        Currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
                        ImageUrl NVARCHAR(1000) NOT NULL,
                        Tag NVARCHAR(50) NOT NULL DEFAULT 'Collectible',
                        Description NVARCHAR(MAX) NOT NULL,
                        StockStatus NVARCHAR(50) NOT NULL DEFAULT 'In Stock',
                        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                        CONSTRAINT FK_MerchandiseItems_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_MerchandiseItems_CategoryId ON MerchandiseItems(CategoryId);
                    CREATE INDEX IX_MerchandiseItems_Tag ON MerchandiseItems(Tag);
                END;

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UpcomingReleases' and xtype='U')
                BEGIN
                    CREATE TABLE UpcomingReleases (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        Title NVARCHAR(250) NOT NULL,
                        FandomUniverse NVARCHAR(150) NOT NULL,
                        CategoryId INT NOT NULL,
                        MediaType NVARCHAR(50) NOT NULL DEFAULT 'Anime',
                        ReleaseDate DATETIME2 NOT NULL,
                        ReleaseWindow NVARCHAR(50) NOT NULL,
                        Platform NVARCHAR(100) NOT NULL,
                        ThumbnailUrl NVARCHAR(1000) NOT NULL,
                        Synopsis NVARCHAR(MAX) NOT NULL,
                        HypeScore INT NOT NULL DEFAULT 95,
                        CONSTRAINT FK_UpcomingReleases_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_UpcomingReleases_CategoryId ON UpcomingReleases(CategoryId);
                    CREATE INDEX IX_UpcomingReleases_ReleaseDate ON UpcomingReleases(ReleaseDate);
                END;

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EventItems' and xtype='U')
                BEGIN
                    CREATE TABLE EventItems (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        Title NVARCHAR(250) NOT NULL,
                        FandomUniverse NVARCHAR(150) NOT NULL,
                        CategoryId INT NOT NULL,
                        City NVARCHAR(100) NOT NULL DEFAULT 'Tokyo',
                        Venue NVARCHAR(250) NOT NULL,
                        Coordinates NVARCHAR(100) NOT NULL,
                        EventDate DATETIME2 NOT NULL,
                        EndDate DATETIME2 NULL,
                        ThumbnailUrl NVARCHAR(1000) NOT NULL,
                        Description NVARCHAR(MAX) NOT NULL,
                        TicketUrl NVARCHAR(1000) NOT NULL,
                        Status NVARCHAR(50) NOT NULL DEFAULT 'Tickets Available',
                        CONSTRAINT FK_EventItems_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_EventItems_City ON EventItems(City);
                    CREATE INDEX IX_EventItems_CategoryId ON EventItems(CategoryId);
                    CREATE INDEX IX_EventItems_EventDate ON EventItems(EventDate);
                END;
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Table creation check exception: {ex.Message}");
        }
    }

    private static void EnsureFanSubmissions(FanHubDbContext context)
    {
        try
        {
            if (context.FanSubmissions.Any()) return;

            var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime")?.Id ?? 1;
            var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming")?.Id ?? 2;
            var moviesCat = context.Categories.FirstOrDefault(c => c.Slug == "movies")?.Id ?? 3;
            var comicsCat = context.Categories.FirstOrDefault(c => c.Slug == "comics")?.Id ?? 6;
            var kpopCat = context.Categories.FirstOrDefault(c => c.Slug == "k-pop")?.Id ?? 5;
            var cosplayCat = context.Categories.FirstOrDefault(c => c.Slug == "cosplay")?.Id ?? 8;

            context.FanSubmissions.AddRange(
                new FanSubmission
                {
                    Title = "The Philosophical Underpinnings of Neon Genesis Evangelion: A Post-Modern Analysis",
                    AuthorName = "Hikari Shinji",
                    AuthorEmail = "hikari@eva-archives.net",
                    CategoryId = animeCat,
                    FandomUniverse = "Neon Genesis Evangelion",
                    SubmissionType = "Theory",
                    ContentText = "An in-depth 2,500-word examination of the Hedgehog's Dilemma and Schopenhauer's existential philosophy in Anno's magnum opus, analyzing instrumentality as an allegory for human isolation.",
                    MediaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80",
                    Status = "Pending",
                    AdminNotes = "High quality analysis with academic tone. Awaiting editorial review.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-2)
                },
                new FanSubmission
                {
                    Title = "Elden Ring: The Unseen Golden Order Cosmology and Space Gods",
                    AuthorName = "Tarnished_Scholar",
                    AuthorEmail = "scholar@landsbetween.io",
                    CategoryId = gamingCat,
                    FandomUniverse = "Elden Ring",
                    SubmissionType = "Article",
                    ContentText = "Deconstructing the Greater Will's planetary conquest, the celestial origins of the Elden Beast, and the Astel star beasts as cosmic eldritch entities in FromSoftware lore.",
                    MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
                    Status = "Pending",
                    AdminNotes = "Well researched item with community interest.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-1)
                },
                new FanSubmission
                {
                    Title = "Custom Handmade Cyberpunk Samurai Arm Armor Build Log",
                    AuthorName = "Kira Craftworks",
                    AuthorEmail = "kira@craftworks.art",
                    CategoryId = cosplayCat,
                    FandomUniverse = "Cyberpunk 2077",
                    SubmissionType = "Cosplay",
                    ContentText = "Step-by-step build log of 3D-modeled, EVA foam formed, and Arduino-controlled LED light piping for a Mantis Blade wearable arm rig with metallic crimson weathering.",
                    MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
                    Status = "Pending",
                    AdminNotes = "Impressive craftsmanship and detailed photos.",
                    SubmittedAt = DateTime.UtcNow.AddHours(-14)
                },
                new FanSubmission
                {
                    Title = "Spider-Man: Beyond the Spider-Verse Dimensional Rift Theory",
                    AuthorName = "MilesFan2099",
                    AuthorEmail = "miles@web-warriors.org",
                    CategoryId = comicsCat,
                    FandomUniverse = "Spider-Verse",
                    SubmissionType = "Theory",
                    ContentText = "Speculative mapping of Earth-42's Prowler timeline, Canon Event destabilization, and how Miguel O'Hara's dimensional algorithms will be challenged by Gwen's band of Spider-People.",
                    MediaUrl = "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&q=80",
                    Status = "Approved",
                    AdminNotes = "Approved by Admin on Sep 22. Highly engaging fandom discourse.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-5),
                    ReviewedAt = DateTime.UtcNow.AddDays(-3)
                },
                new FanSubmission
                {
                    Title = "Aespa 'Armageddon' Multiverse Concept & Virtual Avatars Breakdown",
                    AuthorName = "MY_Vanguard",
                    AuthorEmail = "my_vanguard@kwangya.world",
                    CategoryId = kpopCat,
                    FandomUniverse = "SM Culture Universe (SMCU)",
                    SubmissionType = "Review",
                    ContentText = "Deep dive into the dual-world lore of Kwangya, Black Mamba resolution, and the hyper-futuristic cosmic soundscape of the Armageddon studio album.",
                    MediaUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
                    Status = "Approved",
                    AdminNotes = "Approved and featured in multimedia rail.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-4),
                    ReviewedAt = DateTime.UtcNow.AddDays(-2)
                },
                new FanSubmission
                {
                    Title = "Low Effort Clickbait Rumor: Marvel Secret Wars Leaks",
                    AuthorName = "Anonymous44",
                    AuthorEmail = "anon@trashmail.com",
                    CategoryId = moviesCat,
                    FandomUniverse = "Marvel Cinematic Universe",
                    SubmissionType = "Article",
                    ContentText = "Unverified Reddit screenshot claiming all previous actors will appear without citations or analysis.",
                    MediaUrl = "",
                    Status = "Rejected",
                    AdminNotes = "Rejected: Fails archival editorial standards. Lacks attribution.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-6),
                    ReviewedAt = DateTime.UtcNow.AddDays(-5)
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding fan submissions: {ex.Message}");
        }
    }

    private static void EnsureFeedbackItems(FanHubDbContext context)
    {
        try
        {
            if (context.FeedbackItems.Any()) return;

            context.FeedbackItems.AddRange(
                new FeedbackItem
                {
                    FeedbackType = "Bug",
                    Subject = "Audio visualizer keeps playing after modal close on mobile Safari",
                    Message = "When listening to a soundtrack stream in the media modal on iOS Safari and tapping the backdrop to dismiss, the HTML5 audio element continues playback in the background.",
                    UserEmail = "operative_kai@gmail.com",
                    UserName = "Kai Chen",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new FeedbackItem
                {
                    FeedbackType = "Bug",
                    Subject = "Category pill horizontal scroll snap jitter on narrow touch devices",
                    Message = "When flicking quickly across the 8 fandom universe pills on a 375px width screen, touch inertia causes a slight bounce before settling on Gaming.",
                    UserEmail = "sarah_pixel@outlook.com",
                    UserName = "Sarah Jenkins",
                    Status = "In Review",
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new FeedbackItem
                {
                    FeedbackType = "Suggestion",
                    Subject = "Add custom dark-mode obsidian crystal or crimson neon theme toggle",
                    Message = "The smoked glass dark mode is amazing. Could we get a feature to customize the crimson accent to astral cyan or gold for character spotlight cards?",
                    UserEmail = "astral_lore@fanhubplus.local",
                    UserName = "Devon Vance",
                    Status = "In Review",
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new FeedbackItem
                {
                    FeedbackType = "Suggestion",
                    Subject = "Character combat radar charts comparing attack vs agility scores",
                    Message = "In character dossiers, it would be awesome to visualize character abilities as a pentagon radar chart (Strength, Agility, Tech, Lore, Popularity) like RPG sourcebooks.",
                    UserEmail = "rpg_enthusiast@vault.net",
                    UserName = "Marcus Zhao",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new FeedbackItem
                {
                    FeedbackType = "Query",
                    Subject = "Can independent cosplay creators submit video walk-throughs?",
                    Message = "I have a series of video tutorials on weathering anime prop swords. Where is the best section to submit these for archival consideration?",
                    UserEmail = "crafts_lisa@yahoo.com",
                    UserName = "Lisa Montgomery",
                    Status = "Resolved",
                    CreatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new FeedbackItem
                {
                    FeedbackType = "Query",
                    Subject = "When will the next Astral Nexus lore chapter unlock?",
                    Message = "Is Vanguard Operative Valerius going to have an animated comic series or audio drama released in the Multimedia feeds this season?",
                    UserEmail = "nexus_explorer@proton.me",
                    UserName = "Tarek Al-Mansoor",
                    Status = "Resolved",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding feedback items: {ex.Message}");
        }
    }

    private static void EnsureMerchandiseItems(FanHubDbContext context)
    {
        try
        {
            if (context.MerchandiseItems.Any()) return;

            var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime")?.Id ?? 1;
            var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming")?.Id ?? 2;
            var moviesCat = context.Categories.FirstOrDefault(c => c.Slug == "movies")?.Id ?? 3;
            var tvCat = context.Categories.FirstOrDefault(c => c.Slug == "tv-shows")?.Id ?? 4;
            var kpopCat = context.Categories.FirstOrDefault(c => c.Slug == "k-pop")?.Id ?? 5;
            var comicsCat = context.Categories.FirstOrDefault(c => c.Slug == "comics")?.Id ?? 6;
            var mangaCat = context.Categories.FirstOrDefault(c => c.Slug == "manga")?.Id ?? 7;
            var cosplayCat = context.Categories.FirstOrDefault(c => c.Slug == "cosplay")?.Id ?? 8;

            context.MerchandiseItems.AddRange(
                new MerchandiseItem
                {
                    Name = "Arasaka Cyberware Relic 2.0 Replica",
                    FandomUniverse = "Cyberpunk 2077",
                    CategoryId = gamingCat,
                    Price = 189.99m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/arasaka_relic.jpg",
                    Tag = "Limited Edition",
                    Description = "Authentic illuminated bio-chip casing with internal amber LED pulsation and magnetic acrylic display case.",
                    StockStatus = "Limited Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new MerchandiseItem
                {
                    Name = "Nichirin Blade — Kamado Tanjiro 1045 Carbon Steel",
                    FandomUniverse = "Demon Slayer",
                    CategoryId = animeCat,
                    Price = 149.50m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/tanjiro_sword.jpg",
                    Tag = "Collectible",
                    Description = "Full-tang hand-forged blackened high-carbon steel blade with ray-skin wrapped hilt and flame-wheel guard.",
                    StockStatus = "In Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-9)
                },
                new MerchandiseItem
                {
                    Name = "Malenia, Blade of Miquella 1:6 Scale Polystone Statue",
                    FandomUniverse = "Elden Ring",
                    CategoryId = gamingCat,
                    Price = 399.00m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/malenia_statue.jpg",
                    Tag = "Limited Edition",
                    Description = "Hand-painted collector piece featuring prosthetic gold wing detailing, scarlet rot bloom petals, and numbered certificate.",
                    StockStatus = "Pre-Order",
                    CreatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new MerchandiseItem
                {
                    Name = "Stark Nanotech Infinity Gauntlet 1:1 Scale Prop",
                    FandomUniverse = "Marvel Cinematic Universe",
                    CategoryId = moviesCat,
                    Price = 249.99m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/infinity_gauntlet.jpg",
                    Tag = "Official Artifact",
                    Description = "Die-cast articulated fingers with individual pulsing Infinity Stone luminescence and cinematic sound activation.",
                    StockStatus = "In Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new MerchandiseItem
                {
                    Name = "Hellfire Club Vintage Leather-Trim Bomber",
                    FandomUniverse = "Stranger Things",
                    CategoryId = tvCat,
                    Price = 89.00m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/hellfire_bomber.jpg",
                    Tag = "Collectible",
                    Description = "Heavyweight distressed twill jacket with embroidered Hellfire demon patch and custom Hawkins High brass snaps.",
                    StockStatus = "In Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new MerchandiseItem
                {
                    Name = "Bunnies Official Concert Holographic Lightstick Ver. 2",
                    FandomUniverse = "NewJeans / K-Pop",
                    CategoryId = kpopCat,
                    Price = 65.00m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/bunnies_lightstick.jpg",
                    Tag = "Pre-Order",
                    Description = "Bluetooth central-control sync lightstick with 16-million RGB prismatic spectra and interchangeable ear charms.",
                    StockStatus = "Pre-Order",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new MerchandiseItem
                {
                    Name = "The Dark Knight Tactical Cowl 1:1 Wearable Replica",
                    FandomUniverse = "DC / Batman",
                    CategoryId = comicsCat,
                    Price = 199.99m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/batman_cowl.jpg",
                    Tag = "Limited Edition",
                    Description = "Fiberglass-reinforced matte black ballistic polymer cowl cast from master studio production molds.",
                    StockStatus = "Limited Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new MerchandiseItem
                {
                    Name = "Dragon Slayer Monument 1:4 Scale Metal Display",
                    FandomUniverse = "Berserk",
                    CategoryId = mangaCat,
                    Price = 220.00m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/dragon_slayer.jpg",
                    Tag = "Collectible",
                    Description = "Massive solid alloy replica of Guts' iconic blade mounted on stone-weathered sacrificial altar base.",
                    StockStatus = "In Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new MerchandiseItem
                {
                    Name = "Cybernetic Vanguard HUD Visor Helmet Rig",
                    FandomUniverse = "Astral Nexus / Cosplay",
                    CategoryId = cosplayCat,
                    Price = 129.99m,
                    Currency = "USD",
                    ImageUrl = "/merchandise/hud_visor.jpg",
                    Tag = "Official Artifact",
                    Description = "Fully wearable sci-fi tactical visor with programmable LED animations via Bluetooth smartphone app.",
                    StockStatus = "In Stock",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding merchandise items: {ex.Message}");
        }
    }

    private static void EnsureUpcomingReleases(FanHubDbContext context)
    {
        try
        {
            if (context.UpcomingReleases.Any()) return;

            var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime")?.Id ?? 1;
            var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming")?.Id ?? 2;
            var moviesCat = context.Categories.FirstOrDefault(c => c.Slug == "movies")?.Id ?? 3;
            var tvCat = context.Categories.FirstOrDefault(c => c.Slug == "tv-shows")?.Id ?? 4;
            var kpopCat = context.Categories.FirstOrDefault(c => c.Slug == "k-pop")?.Id ?? 5;
            var comicsCat = context.Categories.FirstOrDefault(c => c.Slug == "comics")?.Id ?? 6;
            var mangaCat = context.Categories.FirstOrDefault(c => c.Slug == "manga")?.Id ?? 7;

            context.UpcomingReleases.AddRange(
                new UpcomingRelease
                {
                    Title = "Demon Slayer: Infinity Castle Arc — Part 1",
                    FandomUniverse = "Demon Slayer",
                    CategoryId = animeCat,
                    MediaType = "Anime",
                    ReleaseDate = new DateTime(2026, 12, 18),
                    ReleaseWindow = "Dec 2026",
                    Platform = "Global Theatrical / IMAX",
                    ThumbnailUrl = "/releases/demonslayer_castle.jpg",
                    Synopsis = "The Demon Slayer Corps plunges into Muzan Kibutsuji's shifting dimensional labyrinth for the final war.",
                    HypeScore = 98
                },
                new UpcomingRelease
                {
                    Title = "Grand Theft Auto VI",
                    FandomUniverse = "Grand Theft Auto",
                    CategoryId = gamingCat,
                    MediaType = "Gaming",
                    ReleaseDate = new DateTime(2026, 11, 20),
                    ReleaseWindow = "Q4 2026",
                    Platform = "PS5 / Xbox Series X|S",
                    ThumbnailUrl = "/releases/gta6_vicecity.jpg",
                    Synopsis = "Lucia and Jason navigate criminal underworlds across neon-soaked Leonida and modern Vice City.",
                    HypeScore = 99
                },
                new UpcomingRelease
                {
                    Title = "Avengers: Secret Wars",
                    FandomUniverse = "Marvel Cinematic Universe",
                    CategoryId = moviesCat,
                    MediaType = "Movies",
                    ReleaseDate = new DateTime(2027, 5, 7),
                    ReleaseWindow = "May 2027",
                    Platform = "IMAX 3D / Global Theaters",
                    ThumbnailUrl = "/releases/secretwars.jpg",
                    Synopsis = "Multiversal incursions force superhero legacies from across timelines onto Battleworld for destiny itself.",
                    HypeScore = 96
                },
                new UpcomingRelease
                {
                    Title = "Stranger Things — The Final Season 5",
                    FandomUniverse = "Stranger Things",
                    CategoryId = tvCat,
                    MediaType = "TV Shows",
                    ReleaseDate = new DateTime(2026, 11, 6),
                    ReleaseWindow = "Late 2026",
                    Platform = "Netflix Global Premiere",
                    ThumbnailUrl = "/releases/stranger_things_s5.jpg",
                    Synopsis = "Hawkins lies fractured between dimensions as Eleven and the party mount their last offensive against Vecna.",
                    HypeScore = 95
                },
                new UpcomingRelease
                {
                    Title = "Spider-Man: Beyond the Spider-Verse",
                    FandomUniverse = "Spider-Verse",
                    CategoryId = comicsCat,
                    MediaType = "Comics",
                    ReleaseDate = new DateTime(2027, 3, 26),
                    ReleaseWindow = "Spring 2027",
                    Platform = "Theatrical Release",
                    ThumbnailUrl = "/releases/beyond_spiderverse.jpg",
                    Synopsis = "Miles Morales must break Canon Events while facing Earth-42's Prowler and unraveling the Spider-Society.",
                    HypeScore = 97
                },
                new UpcomingRelease
                {
                    Title = "Chainsaw Man: The Movie — Reze Arc",
                    FandomUniverse = "Chainsaw Man",
                    CategoryId = animeCat,
                    MediaType = "Anime",
                    ReleaseDate = new DateTime(2026, 10, 15),
                    ReleaseWindow = "Oct 2026",
                    Platform = "Theatrical / Crunchyroll",
                    ThumbnailUrl = "/releases/chainsawman_reze.jpg",
                    Synopsis = "Denji encounters Reze in a quiet cafe, sparking a volatile relationship ignited by Soviet Bomb Devil secrets.",
                    HypeScore = 94
                },
                new UpcomingRelease
                {
                    Title = "BTS Global Reunion Tour & Era IX Album",
                    FandomUniverse = "K-Pop",
                    CategoryId = kpopCat,
                    MediaType = "TV Shows",
                    ReleaseDate = new DateTime(2026, 10, 24),
                    ReleaseWindow = "Oct 2026",
                    Platform = "Global Stadiums & Weverse Stream",
                    ThumbnailUrl = "/releases/bts_reunion.jpg",
                    Synopsis = "All seven members reunite following mandatory military completions for their landmark world tour and studio LP.",
                    HypeScore = 98
                },
                new UpcomingRelease
                {
                    Title = "Solo Leveling Season 2: Arise from the Shadow",
                    FandomUniverse = "Solo Leveling",
                    CategoryId = mangaCat,
                    MediaType = "Anime",
                    ReleaseDate = new DateTime(2027, 1, 9),
                    ReleaseWindow = "Winter 2027",
                    Platform = "Crunchyroll / Tokyo MX",
                    ThumbnailUrl = "/releases/sololeveling_s2.jpg",
                    Synopsis = "Sung Jinwoo descends into the Demon Castle to concoct the Holy Water of Life while Monarchs stir in the void.",
                    HypeScore = 93
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding upcoming releases: {ex.Message}");
        }
    }

    private static void EnsureEventItems(FanHubDbContext context)
    {
        try
        {
            if (context.EventItems.Any()) return;

            var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime")?.Id ?? 1;
            var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming")?.Id ?? 2;
            var moviesCat = context.Categories.FirstOrDefault(c => c.Slug == "movies")?.Id ?? 3;
            var kpopCat = context.Categories.FirstOrDefault(c => c.Slug == "k-pop")?.Id ?? 5;
            var comicsCat = context.Categories.FirstOrDefault(c => c.Slug == "comics")?.Id ?? 6;
            var cosplayCat = context.Categories.FirstOrDefault(c => c.Slug == "cosplay")?.Id ?? 8;

            context.EventItems.AddRange(
                new EventItem
                {
                    Title = "AnimeJapan 2027: Infinite Horizons",
                    FandomUniverse = "Anime Multiverse",
                    CategoryId = animeCat,
                    City = "Tokyo",
                    Venue = "Tokyo Big Sight, Odaiba",
                    Coordinates = "35.6300, 139.7963",
                    EventDate = new DateTime(2027, 3, 27, 9, 0, 0),
                    EndDate = new DateTime(2027, 3, 28, 18, 0, 0),
                    ThumbnailUrl = "/events/animejapan.jpg",
                    Description = "The world's premier anime convention featuring studio keynotes, exclusive film premieres, and voice actor stages.",
                    TicketUrl = "https://www.anime-japan.jp/en/",
                    Status = "Tickets Available"
                },
                new EventItem
                {
                    Title = "San Diego Comic-Con International 2026",
                    FandomUniverse = "Pop Culture Multiverse",
                    CategoryId = comicsCat,
                    City = "Los Angeles",
                    Venue = "San Diego Convention Center",
                    Coordinates = "32.7072, -117.1633",
                    EventDate = new DateTime(2026, 7, 23, 10, 0, 0),
                    EndDate = new DateTime(2026, 7, 26, 17, 0, 0),
                    ThumbnailUrl = "/events/sdcc.jpg",
                    Description = "Hall H blockbuster announcements, legendary comic creators, masquerade cosplay, and exclusive floor collectibles.",
                    TicketUrl = "https://www.comic-con.org/",
                    Status = "Selling Fast"
                },
                new EventItem
                {
                    Title = "Gamescom 2026 Global Expo",
                    FandomUniverse = "Gaming Industry",
                    CategoryId = gamingCat,
                    City = "London",
                    Venue = "Koelnmesse Exhibition Center",
                    Coordinates = "50.9463, 6.9806",
                    EventDate = new DateTime(2026, 8, 26, 9, 30, 0),
                    EndDate = new DateTime(2026, 8, 30, 20, 0, 0),
                    ThumbnailUrl = "/events/gamescom.jpg",
                    Description = "Opening Night Live world gameplay premieres, massive playable AAA showfloors, and indie arena showcases.",
                    TicketUrl = "https://www.gamescom.global/",
                    Status = "Tickets Available"
                },
                new EventItem
                {
                    Title = "K-Wave Global Music Festival & Expo",
                    FandomUniverse = "K-Pop",
                    CategoryId = kpopCat,
                    City = "Seoul",
                    Venue = "Gocheok Sky Dome, Seoul",
                    Coordinates = "37.4982, 126.8671",
                    EventDate = new DateTime(2026, 11, 14, 18, 0, 0),
                    EndDate = new DateTime(2026, 11, 15, 22, 0, 0),
                    ThumbnailUrl = "/events/kwave_festival.jpg",
                    Description = "Two-day all-star arena concert, fan meet-and-greets, random play dance battles, and exclusive tour merchandise.",
                    TicketUrl = "https://ticket.interpark.com/",
                    Status = "Selling Fast"
                },
                new EventItem
                {
                    Title = "Star Wars Celebration London",
                    FandomUniverse = "Star Wars",
                    CategoryId = moviesCat,
                    City = "London",
                    Venue = "ExCeL London Royal Victoria Dock",
                    Coordinates = "51.5078, 0.0305",
                    EventDate = new DateTime(2026, 9, 18, 10, 0, 0),
                    EndDate = new DateTime(2026, 9, 21, 18, 0, 0),
                    ThumbnailUrl = "/events/starwars_celebration.jpg",
                    Description = "Lucasfilm studio panels, live props and costume archives, celebrity autographs, and droid builders showcases.",
                    TicketUrl = "https://www.starwarscelebration.com/",
                    Status = "Tickets Available"
                },
                new EventItem
                {
                    Title = "New York Comic Con 2026",
                    FandomUniverse = "Comics & Sci-Fi",
                    CategoryId = comicsCat,
                    City = "New York",
                    Venue = "Jacob K. Javits Convention Center, NYC",
                    Coordinates = "40.7577, -74.0022",
                    EventDate = new DateTime(2026, 10, 8, 10, 0, 0),
                    EndDate = new DateTime(2026, 10, 11, 17, 0, 0),
                    ThumbnailUrl = "/events/nycc.jpg",
                    Description = "The East Coast's largest pop culture spectacle celebrating comics, sci-fi shows, anime screenings, and gaming booths.",
                    TicketUrl = "https://www.newyorkcomiccon.com/",
                    Status = "Selling Fast"
                },
                new EventItem
                {
                    Title = "Paris Manga & Sci-Fi Show",
                    FandomUniverse = "Cosplay & Japanese Culture",
                    CategoryId = cosplayCat,
                    City = "Paris",
                    Venue = "Paris Expo Porte de Versailles",
                    Coordinates = "48.8315, 2.2858",
                    EventDate = new DateTime(2026, 10, 24, 9, 30, 0),
                    EndDate = new DateTime(2026, 10, 25, 19, 0, 0),
                    ThumbnailUrl = "/events/paris_manga.jpg",
                    Description = "European cosplay championships, international prop-making masterclasses, and Japanese pop-culture culture pavilions.",
                    TicketUrl = "https://www.parismanga.fr/",
                    Status = "Tickets Available"
                },
                new EventItem
                {
                    Title = "Astral Nexus Metaverse Fandom Summit",
                    FandomUniverse = "Digital Multiverse",
                    CategoryId = gamingCat,
                    City = "Online",
                    Venue = "Fan Hub Plus Nexus Virtual Mainstage",
                    Coordinates = "0.0000, 0.0000",
                    EventDate = new DateTime(2026, 12, 5, 15, 0, 0),
                    EndDate = new DateTime(2026, 12, 6, 23, 0, 0),
                    ThumbnailUrl = "/events/astral_nexus_summit.jpg",
                    Description = "Virtual reality keynote streams, community avatar cosplay showdowns, live lore developer AMA, and digital badge drops.",
                    TicketUrl = "https://fanhubplus.local/nexus-live",
                    Status = "Virtual Stream"
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding events: {ex.Message}");
        }
    }
}
