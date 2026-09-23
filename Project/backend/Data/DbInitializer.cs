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

        SeedCategories(context);
        SeedCharacters(context);
        SeedMediaItems(context);

        // Audit and repair existing seed records to ensure clean URLs and no Rick Astley embeds
        AuditAndRepairSeedData(context);

        // Demo accounts are seeded ONLY in the local Development environment.
        // They are never created in Staging, Production, or any other environment.
        if (isDevelopment)
        {
            SeedDevelopmentAccounts(context);
        }
    }

    private static void SeedCategories(FanHubDbContext context)
    {
        if (context.Categories.Any())
        {
            return; // Categories already seeded
        }

        // 1. Seed Mandatory 8 Fandom Categories
        var categories = new[]
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

        context.Categories.AddRange(categories);
        context.SaveChanges();

        // Map for easy category referencing
        var animeCat = categories.First(c => c.Slug == "anime");
        var gamingCat = categories.First(c => c.Slug == "gaming");
        var moviesCat = categories.First(c => c.Slug == "movies");
        var kpopCat = categories.First(c => c.Slug == "k-pop");
        var comicsCat = categories.First(c => c.Slug == "comics");
        var cosplayCat = categories.First(c => c.Slug == "cosplay");

        // 2. Seed Clearly Identified Demo Dataset
        var demoItems = new[]
        {
            new ContentItem
            {
                CategoryId = gamingCat.Id,
                Title = "Night City Chronicles: The Neural Architecture of Cyberpunk 2077",
                FandomUniverse = "Cyberpunk Universe",
                ContentType = "Article",
                Description = "An in-depth retrospective analyzing the architectural worldbuilding, synthwave soundscapes, and narrative redemption arc of Night City.",
                ContentText = "Night City stands as one of the most intricately realized speculative urban landscapes in digital entertainment history. From the towering megabuildings of Watson to the neon-drenched luxury corridors of City Center, the district designs reflect stark socio-economic divides.\n\n### Environmental Storytelling\nThe developers layered decades of pen-and-paper lore directly into physical architecture. Every alleyway features custom graffiti, discarded cyberware boxes, and dynamic holographic advertising billboards that react to pedestrian traffic.\n\n### The Future of the Franchise\nWith Project Orion entering pre-production in Boston and Vancouver, fans anticipate deeper braindance mechanics, enhanced neural combat systems, and seamless orbital station exploration.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85",
                Author = "Elena Vance (Nexus Lead Archivist)",
                Tags = "Sci-Fi, RPG, Cyberpunk, Worldbuilding",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 11, 14, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentItem
            {
                CategoryId = animeCat.Id,
                Title = "Domain Expansion Breakdown: Spectral Geometries in Modern Shonen",
                FandomUniverse = "Jujutsu Kaisen",
                ContentType = "Video",
                Description = "A masterclass visual explainer dissecting barrier techniques, sure-hit conditions, and mythological symbolism in contemporary sorcery animation.",
                ContentText = "The concept of an innate domain brought into the real world transformed modern action choreography. By forcing combatants into an enclosed pocket dimension where the caster's cursed technique is inherently guaranteed to land, encounters turn into high-stakes chess matches.\n\n### Mathematical Precision in Choreography\nKey animators deployed isometric camera angles and non-Euclidean geometry to visualize the expansion boundary collapsing upon reality.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                MediaUrl = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
                Author = "Ren Fujisaki",
                Tags = "Shonen, Animation, Sorcery, Battle Analysis",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentItem
            {
                CategoryId = moviesCat.Id,
                Title = "The Interstellar Tapestry: Practical Miniatures vs. Physical Simulation",
                FandomUniverse = "Sci-Fi Cinema",
                ContentType = "Article",
                Description = "How modern cinema masters combine massive practical sets with general relativistic physics rendering to produce believable cosmos odysseys.",
                ContentText = "Grounded science fiction operates on the boundary between astronomical fact and operatic drama. When rendering accretion disks around Kerr black holes, the production team worked alongside theoretical physicists to calculate ray tracing equations for gravitational lensing.\n\n### Practical Spacecraft Rigs\nRather than green screens, the crew projected high-resolution space backgrounds directly onto 360-degree cylindrical projection screens wrapping around the cockpit modules.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Sci-Fi, Cinema, Physics, Visual Effects",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentItem
            {
                CategoryId = kpopCat.Id,
                Title = "Symphonic Concept Eras: Decoding the Lore of K-Pop Alternative Universes",
                FandomUniverse = "Global Pop Universe",
                ContentType = "Audio",
                Description = "A deep auditory dive exploring orchestral leitmotifs, futuristic time-travel narratives, and cross-album storyline continuity.",
                ContentText = "Modern pop acts have evolved into multimedia worldbuilders. Through connected music video trilogies, webtoons, and ARG clues tucked into album inserts, fans assemble vast interconnected mythologies.\n\n### Production Nuance\nProducers weave traditional instruments like the gayageum alongside gritty 808 sub-bass, establishing a sonic signature that straddles historical heritage and cybernetic futurism.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
                MediaUrl = "https://soundcloud.com/stream",
                Author = "Min-ji Park",
                Tags = "Music, Soundtracks, ARG, Fan Lore",
                PopularityScore = 89,
                ReleaseDate = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentItem
            {
                CategoryId = comicsCat.Id,
                Title = "The Crisis Architecture: How Infinite Earths Shaped Modern Continuity",
                FandomUniverse = "Multiverse Comics",
                ContentType = "Article",
                Description = "Tracing how 1980s editorial ambition birthed the modern comic company crossover event and defined comic storytelling for 40 years.",
                ContentText = "Before 1985, comic books maintained disparate parallel timelines with distinct generational heroes. The decision to collapse infinite earths into a singular unified history required unprecedented synchronization across dozens of monthly publishing titles.\n\n### The Legacy of the Cosmic Crossover\nThe storytelling paradigm forged in that era directly informs the interconnected cinematic universes that dominate box offices today.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Comics, Multiverse, Crossover, Golden Age",
                PopularityScore = 87,
                ReleaseDate = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentItem
            {
                CategoryId = cosplayCat.Id,
                Title = "Thermoplastic Alchemy: Fabricating Mech Armor for World Cosplay Summit",
                FandomUniverse = "Cosplay Craft Guild",
                ContentType = "Image",
                Description = "A visual step-by-step masterclass showcasing high-density EVA foam shaping, LED pneumatic conduits, and weathering paint techniques.",
                ContentText = "Creating wearable mechanical armor requires an engineer's eye for articulation and a sculptor's touch for form. High-density EVA foam heated with variable-temp heat guns forms the base chassis.\n\n### Priming and Chrome Buffing\nApplying high-gloss black enamel before graphite powder buffing creates realistic brushed titanium reflections that catch stage lighting with authentic metallic presence.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Cosplay, Props, EVA Foam, Crafting Guide",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.ContentItems.AddRange(demoItems);
        context.SaveChanges();
    }

    private static void SeedCharacters(FanHubDbContext context)
    {
        if (context.Characters.Any()) return;

        var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime");
        var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming");
        var comicsCat = context.Categories.FirstOrDefault(c => c.Slug == "comics");

        if (animeCat == null || gamingCat == null) return;

        var characters = new[]
        {
            new Character
            {
                CategoryId = gamingCat.Id,
                Name = "Johnny Silverhand",
                FandomUniverse = "Cyberpunk Universe",
                RoleTitle = "Rockerboy & Digital Ghost",
                Bio = "Legendary frontman of Samurai and notorious anti-corporate rebel who fought Arasaka to the bitter end.",
                Abilities = "Charismatic leadership, virtuoso guitarist, cybernetic arm combat, tactical firebrand.",
                Backstory = "Born Robert John Linder, Silverhand served in the Second Central American War before deserting and founding Samurai in 2003.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80",
                OriginUniverse = "Night City (Cyberpunk 2077)",
                VoiceActor = "Keanu Reeves",
                PopularityScore = 99,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Character
            {
                CategoryId = animeCat.Id,
                Name = "Satoru Gojo",
                FandomUniverse = "Jujutsu Kaisen",
                RoleTitle = "Special Grade Sorcerer",
                Bio = "The strongest modern jujutsu sorcerer, bearer of both the Limitless technique and the Six Eyes.",
                Abilities = "Limitless, Infinity barrier, Cursed Technique Reversal: Red, Cursed Technique Lapse: Blue, Hollow Purple, Unlimited Void.",
                Backstory = "Born into the prestigious Gojo clan, his birth fundamentally shifted the balance of power in the sorcery world.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=80",
                OriginUniverse = "Tokyo Metropolitan Jujutsu Technical High School",
                VoiceActor = "Yuichi Nakamura",
                PopularityScore = 98,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Character
            {
                CategoryId = (comicsCat ?? gamingCat).Id,
                Name = "Geralt of Rivia",
                FandomUniverse = "The Witcher",
                RoleTitle = "Witcher of the School of the Wolf",
                Bio = "Mutated monster slayer for hire known as the White Wolf or Butcher of Blaviken.",
                Abilities = "Superhuman reflexes, toxicity tolerance, Witcher Signs (Aard, Igni, Quen, Axii, Yrden), expert swordsmanship.",
                Backstory = "Surviving the grueling Trial of the Grasses at Kaer Morhen, Geralt roams the Continent navigating the lesser of evils.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80",
                OriginUniverse = "The Continent",
                VoiceActor = "Doug Cockle",
                PopularityScore = 96,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Characters.AddRange(characters);
        context.SaveChanges();
    }

    private static void SeedMediaItems(FanHubDbContext context)
    {
        if (context.MediaItems.Any()) return;

        var animeCat = context.Categories.FirstOrDefault(c => c.Slug == "anime");
        var gamingCat = context.Categories.FirstOrDefault(c => c.Slug == "gaming");
        var moviesCat = context.Categories.FirstOrDefault(c => c.Slug == "movies");

        if (animeCat == null || gamingCat == null) return;

        var media = new[]
        {
            new MediaItem
            {
                CategoryId = gamingCat.Id,
                Title = "Cyberpunk 2077 — Official E3 2019 Cinematic Trailer",
                FandomUniverse = "Cyberpunk Universe",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/qIcTM8WXFjk",
                ThumbnailUrl = "https://i.ytimg.com/vi/qIcTM8WXFjk/hqdefault.jpg",
                Description = "Official cinematic trailer by CD PROJEKT RED featuring Johnny Silverhand (Keanu Reeves) in Night City.",
                Tags = "Trailer, Cyberpunk, Cinematic, Johnny Silverhand, CD PROJEKT RED",
                DurationSeconds = 250,
                AverageRating = 4.9,
                RatingsCount = 128,
                CreatedAt = DateTime.UtcNow
            },
            new MediaItem
            {
                CategoryId = animeCat.Id,
                Title = "Jujutsu Kaisen Season 2 Shibuya Incident OP — SPECIALZ (King Gnu)",
                FandomUniverse = "Jujutsu Kaisen",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=fhzKLBZJC3w",
                ThumbnailUrl = "https://img.youtube.com/vi/fhzKLBZJC3w/hqdefault.jpg",
                Description = "Official music video and theme song by King Gnu capturing the Shibuya Incident.",
                Tags = "OST, Shibuya Incident, King Gnu, Official Theme, Soundtrack",
                DurationSeconds = 240,
                AverageRating = 4.8,
                RatingsCount = 95,
                CreatedAt = DateTime.UtcNow
            },
            new MediaItem
            {
                CategoryId = (moviesCat ?? gamingCat).Id,
                Title = "Interstellar OST — No Time For Caution (Hans Zimmer)",
                FandomUniverse = "Sci-Fi Cinema",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=kpK4cDk2bRs",
                ThumbnailUrl = "https://img.youtube.com/vi/kpK4cDk2bRs/hqdefault.jpg",
                Description = "Official soundtrack release by WaterTower Music, composed by Hans Zimmer for the Endurance docking sequence.",
                Tags = "Soundtrack, Hans Zimmer, Sci-Fi, WaterTower Music, Official Release",
                DurationSeconds = 246,
                AverageRating = 5.0,
                RatingsCount = 210,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.MediaItems.AddRange(media);
        context.SaveChanges();
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
                m.Title = "Cyberpunk 2077 — Official E3 2019 Cinematic Trailer";
                m.MediaUrl = "https://www.youtube.com/embed/qIcTM8WXFjk";
                m.ThumbnailUrl = "https://i.ytimg.com/vi/qIcTM8WXFjk/hqdefault.jpg";
                m.Description = "Official cinematic trailer by CD PROJEKT RED featuring Johnny Silverhand (Keanu Reeves) in Night City.";
                m.Tags = "Trailer, Cyberpunk, Cinematic, Johnny Silverhand, CD PROJEKT RED";
            }
            else if (m.Title.Contains("Shibuya") || m.Title.Contains("Specialz"))
            {
                m.Title = "Jujutsu Kaisen Season 2 Shibuya Incident OP — SPECIALZ (King Gnu)";
                m.MediaUrl = "https://www.youtube.com/watch?v=fhzKLBZJC3w";
                m.ThumbnailUrl = "https://img.youtube.com/vi/fhzKLBZJC3w/hqdefault.jpg";
                m.Description = "Official music video and theme song by King Gnu capturing the Shibuya Incident.";
                m.Tags = "OST, Shibuya Incident, King Gnu, Official Theme, Soundtrack";
            }
            else if (m.Title.Contains("Interstellar") || m.Title.Contains("Caution"))
            {
                m.Title = "Interstellar OST — No Time For Caution (Hans Zimmer)";
                m.MediaUrl = "https://www.youtube.com/watch?v=kpK4cDk2bRs";
                m.ThumbnailUrl = "https://img.youtube.com/vi/kpK4cDk2bRs/hqdefault.jpg";
                m.Description = "Official soundtrack release by WaterTower Music, composed by Hans Zimmer for the Endurance docking sequence.";
                m.Tags = "Soundtrack, Hans Zimmer, Sci-Fi, WaterTower Music, Official Release";
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
        // In local development, passwords can be provided via DEV_ADMIN_PASSWORD / DEV_USER_PASSWORD.
        // If not specified, a temporary password is used for the local session.
        var devAdminPassword = Environment.GetEnvironmentVariable("DEV_ADMIN_PASSWORD")
            ?? "DevAdminPass_" + Guid.NewGuid().ToString("N")[..8] + "!";
        var devUserPassword = Environment.GetEnvironmentVariable("DEV_USER_PASSWORD")
            ?? "DevUserPass_" + Guid.NewGuid().ToString("N")[..8] + "!";

        const string devAdminEmail = "admin@fanhubplus.local";
        const string devMemberEmail = "user@fanhubplus.local";

        if (!context.Users.Any(u => u.NormalizedEmail == devAdminEmail.ToUpper()))
        {
            // [DEV-ONLY] Demo admin account — local development use only
            var (adminHash, adminSalt) = PasswordHasher.Hash(devAdminPassword);
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

        if (!context.Users.Any(u => u.NormalizedEmail == devMemberEmail.ToUpper()))
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

        context.SaveChanges();
    }
}
