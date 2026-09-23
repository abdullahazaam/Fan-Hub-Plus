using FanHubPlus.Models;
using Microsoft.EntityFrameworkCore;

namespace FanHubPlus.Data;

public static class DbInitializer
{
    public static void Initialize(FanHubDbContext context)
    {
        // Execute pending migrations against SQL Server
        context.Database.Migrate();

        if (context.Categories.Any())
        {
            return; // DB has already been seeded
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
        var tvCat = categories.First(c => c.Slug == "tv-shows");
        var kpopCat = categories.First(c => c.Slug == "k-pop");
        var comicsCat = categories.First(c => c.Slug == "comics");
        var mangaCat = categories.First(c => c.Slug == "manga");
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
}
