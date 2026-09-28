using FanHubPlus.Models;

namespace FanHubPlus.Data;

public static class DbSeedData
{
    public static List<ContentItem> GetSeedContentItems(Dictionary<string, int> catMap)
    {
        int Cat(string slug) => catMap.TryGetValue(slug, out var id) ? id : catMap.Values.FirstOrDefault();

        return new List<ContentItem>
        {
            // ─────────────────────────────────────────────────────────────────────────────
            // 1. ANIME (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Domain Expansion Breakdown: Spectral Geometries in Modern Shonen",
                FandomUniverse = "Jujutsu Kaisen",
                ContentType = "Video",
                Description = "A masterclass visual explainer dissecting barrier techniques, sure-hit conditions, and mythological symbolism in contemporary sorcery animation.",
                ContentText = "The concept of an innate domain brought into the real world transformed modern action choreography. By forcing combatants into an enclosed pocket dimension where the caster's cursed technique is inherently guaranteed to land, encounters turn into high-stakes chess matches.\n\n### Mathematical Precision in Choreography\nKey animators deployed isometric camera angles and non-Euclidean geometry to visualize the expansion boundary collapsing upon reality.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Shonen, Animation, Sorcery, Battle Analysis",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "The Rumbling: Geopolitical Metaphors in Attack on Titan's Climax",
                FandomUniverse = "Attack on Titan",
                ContentType = "Article",
                Description = "Examining Eren Yeager's moral descent and the crushing existential questions posed by Paradis Island's final offensive.",
                ContentText = "Attack on Titan transcended standard dark fantasy by refusing simple moral absolutes. The cataclysmic Rumbling represents the ultimate failure of diplomacy when generational trauma and cyclical hatred remain unaddressed.\n\n### The Anatomy of Freedom\nEren's definition of freedom evolved from an innocent desire to see the outside sea into an uncompromising, tragic determination to wipe away the world that persecuted his people.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Dark Fantasy, Philosophy, Shonen, Geopolitics",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "The Art of Ufotable: Digital Composition and Dynamic Swordplay",
                FandomUniverse = "Demon Slayer",
                ContentType = "Article",
                Description = "Inside Studio Ufotable's hybrid 3D-camera pipeline that elevates breathing styles into breathtaking kinetic paintings.",
                ContentText = "By seamlessly blending traditional hand-drawn character keys with rendered photorealistic particle simulations, Ufotable established a new industry standard for anime action cinema.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Animation, VFX, Swordsmanship, Ufotable",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 9, 22, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Neon Genesis Evangelion: The Psychology of the Human Instrumentality Project",
                FandomUniverse = "Evangelion Universe",
                ContentType = "Article",
                Description = "A retrospective into Hideaki Anno's deconstruction of the mecha genre through Freudian psychoanalysis and existential dread.",
                ContentText = "Evangelion subverted youth escapism by depicting psychological devastation instead of heroic empowerment. Shinji Ikari's reluctance to pilot Unit-01 remains an honest portrayal of teenage vulnerability.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Mecha, Psychology, Sci-Fi, Cult Classic",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Frieren: Beyond Journey's End — The Melancholic Passage of Elven Time",
                FandomUniverse = "Frieren Realm",
                ContentType = "Article",
                Description = "Why modern fantasy audiences resonated deeply with a tranquil post-quest meditation on grief, memory, and mortal camaraderie.",
                ContentText = "Rather than focusing on the slaying of the Demon King, Frieren begins after victory is won, exploring how a near-immortal being slowly learns to appreciate the fleeting seconds of mortal lifespan.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "High Fantasy, Magic, Emotional, Slice of Life",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 11, 28, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Solo Leveling: Shadow Monarch Awakening & System Mechanics",
                FandomUniverse = "Solo Leveling",
                ContentType = "Article",
                Description = "Analyzing Sung Jin-woo's progression from E-Rank hunter to absolute ruler of the undead.",
                ContentText = "The power fantasy of the 'System' tapped into gaming ergonomics, pairing crisp webtoon action pacing with A-1 Pictures' fluid dungeon raid choreography.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85",
                Author = "Jin-Woo Kim",
                Tags = "Action, RPG, Necromancy, Webtoon",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Chainsaw Man: The Grungy Cinema of Tatsuki Fujimoto",
                FandomUniverse = "Chainsaw Man Universe",
                ContentType = "Article",
                Description = "How cinematic framing, devilish irony, and unconventional pacing redefined late-night shonen television.",
                ContentText = "Fujimoto's love for B-movies and European arthouse cinema infuses every episode with visceral energy, jarring transitions, and poignant character moments.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Kaito Nishimura",
                Tags = "Dark Comedy, Horror, Action, MAPPA",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2025, 7, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Bleach: Thousand-Year Blood War — The Quincy Vanguard Overhaul",
                FandomUniverse = "Bleach Universe",
                ContentType = "Article",
                Description = "Pierrot's modern high-contrast visual overhaul of Tite Kubo's final arc and bankai reveals.",
                ContentText = "Featuring supervised canonical additions and saturated crimson-indigo palette shifts, Thousand-Year Blood War redeemed the pacing of the original television run.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Action, Supernatural, Soul Reapers, Quincy",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2025, 6, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Cyberpunk: Edgerunners — The Tragic Velocity of Studio Trigger",
                FandomUniverse = "Cyberpunk Universe",
                ContentType = "Video",
                Description = "Hiroyuki Imaishi's neon-drenched kinetic salute to Mike Pondsmith's tabletop mythos.",
                ContentText = "David Martinez's cyberware-fueled spiral captures Night City's brutal truism: there are no happy endings in this city, only glorious pyre crashes.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Sci-Fi, Cyberpunk, Studio Trigger, Tragedy",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 5, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Vinland Saga: The Meaning of True Warriors and Pacifist Odysseys",
                FandomUniverse = "Vinland Saga",
                ContentType = "Article",
                Description = "Thorfinn's transition from vengeance-driven child soldier to farmland laborer seeking a world devoid of slavery.",
                ContentText = "Makoto Yukimura dared to strip away action glorification, crafting an introspective thesis on empathy, guilt, and the true meaning of strength.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Historical, Drama, Vikings, Philosophy",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 4, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "One Piece: The Egghead Island Epoch and Ancient Kingdom Revelations",
                FandomUniverse = "One Piece Universe",
                ContentType = "Article",
                Description = "Vegapunk's broadcast and the long-awaited unveiling of the Void Century secrets.",
                ContentText = "Eiichiro Oda's masterwork entered its final saga with breathtaking geopolitical scope, intertwining revolutionary armies, ancient weapons, and Five Elders.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Adventure, Pirates, Lore, Shonen",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Upcoming: Steins;Gate 0 RE-SYNC — Timeline Divergence Speculation",
                FandomUniverse = "Science Adventure Series",
                ContentType = "Article",
                Description = "Archival speculation on the newly announced anniversary visual novel and anime OVA chapter.",
                ContentText = "Exploring how quantum computing updates and AI world models might perturb the delicate 1.048596% Steins Gate divergence line.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Sci-Fi, Time Travel, Upcoming, Visual Novel",
                PopularityScore = 88,
                ReleaseDate = new DateTime(2026, 11, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Hunter x Hunter: The Succession War Arc — Nen Contracts and Aristocracy",
                FandomUniverse = "Hunter x Hunter",
                ContentType = "Article",
                Description = "Yoshihiro Togashi's dense political thriller unfolding on the Black Whale voyage toward the Dark Continent.",
                ContentText = "Guardian Spirit Beasts, Prince-level assassination schemes, and Kurapika's Emperor Time countdown converge in manga's most complex tactical chess game.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Shonen, Tactical, Nen, Political Drama",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 3, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("anime"),
                Title = "Monster: Naoki Urasawa's Anatomy of Absolute Evil and Empathy",
                FandomUniverse = "Urasawa Universe",
                ContentType = "Article",
                Description = "Why Johan Liebert remains anime's most chilling antagonist decades after publication.",
                ContentText = "Doctor Tenma's cross-continental manhunt questions whether all human lives are truly created equal, confronting nihilism with unwavering medical morality.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1533050487297-09b450131914?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Psychological Thriller, Suspense, Classic, Seinen",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 2, 14, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 2. GAMING (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Night City Chronicles: The Neural Architecture of Cyberpunk 2077",
                FandomUniverse = "Cyberpunk Universe",
                ContentType = "Article",
                Description = "An in-depth retrospective analyzing the architectural worldbuilding, synthwave soundscapes, and narrative redemption arc of Night City.",
                ContentText = "Night City stands as one of the most intricately realized speculative urban landscapes in digital entertainment history. From Watson to City Center, the district designs reflect stark socio-economic divides.\n\n### Environmental Storytelling\nThe developers layered decades of pen-and-paper lore directly into physical architecture. Every alleyway features custom graffiti and dynamic holographic billboards.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Elena Vance (Nexus Lead Archivist)",
                Tags = "Sci-Fi, RPG, Cyberpunk, Worldbuilding",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 11, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Elden Ring: Shadow of the Erdtree — The Shattered Lineage of Miquella",
                FandomUniverse = "Lands Between",
                ContentType = "Article",
                Description = "Unraveling the mystery of the Land of Shadow, Messmer the Impaler, and the cost of ascension to godhood.",
                ContentText = "Hidetaka Miyazaki and George R.R. Martin crafted a layered mythos where golden light conceals subterranean atrocities. The Erdtree's shadow exposes the cruelty inherent in Marika's order.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Soulslike, Dark Fantasy, Lore, FromSoftware",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 9, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "The Witcher 4: Polaris Lore Primer — The Lynx School and Northern Bastions",
                FandomUniverse = "The Witcher",
                ContentType = "Article",
                Description = "A speculative lore compilation examining the transition to Unreal Engine 5 and potential Witcher schools beyond Kaer Morhen.",
                ContentText = "CD PROJEKT RED's next saga promises to move past Geralt's retired life in Corvo Bianco, diving into uncharted snowy territories and newly founded mutant brotherhoods.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "RPG, Fantasy, The Witcher, Upcoming",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2026, 12, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Bloodborne: Yharnam's Cosmic Horror and Gothic Architecture",
                FandomUniverse = "Yharnam",
                ContentType = "Article",
                Description = "Tracing the descent from Victorian werewolf hunts to Great One celestial communion.",
                ContentText = "By weaving Lovecraftian revelations beneath classic gothic horror veneer, FromSoftware created an unmatched atmosphere of escalating dread and philosophical madness.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Gothic, Cosmic Horror, Action RPG, PS4 Classic",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 8, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Final Fantasy VII Rebirth: The Cosmological Defiance of Fate",
                FandomUniverse = "Gaia (FFVII)",
                ContentType = "Article",
                Description = "How Square Enix expanded the City of the Ancients, Whispers of Destiny, and Sephiroth's multiverse ambitions.",
                ContentText = "Rebirth proved that a remake could respect its PlayStation 1 roots while delivering breathtaking open-world traversal across grasslands, junon, and gold saucer.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "JRPG, Fantasy, Sci-Fi, Square Enix",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 6, 29, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Red Dead Redemption 2: The Tragic Extinction of the American Outlaw",
                FandomUniverse = "Van der Linde Gang",
                ContentType = "Article",
                Description = "Arthur Morgan's journey through tuberculosis, loyalty, and redemption in the dying Old West.",
                ContentText = "Rockstar Games crafted an unmatched benchmark for environmental fidelity and character writing. Every campsite conversation reveals the encroaching industrial era.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Western, Open World, Narrative Masterpiece, Rockstar",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 5, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "NieR: Automata — Existential Automata and Route E Enlightenment",
                FandomUniverse = "NieR Universe",
                ContentType = "Article",
                Description = "Yoko Taro's commentary on human consciousness, android devotion, and meta-game narrative structure.",
                ContentText = "Androids 2B and 9S fight an endless proxy war on Earth, only to discover their creators perished centuries ago. The famous Route E credits sequence turns community cooperation into transcendence.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Sci-Fi, Philosophy, Hack and Slash, PlatinumGames",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 4, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Hollow Knight: Silksong — Pharloom Kingdom Mechanics & Speculation",
                FandomUniverse = "Hallownest Universe",
                ContentType = "Article",
                Description = "A deep breakdown of Hornet's acrobatic silk arsenal, tool crafting, and vertical kingdom geography.",
                ContentText = "Team Cherry's sequel shifts from the somber descent of Hallownest to an energetic ascent toward the Citadel atop Pharloom.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Metroidvania, Indie, Action, Upcoming",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2026, 10, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Death Stranding 2: On The Beach — Strand Theory and Post-Apocalyptic Logistics",
                FandomUniverse = "Kojima Productions",
                ContentType = "Video",
                Description = "Hideo Kojima's next frontier in collaborative isolation, marionette companions, and chiral networks.",
                ContentText = "Sam Porter Bridges boards the Magellan, taking the UCA beyond North American shores into global terrain facing unpredictable environmental anomalies.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=85",
                Author = "Kaito Nishimura",
                Tags = "Sci-Fi, Cinematic, Kojima, Upcoming",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2026, 8, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Baldur's Gate 3: The Infinite Permutations of Larian's D&D Engine",
                FandomUniverse = "Forgotten Realms",
                ContentType = "Article",
                Description = "How reactive dialogue, immersive physics, and companion intimacy set a new watermark for modern CRPGs.",
                ContentText = "With over 17,000 potential ending variations, Swen Vincke and Larian Studios proved that turnkey tabletop agency could thrive in high-production digital games.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "CRPG, D&D, Fantasy, GOTY",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 3, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Ghost of Tsushima: The Kurosawa Cinematic Philosophy",
                FandomUniverse = "Tsushima Island",
                ContentType = "Article",
                Description = "Wind navigation, black-and-white grain filters, and Jin Sakai's moral struggle between samurai honor and ghost guerilla tactics.",
                ContentText = "Sucker Punch Productions replaced mini-map clutter with environmental cues: blowing pampas grass, golden birds, and chimney smoke guides travelers effortlessly across 13th-century Japan.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Action, Historical, Samurai, PlayStation",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 2, 22, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Control & Alan Wake 2: The Remedy Connected Universe Investigation",
                FandomUniverse = "Remedy Universe",
                ContentType = "Article",
                Description = "Federal Bureau of Control files, Cauldron Lake dark presence, and live-action musical integration in modern psychological thrillers.",
                ContentText = "Sam Lake crafted a brilliant fusion of Scandinavian noir, SCP Foundation folklore, and dual-reality puzzle choreography.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Survival Horror, Mystery, Remedy, Surreal",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2025, 1, 19, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Armored Core VI: Fires of Rubicon — High-G Tactical Mech Combat",
                FandomUniverse = "Rubicon 3",
                ContentType = "Article",
                Description = "Coral energy, industrial devastation, and the razor-sharp assembly customization of FromSoftware mecha.",
                ContentText = "Piloting Raven through planetary storms, players must balance booster thrust, energy weapon recharge, and poise stagger thresholds.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Mecha, Sci-Fi, Action, FromSoftware",
                PopularityScore = 90,
                ReleaseDate = new DateTime(2024, 12, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("gaming"),
                Title = "Mass Effect: Next-Gen Teasers and the Andromeda-Milky Way Bridge",
                FandomUniverse = "Mass Effect Universe",
                ContentType = "Article",
                Description = "Deconstructing BioWare audio teasers, N7 operatives, and the return of Liara T'Soni.",
                ContentText = "Exploring how the next installment aims to reconcile the aftermath of the Reaper War with the expeditionary findings of the Andromeda initiative.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Sci-Fi, Space Opera, BioWare, Upcoming",
                PopularityScore = 89,
                ReleaseDate = new DateTime(2027, 3, 1, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 3. MOVIES (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "The Interstellar Tapestry: Practical Miniatures vs. Physical Simulation",
                FandomUniverse = "Sci-Fi Cinema",
                ContentType = "Article",
                Description = "How modern cinema masters combine massive practical sets with general relativistic physics rendering to produce believable cosmos odysseys.",
                ContentText = "Grounded science fiction operates on the boundary between astronomical fact and operatic drama. When rendering accretion disks around Kerr black holes, the production team worked alongside theoretical physicists.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Sci-Fi, Cinema, Physics, Visual Effects",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Dune: Part Two — Denis Villeneuve's Brutalist Arrakis Symphony",
                FandomUniverse = "Dune Universe",
                ContentType = "Article",
                Description = "Sound design, infrared Giedi Prime cinematography, and the tragic emergence of the Muad'Dib messiah.",
                ContentText = "Villeneuve stripped Dune of camp sci-fi tropes, replacing them with monolithic concrete fortresses, thumping thumper bass frequencies, and Hans Zimmer's wailing female vocals.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Sci-Fi, Epic, Cinematography, Denis Villeneuve",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 11, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Blade Runner 2049: The Poetics of Artificial Memory and Loneliness",
                FandomUniverse = "Blade Runner Universe",
                ContentType = "Article",
                Description = "Roger Deakins' volumetric lighting, synthetic rain, and Officer K's realization of his own ordinary humanity.",
                ContentText = "A rare sequel that expanded the philosophical foundation of its legendary predecessor. K's sacrifice under gentle falling snow remains one of cinema's quietest triumphs.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Cyberpunk, Neo-Noir, Roger Deakins, Masterpiece",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 8, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Oppenheimer: The Auditory Pressure of Moral Chain Reactions",
                FandomUniverse = "Historical Cinema",
                ContentType = "Article",
                Description = "Christopher Nolan's use of Ludwig Göransson's violin arrangements and silent Trinity shockwaves.",
                ContentText = "Rather than an explosion sound at detonation, Nolan preserved physical reality: the blinding flash was followed by agonizing seconds of heavy breathing before the shockwave rattled theater walls.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Biography, Drama, Nolan, IMAX",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 7, 21, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Spider-Man: Across the Spider-Verse — Multi-Framerate Visual Chaos",
                FandomUniverse = "Spider-Verse",
                ContentType = "Video",
                Description = "Dissecting how Gwen's watercolored mood rings, Spider-Punk's Xerox collages, and Miguel O'Hara's glitch lines coexisted on screen.",
                ContentText = "Sony Pictures Animation shattered the CGI homogeneity that plagued mainstream studio releases for twenty years, proving animation can operate as living fine art.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Animation, Marvel, Spider-Man, Groundbreaking",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 6, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "The Batman (2022): Fincher-Inspired Detective Noir in Gotham",
                FandomUniverse = "DC Universe",
                ContentType = "Article",
                Description = "Matt Reeves and Greig Fraser's gritty rain-soaked Gotham City and Nirvana-infused tension.",
                ContentText = "Robert Pattinson's Batman is not a suave playboy, but a reclusive insomniac drifter who writes crime journals while piecing together Riddler's cyphers.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Crime, Noir, Batman, DC Comics",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 4, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Mad Max: Fury Road — Kinetic Practical Stunt Choreography",
                FandomUniverse = "Wasteland",
                ContentType = "Article",
                Description = "George Miller's opera of rust, superchargers, and Australian desert vehicle acrobatics.",
                ContentText = "With over 80 percent practical effects, real flame-throwing guitars, and real vehicle crashes, Fury Road set an unassailable benchmark for action rhythm.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Action, Post-Apocalyptic, Practical Effects, Cult",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 3, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Everything Everywhere All At Once: The Absurdist Multiverse Antidote",
                FandomUniverse = "A24 Multiverse",
                ContentType = "Article",
                Description = "The Daniels' fusion of Hong Kong martial arts, hot dog fingers, and profound maternal forgiveness.",
                ContentText = "In an era of corporate multiverse exhaustion, this indie powerhouse proved that infinite realities are meaningless unless anchored to a single kitchen conversation.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Sci-Fi, Comedy, Multiverse, Oscar Winner",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 2, 8, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Alien: Romulus — Practical Animatronics and Zero-G Xenomorph Terror",
                FandomUniverse = "Alien Universe",
                ContentType = "Article",
                Description = "Fede Álvarez returns to the retro-futurist CRT monitors, facehugger puppets, and Weyland-Yutani dread.",
                ContentText = "Bridging the gap between Ridley Scott's 1979 original and James Cameron's Aliens, Romulus brought back tactile claustrophobia to the legendary franchise.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Sci-Fi, Horror, Xenomorph, Practical Effects",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 1, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "The Matrix (1999): The Cyberpunk Gospel That Redefined Modern Cinema",
                FandomUniverse = "Matrix Universe",
                ContentType = "Article",
                Description = "The Wachowskis' timeless blend of Baudrillard philosophy, Yuen Woo-ping wire-fu, and bullet-time cameras.",
                ContentText = "Over twenty-five years later, the green digital rain and sunglasses remain the supreme stylistic touchstone for speculative technology and simulation paranoia.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Sci-Fi, Cyberpunk, Bullet Time, Milestone",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2024, 11, 24, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Godzilla Minus One: Post-War Survivor Guilt and Kaiju Grandeur",
                FandomUniverse = "Toho Kaiju",
                ContentType = "Article",
                Description = "Takashi Yamazaki's intimate human drama and earth-shattering atomic breath sequence.",
                ContentText = "Made on a modest budget, Minus One outshone Hollywood spectacles by treating the giant lizard not as an ally, but as walking nuclear retribution for a broken generation.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Kaiju, Historical, Drama, Japanese Cinema",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2024, 10, 19, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Upcoming: Tron: Ares — The Grid Infiltrates the Physical Realm",
                FandomUniverse = "Tron Universe",
                ContentType = "Article",
                Description = "Analyzing the Nine Inch Nails soundtrack announcement and red light cycle physical breaches.",
                ContentText = "Ares departs from the computer system, exploring what happens when artificial military algorithms manifest directly onto the asphalt streets of modern Earth.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Sci-Fi, Cyberpunk, Synthwave, Upcoming",
                PopularityScore = 90,
                ReleaseDate = new DateTime(2026, 10, 25, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "John Wick: Chapter 4 — The High Table Continental Climax",
                FandomUniverse = "John Wick Universe",
                ContentType = "Article",
                Description = "Chad Stahelski's 169-minute celebration of top-down dragon's breath shotgun choreography and Sacré-Cœur stair battles.",
                ContentText = "Keanu Reeves cemented his legacy with jaw-dropping endurance, delivering poetic closure to the dog-loving hitman's crusade across Osaka, Berlin, and Paris.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Action, Gun-Fu, Keanu Reeves, High Octane",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2024, 8, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("movies"),
                Title = "Arrival: Non-Linear Semantics and Heptapod Orthography",
                FandomUniverse = "Arrival Universe",
                ContentType = "Article",
                Description = "Ted Chiang's story brought to life through circular ink logograms and circular temporal philosophy.",
                ContentText = "A film where understanding an alien language allows human consciousness to perceive past, present, and future simultaneously, choosing love despite inevitable heartbreak.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Sci-Fi, Linguistics, Time, Denis Villeneuve",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2024, 6, 12, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 4. TV SHOWS (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Arcane: Season 2 — The Hextech Arms Race and Zaun's Desperation",
                FandomUniverse = "Piltover & Zaun",
                ContentType = "Video",
                Description = "Fortiche and Riot Games' breathtaking animated tragedy detailing Jinx's psychosis and Vi's enforcer badge.",
                ContentText = "Arcane proved that serialized video game adaptations can equal or exceed prestige HBO dramas, matching painterly French animation with tragic sibling discord.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Animation, Steampunk, Drama, Riot Games",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 11, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "House of the Dragon: The Dance of the Dragons Feud Mechanics",
                FandomUniverse = "Westeros Universe",
                ContentType = "Article",
                Description = "Aemma's crown, Lucerys at Storm's End, and Daemon Targaryen's blood-soaked Caraxes maneuvers.",
                ContentText = "George R.R. Martin's Fire & Blood comes alive as the realm tears itself apart along emerald green and Targaryen black banners.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Fantasy, Dragons, Political Intrigue, HBO",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 9, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Severance: The Architectural Dystopia of Lumon Industries",
                FandomUniverse = "Lumon Universe",
                ContentType = "Article",
                Description = "Macrodata refinement, green carpet mazes, and the terrifying ethics of bifurcated neurological consciousness.",
                ContentText = "Ben Stiller and Dan Erickson created an immaculate workplace horror series where the line between job duty and mental enslavement vanishes into eerie fluorescent lighting.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Sci-Fi, Dystopian, Mystery, Thriller",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 8, 25, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "The Last of Us: Adapting Cordyceps Fungal Terror to Prestige Drama",
                FandomUniverse = "The Last of Us",
                ContentType = "Article",
                Description = "Craig Mazin and Neil Druckmann's emotional survival journey through Clicker encounters and Bill & Frank's sanctuary.",
                ContentText = "Pedro Pascal and Bella Ramsey delivered definitive performances, proving human vulnerability remains the core heartbeat of survival horror.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Post-Apocalyptic, Drama, HBO, Naughty Dog",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 7, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Shōgun: Authentic Sengoku Period Protocol and Subtitles Revolution",
                FandomUniverse = "Feudal Japan",
                ContentType = "Article",
                Description = "Hiroyuki Sanada's masterclass in political chess, seppuku rituals, and 90-percent Japanese dialogue production.",
                ContentText = "Rachel Kondo and Justin Marks created an authentic epic that swept Emmy history, honoring Japanese cultural nuances with uncompromising artistic integrity.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Historical, Drama, Samurai, Masterpiece",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 5, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Andor: The Grassroots Machinery of Anti-Fascist Rebellion",
                FandomUniverse = "Star Wars Universe",
                ContentType = "Article",
                Description = "Tony Gilroy's grounded espionage masterpiece focusing on prison labor camps and imperial bureaucracy over lightsabers.",
                ContentText = "Luthen Rael's monologue and the Narkina 5 prison break redefined Star Wars for mature audiences craving real political teeth.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Sci-Fi, Star Wars, Espionage, Political Drama",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 4, 3, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Stranger Things: Season 5 — The Vecna Upside Down Endgame",
                FandomUniverse = "Hawkins Universe",
                ContentType = "Article",
                Description = "The Duffer Brothers' climactic battle uniting Eleven, the Party, and the military lockdown of Indiana.",
                ContentText = "Synthesizer chords, D&D mythologies, and 1980s nostalgia prepare for their ultimate cinematic bow in Hawkins' shattered landscape.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Supernatural, 80s, Sci-Fi, Netflix",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Breaking Bad & Better Call Saul: The Tragic Architecture of Albuquerque",
                FandomUniverse = "Vince Gilligan Universe",
                ContentType = "Article",
                Description = "Color theory, wide desert vistas, and the moral erosion of Walter White and Jimmy McGill.",
                ContentText = "No television universe has ever maintained higher structural perfection, where every stray burner phone and law license suspension triggers monumental consequences.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Crime, Drama, Vince Gilligan, Classic",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 2, 28, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Fallout: Retro-Futurism, Ghouls, and Vault-Tec Conspiracies",
                FandomUniverse = "Fallout Wasteland",
                ContentType = "Article",
                Description = "Walton Goggins' magnificent Ghoul portrayal and Jonathan Nolan's dark comedy wasteland survival.",
                ContentText = "From Brotherhood of Steel power armor hydraulics to retro 1950s ink commercials, Fallout balanced absurd satire with authentic nuclear tragedy.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Post-Apocalyptic, Sci-Fi, Dark Comedy, Prime Video",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 1, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Dark (Netflix): The Deterministic Grandfather Paradox Masterwork",
                FandomUniverse = "Winden Universe",
                ContentType = "Article",
                Description = "Baran bo Odar's 33-year time travel loop across four intertwined German families.",
                ContentText = "'What we know is a drop, what we don't know is an ocean.' Dark stands as television's most airtight and mathematically rigorous temporal puzzle.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Sci-Fi, Mystery, Time Travel, German Classic",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2024, 11, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "The Boys: Satirical Corporatism and Superhero Nihilism",
                FandomUniverse = "Vought Universe",
                ContentType = "Article",
                Description = "Homelander's terrifying milk-sipping psychosis and Vought International's media manipulation.",
                ContentText = "Eric Kripke transformed Garth Ennis' comic into an incisive mirror for modern celebrity idolatry and corporate defense contracting.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Superheroes, Satire, Dark Action, Prime Video",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2024, 10, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Succession: King Lear in Private Jets and Media Conglomerates",
                FandomUniverse = "Waystar Royco",
                ContentType = "Article",
                Description = "Jesse Armstrong's Shakespearean tragedy of Kendall, Shiv, Roman, and Logan Roy's brutal patriarch shadow.",
                ContentText = "Armed with documentary-style zooms and Nicholas Britell's piano concertos, Succession documented the moral rot of American wealth with devastating wit.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Prestige Drama, HBO, Satire, Modern Masterpiece",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2024, 9, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Upcoming: Daredevil: Born Again — The Gritty Return of Hell's Kitchen",
                FandomUniverse = "Marvel Television",
                ContentType = "Article",
                Description = "Charlie Cox and Vincent D'Onofrio bring back raw practical hallway combat and mayoral corruption.",
                ContentText = "Marvel Studios overhauled production to return to the grounded realism and stunt brutality that made the original Netflix run unforgettable.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Marvel, Crime, Martial Arts, Upcoming",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Peaky Blinders: The Razor-Lined Strategy of Tommy Shelby",
                FandomUniverse = "Shelby Company Limited",
                ContentType = "Article",
                Description = "Post-WWI Birmingham industrial grit, slow-motion overcoat walks, and Nick Cave soundtrack swagger.",
                ContentText = "Cillian Murphy's steely eyes anchored an epic family syndicate drama bridging Birmingham smokestacks with British parliamentary corridors.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Historical Drama, Gangsters, BBC, Cult Classic",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2024, 7, 18, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 5. K-POP (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "Symphonic Concept Eras: Decoding the Lore of K-Pop Alternative Universes",
                FandomUniverse = "Global Pop Universe",
                ContentType = "Audio",
                Description = "A deep auditory dive exploring orchestral leitmotifs, futuristic time-travel narratives, and cross-album storyline continuity.",
                ContentText = "Modern pop acts have evolved into multimedia worldbuilders. Through connected music video trilogies and ARG clues tucked into album inserts, fans assemble vast mythologies.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=85",
                Author = "Min-ji Park",
                Tags = "Music, Soundtracks, ARG, Fan Lore",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "NewJeans & The Y2K Aesthetic Renaissance: Sonic & Visual Analysis",
                FandomUniverse = "ADOR / HYBE Lore",
                ContentType = "Article",
                Description = "How Baltimore club beats, jersey drill rhythms, and camcorder nostalgia redefined fifth-generation pop.",
                ContentText = "Stripping away high-octane EDM drops in favor of effortless vocal harmonies and easy-listening UK garage rhythms transformed NewJeans into global tastemakers.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=85",
                Author = "Hana Choi",
                Tags = "K-Pop, Y2K, Music Production, NewJeans",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 11, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "BTS: The BU Cinematic Universe and Hwayangyeonhwa Lore",
                FandomUniverse = "Bangtan Universe",
                ContentType = "Article",
                Description = "Time loops, red butterflies, and the decade-long transmedia story spanning webtoons, novels, and music videos.",
                ContentText = "Jin's desperate struggle to save his six friends across fractured temporal timelines formed one of pop music's most elaborate fictional universes.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=85",
                Author = "Min-ji Park",
                Tags = "BTS, Time Loop, Transmedia, Worldwide",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 9, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "aespa: KWANGYA Mythology and the ae-Avatar Digital Dualism",
                FandomUniverse = "SM Culture Universe",
                ContentType = "Video",
                Description = "Black Mamba, cybernetic alter-egos, and the boundary between physical idols and virtual counterparts.",
                ContentText = "SM Entertainment envisioned a futuristic sci-fi ecosystem where virtual reality personas coexist alongside real performers in hyper-stylized digital realms.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Cyberpunk, Virtual Avatars, Sci-Fi Pop, aespa",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 8, 8, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "Stray Kids: Self-Producing 3RACHA and Industrial Cyber-Beats",
                FandomUniverse = "District 9 Lore",
                ContentType = "Audio",
                Description = "Bang Chan, Changbin, and Han's DIY production philosophy fusing drill, rock riffs, and relentless rap flows.",
                ContentText = "Stray Kids broke traditional K-pop molds by writing, producing, and arranging their own music, establishing an aggressive signature sound celebrated worldwide.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=85",
                Author = "Hana Choi",
                Tags = "Hip-Hop, 3RACHA, Self-Produced, High Energy",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 7, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "BLACKPINK: Born Pink World Tour & Stadium Stage Architecture",
                FandomUniverse = "YG Entertainment",
                ContentType = "Image",
                Description = "Pyrotechnic rigging, live band arrangements, and global festival headline milestones.",
                ContentText = "From Coachella to Hyde Park, Jennie, Jisoo, Rosé, and Lisa solidified K-pop's undisputed stadium dominance with swagger and chart-shattering presence.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=85",
                Author = "Min-ji Park",
                Tags = "Stadium Tour, Fashion, Girl Groups, YG",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 6, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "LE SSERAFIM: Anti-Fragile Philosophy and High-End Fashion Synergy",
                FandomUniverse = "Source Music Lore",
                ContentType = "Article",
                Description = "Turning public scrutiny into artistic resilience through athletic choreography and runway aesthetics.",
                ContentText = "With concept films channeling high fashion and lyrics tackling vulnerability directly, LE SSERAFIM carved out an inspiring identity of fearless tenacity.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Fashion, Choreography, Resilience, HYBE",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 5, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "ENHYPEN: Vampiric Bloodlines and Dark Moon Webtoon Lore",
                FandomUniverse = "Dark Moon Universe",
                ContentType = "Article",
                Description = "Gothic academy aesthetics, supernatural fate, and cross-platform manhwa synchronization.",
                ContentText = "ENHYPEN seamlessly intertwined fantasy webtoon mythologies with haunting synth-pop music videos, creating an immersive fantasy experience for fans.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Hana Choi",
                Tags = "Vampires, Gothic, Webtoon, Lore",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2025, 4, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "The Evolution of Lightsticks: Bluetooth DMX Arena Synchronization",
                FandomUniverse = "K-Pop Concert Tech",
                ContentType = "Article",
                Description = "How connected fanlight microcontrollers turn 70,000-seat stadiums into responsive light shows.",
                ContentText = "Gone are the days of simple glowsticks; modern K-pop lightsticks utilize sub-gigahertz RF and Bluetooth mesh networks to synchronize patterns with live music cues.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Concert Tech, Hardware, IoT, Fandom Culture",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2025, 3, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "TWICE: Decade of Unbreakable Sisterhood and Stadium Anthems",
                FandomUniverse = "JYP Entertainment",
                ContentType = "Article",
                Description = "All nine members renewing contracts, transitioning from bubblegum pop to mature disco-funk grooves.",
                ContentText = "TWICE proved that longevity in the idol industry is built on mutual respect, infectious positive energy, and chart-topping musical evolution.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=85",
                Author = "Min-ji Park",
                Tags = "JYP, Girl Groups, Longevity, Disco Funk",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 2, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "ATEEZ: Pirate Captains and the Rebellion Against Strict Reality",
                FandomUniverse = "TREASURE & FEVER Lore",
                ContentType = "Video",
                Description = "The Halateez dimension, dystopian resistance, and theatrical stage presence.",
                ContentText = "ATEEZ brought theatrical intensity and high-concept sci-fi pirate lore to Western arenas, gaining massive international acclaim.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Performance, Pirates, Theatrical, KQ",
                PopularityScore = 90,
                ReleaseDate = new DateTime(2025, 1, 24, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "Upcoming: World Tour Encore 2026 — Global Streaming & VR Front Rows",
                FandomUniverse = "Live Nation K-Pop",
                ContentType = "Article",
                Description = "Previewing spatial audio 8K VR concert broadcasts coming to worldwide headsets in late 2026.",
                ContentText = "Connecting remote international fans directly to Olympic Gymnastics Arena front rows with real-time biometric cheer responses.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "VR, Streaming, Future Tech, Upcoming",
                PopularityScore = 88,
                ReleaseDate = new DateTime(2026, 11, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "K-Pop Choreography Demystified: The Royal Family & 1MILLION Studios",
                FandomUniverse = "Dance Studios of Seoul",
                ContentType = "Article",
                Description = "How global choreographers fuse tutting, waacking, and contemporary isolation into viral routines.",
                ContentText = "Every 15-second point dance is engineered with surgical precision to look effortless while demanding extreme stamina from the performers.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Choreography, Dance, Seoul, Behind the Scenes",
                PopularityScore = 89,
                ReleaseDate = new DateTime(2024, 11, 4, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("k-pop"),
                Title = "SEVENTEEN: The 13-Member Synchronized Juggernaut and BSS Comedy",
                FandomUniverse = "Pledis Universe",
                ContentType = "Article",
                Description = "Woozi's songwriting leadership and the legendary variety entertainment energy of Go Going Seventeen.",
                ContentText = "Balancing thirteen individual talents into flawless laser-precise formations while maintaining chaotic comedy variety chemistry.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=85",
                Author = "Hana Choi",
                Tags = "Pledis, Synchronization, Self-Produced, Variety",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2024, 9, 28, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 6. COMICS (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "The Crisis Architecture: How Infinite Earths Shaped Modern Continuity",
                FandomUniverse = "Multiverse Comics",
                ContentType = "Article",
                Description = "Tracing how 1980s editorial ambition birthed the modern comic company crossover event and defined comic storytelling for 40 years.",
                ContentText = "Before 1985, comic books maintained disparate parallel timelines. The decision to collapse infinite earths into a singular unified history required unprecedented synchronization.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Comics, Multiverse, Crossover, Golden Age",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Watchmen: Alan Moore's Deconstruction of the Vigilante Mythos",
                FandomUniverse = "Watchmen Universe",
                ContentType = "Article",
                Description = "Dave Gibbons' 9-panel grid, the Doomsday Clock motif, and Rorschach's uncompromising moral absolutism.",
                ContentText = "Watchmen permanently ended the naive era of comic books, asking the chilling question: 'Who watches the watchmen?' in a Cold War world facing nuclear annihilation.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Graphic Novel, Classic, Alan Moore, Deconstruction",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 10, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "The Dark Knight Returns: Frank Miller's Brutal Cold War Rebirth",
                FandomUniverse = "DC Universe",
                ContentType = "Article",
                Description = "An aging Bruce Wayne donning the cowl one last time against mutant gangs and Superman's government loyalty.",
                ContentText = "Miller stripped Batman of camp and restored him as a mythic force of primal grit, forever changing superhero comics alongside Watchmen in 1986.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Batman, Frank Miller, Dystopia, Classic",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Jonathan Hickman's House of X / Powers of X: Mutant Sovereignty",
                FandomUniverse = "X-Men Universe",
                ContentType = "Article",
                Description = "Krakoa's living island, the resurrection protocols, and Moira MacTaggert's ten reincarnated timelines.",
                ContentText = "Hickman took the X-Men out of the defensive mansion and into an ascendant geopolitical nation-state with their own language, law, and immortality.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Marvel, X-Men, Hickman, Masterpiece",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 7, 24, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "The Sandman: Neil Gaiman's Endless Mythologies and Dreams",
                FandomUniverse = "The Dreaming",
                ContentType = "Article",
                Description = "Morpheus, Death of the Endless, and the cross-mythological tapestry of Lucifer's retirement.",
                ContentText = "Gaiman merged ancient mythology, Shakespearean history, and contemporary fantasy into DC's premier Vertigo masterpiece.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Vertigo, Sandman, Neil Gaiman, Dark Fantasy",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 6, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Kingdom Come: Alex Ross's Photorealistic Painted Pantheon",
                FandomUniverse = "Elseworlds",
                ContentType = "Image",
                Description = "Mark Waid and Alex Ross's generational clash between noble golden age ideals and reckless modern antiheroes.",
                ContentText = "Ross's gouache paintings gave comic book panels the majesty of Renaissance frescoes, making Superman's return feel profoundly transcendent.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Alex Ross, Painted, DC, Elseworlds",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 5, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Invincible: Robert Kirkman's Subversion of Superhero Violence",
                FandomUniverse = "Invincible Universe",
                ContentType = "Article",
                Description = "Omni-Man's subway massacre, Viltrumite galactic conquest, and Mark Grayson's indomitable willpower.",
                ContentText = "Kirkman proved an independent superhero comic could sustain 144 issues without reboots, letting characters grow, marry, bleed, and face permanent consequences.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Image Comics, Kirkman, Superhero, Uncensored",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 3, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Batman: The Court of Owls — Gotham's Century-Old Shadow Rulers",
                FandomUniverse = "DC Universe",
                ContentType = "Article",
                Description = "Scott Snyder and Greg Capullo's labyrinth horror and the Talons of Gotham aristocracy.",
                ContentText = "By challenging Batman's assumption that he knew every stone in Gotham, Snyder created an instant classic villain faction for the 21st century.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Batman, Mystery, Horror, DC New 52",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 2, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Secret Wars (2015): Battleworld and Doctor Doom's Godhood",
                FandomUniverse = "Marvel Multiverse",
                ContentType = "Article",
                Description = "The collision of the 616 and Ultimate Universes and Jonathan Hickman's cosmic swan song.",
                ContentText = "God Emperor Doom sitting on the throne of Yggdrasil, ruling a patchwork world held together only by his sheer megalomaniacal willpower.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Marvel, Secret Wars, Multiverse, Doctor Doom",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Saga: Brian K. Vaughan & Fiona Staples' Space Opera Romance",
                FandomUniverse = "Saga Universe",
                ContentType = "Article",
                Description = "Marko, Alana, Hazel, and the brutal interstellar war between Landfall and Wreath.",
                ContentText = "With Staples' expressive digital watercolors and Vaughan's fearless narrative, Saga redefined creator-owned comic viability in the modern era.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Sci-Fi, Romance, Image Comics, Award Winner",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "All-Star Superman: Grant Morrison's Solar Elegies and Twelve Labors",
                FandomUniverse = "DC Universe",
                ContentType = "Article",
                Description = "Frank Quitely's luminous art and Superman's final, poignant gifts to humanity facing mortality.",
                ContentText = "Morrison stripped Superman of angst and cynism, reminding readers why the Man of Tomorrow was created as an enduring symbol of cosmic hope.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Superman, Grant Morrison, Masterpiece, DC",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2024, 10, 28, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Upcoming: Absolute DC Universe — Scott Snyder's Dark Reign Relaunch",
                FandomUniverse = "DC Absolute",
                ContentType = "Article",
                Description = "A preview of the dark, stripped-down reimaginings of Batman, Superman, and Wonder Woman.",
                ContentText = "In a universe where heroes lack traditional resources, Bruce Wayne is a city engineer and Clark Kent grows up without Smallville comfort.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "DC Comics, Absolute Universe, Upcoming, Relaunch",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2026, 9, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Daredevil: Born Again (Miller & Mazzucchelli): The Catholic Requiem",
                FandomUniverse = "Marvel Universe",
                ContentType = "Article",
                Description = "Kingpin tearing down Matt Murdock's life piece by piece and the rebirth from destitution.",
                ContentText = "'And I have shown him that a man without hope is a man without fear.' One of the greatest comic arcs ever committed to newsprint.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Marvel, Daredevil, Frank Miller, Noir",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2024, 8, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("comics"),
                Title = "Immortal Hulk: Al Ewing's Body Horror and Jungian Shadow Archetypes",
                FandomUniverse = "Marvel Universe",
                ContentType = "Article",
                Description = "The Green Door, the One Below All, and the horrifying immortality of Bruce Banner.",
                ContentText = "Ewing revitalized the Hulk by returning him to his 1950s atomic horror roots, creating one of modern Marvel's most critically acclaimed runs.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Marvel, Hulk, Body Horror, Psychological",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2024, 7, 5, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 7. MANGA (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Berserk: Kentaro Miura's Monumental Crosshatching & Eclipse Horrors",
                FandomUniverse = "Midland (Berserk)",
                ContentType = "Article",
                Description = "Guts' Black Swordsman odyssey, the Dragonslayer blade, and the pinnacle of dark fantasy sequential illustration.",
                ContentText = "Kentaro Miura spent decades hand-inking every apostle muscle, chainmail link, and blood splatter with unmatched Renaissance precision.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Dark Fantasy, Seinen, Inking, Kentaro Miura",
                PopularityScore = 99,
                ReleaseDate = new DateTime(2025, 11, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Vagabond: Takehiko Inoue's Zen Brushwork and Musashi Miyamoto",
                FandomUniverse = "Edo Period Japan",
                ContentType = "Article",
                Description = "The transition from reckless duelist to enlightened farmer and the philosophical definition of 'invincibility'.",
                ContentText = "Inoue abandoned traditional manga G-pens for sumi-e calligraphy brushes, capturing the raw kinetic weight of 17th-century Japanese swordsmanship.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Historical, Seinen, Samurai, Masterpiece",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 9, 25, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Tokyo Ghoul: Sui Ishida's Tragic Metamorphosis and Kafkaesque Rot",
                FandomUniverse = "Tokyo Ghoul Universe",
                ContentType = "Article",
                Description = "Ken Kaneki's descent into the ghoulish underworld and the psychological duality of the white-haired centipede.",
                ContentText = "Blending Franz Kafka's Metamorphosis with brutal psychological horror, Sui Ishida explored the tragedy of belonging to neither humanity nor monsterkind.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Dark Fantasy, Horror, Seinen, Psychology",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Oyasumi Punpun: Inio Asano's Devastating Exploration of Depression",
                FandomUniverse = "Asano Universe",
                ContentType = "Article",
                Description = "Depicting a bird-like caricature wandering through hyper-realistic suburban despair and shattered innocence.",
                ContentText = "Asano's masterpiece is an uncompromising confrontation with adulthood, guilt, and the irreparable consequences of childhood promises.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1533050487297-09b450131914?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Psychological, Coming of Age, Seinen, Drama",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 7, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "JoJo's Bizarre Adventure: Hirohiko Araki's High Fashion Stand Battles",
                FandomUniverse = "JoJo Universe",
                ContentType = "Article",
                Description = "Gucci inspirations, classical Greek poses, and the strategic evolution of Stand powers from Stardust Crusaders to The JOJOLands.",
                ContentText = "Araki's work was exhibited at the Louvre because it treats sequential panels as living fashion runways and tactical mathematical equations.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Action, Fashion, Stands, Shonen/Seinen",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2025, 5, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Akira: Katsuhiro Otomo's Cyberpunk Apocalyptic Penwork",
                FandomUniverse = "Neo-Tokyo",
                ContentType = "Article",
                Description = "Tetsuo's telekinetic mutation, crumbling skyscrapers, and Otomo's pioneering architectural perspective.",
                ContentText = "Akira wasn't just a comic; it laid the foundation for modern cyberpunk worldbuilding, influencing Hollywood, anime, and graphic literature worldwide.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Elena Vance",
                Tags = "Cyberpunk, Sci-Fi, Milestone, Classic",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2025, 4, 18, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Dandadan: Yukinobu Tatsu's Kinetic Hybrid of Aliens and Yokai",
                FandomUniverse = "Dandadan Universe",
                ContentType = "Article",
                Description = "Hyper-detailed speed lines, Turbo Granny curses, and explosive teenage comedic romance.",
                ContentText = "Former assistant to Tatsuki Fujimoto, Tatsu exploded onto the scene with double-page spreads that redefine motion and double-page dynamic density.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Action, Supernatural, Comedy, Shonen Jump",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 3, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Monster (Manga Edition): The Precision of Black & White Tension",
                FandomUniverse = "Urasawa Universe",
                ContentType = "Article",
                Description = "How Naoki Urasawa directs reader eye movement and cliffhangers without reliance on supernatural powers.",
                ContentText = "Every page turn in Monster is calibrated like a Hitchcockian film cut, using shadow hatching and facial micro-expressions to convey dread.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Thriller, Mystery, Panel Design, Urasawa",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Choujin X: Sui Ishida's Return to Supernatural Body Horror",
                FandomUniverse = "Yamato Prefecture",
                ContentType = "Article",
                Description = "Tokio Kurohara, vulture transformations, and the cost of inheriting superhuman curses.",
                ContentText = "Free from weekly magazine constraints, Ishida publishes at his own cadence, resulting in jaw-dropping watercolor spreads and experimental panel compositions.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Kaito Nishimura",
                Tags = "Supernatural, Body Horror, Seinen, Ishida",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2025, 1, 8, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Kingdom: Yasuhisa Hara's 10,000-Soldier Tactical Battlefield Inking",
                FandomUniverse = "Warring States China",
                ContentType = "Article",
                Description = "Xin's rise from slave to Great General of the Heavens during the unification of Qin.",
                ContentText = "Depicting sweeping cavalry flank charges and intricate infantry formations with terrifying historical momentum.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85",
                Author = "Takashi Morita",
                Tags = "Historical, Warfare, Strategy, Seinen",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2024, 11, 20, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Goodnight Punpun: The Technical Isolation of Digital Backgrounds",
                FandomUniverse = "Asano Universe",
                ContentType = "Article",
                Description = "Tracing Inio Asano's process of photographing real Japanese streets and digitally filtering them for melancholy.",
                ContentText = "By anchoring grotesque emotional breakdown against photorealistic Tokyo telephone poles and convenience stores, Asano achieved uncanny resonance.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1532012164546-f432f2e37771?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1532012164546-f432f2e37771?w=1600&q=85",
                Author = "Dr. Aris Thorne",
                Tags = "Manga Technique, Digital Inking, Asano, Art Guide",
                PopularityScore = 90,
                ReleaseDate = new DateTime(2024, 10, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Claymore: Norihiro Yagi's Silver-Eyed Witches and Awakened Beings",
                FandomUniverse = "The Organization",
                ContentType = "Article",
                Description = "Clare's flesh of Teresa, sword forms, and the grotesque chimeras of northern wars.",
                ContentText = "A dark fantasy triumph that combined tactical limb severing with poignant sisterhood between mutated demon hunters.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Dark Fantasy, Swordplay, Demons, Classic",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2024, 8, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Upcoming: Berserk: The Eastern Exile Chronicles (Studio Gaga)",
                FandomUniverse = "Midland (Berserk)",
                ContentType = "Article",
                Description = "Kouji Mori and Studio Gaga continue Kentaro Miura's legacy based on his personal notes.",
                ContentText = "Following the tragic fall of Elfhelm, Guts confronts his inner beast of darkness while the party journeys toward the mysterious Kushan Empire.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Berserk, Studio Gaga, Dark Fantasy, Upcoming",
                PopularityScore = 98,
                ReleaseDate = new DateTime(2026, 11, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("manga"),
                Title = "Slam Dunk: Takehiko Inoue's Pure Kinetic Motion and Sannoh Climax",
                FandomUniverse = "Shohoku High",
                ContentType = "Article",
                Description = "The final minutes without dialogue that proved sequential art could replicate live sports adrenaline.",
                ContentText = "Inoue stripped away word balloons and internal thoughts, letting breathless sweat drops and sneaker squeaks drive the greatest game in manga history.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=85",
                Author = "Ren Fujisaki",
                Tags = "Sports, Basketball, Milestone, Takehiko Inoue",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2024, 6, 20, 0, 0, 0, DateTimeKind.Utc)
            },

            // ─────────────────────────────────────────────────────────────────────────────
            // 8. COSPLAY (14 items)
            // ─────────────────────────────────────────────────────────────────────────────
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Thermoplastic Alchemy: Fabricating Mech Armor for World Cosplay Summit",
                FandomUniverse = "Cosplay Craft Guild",
                ContentType = "Image",
                Description = "A visual step-by-step masterclass showcasing high-density EVA foam shaping, LED pneumatic conduits, and weathering paint techniques.",
                ContentText = "Creating wearable mechanical armor requires an engineer's eye for articulation and a sculptor's touch for form. High-density EVA foam heated with variable-temp heat guns forms the base chassis.\n\n### Priming and Chrome Buffing\nApplying high-gloss black enamel before graphite powder buffing creates realistic brushed titanium reflections.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Cosplay, Props, EVA Foam, Crafting Guide",
                PopularityScore = 97,
                ReleaseDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "3D Printing & Resin Casting: Creating Functional Motorized Wings",
                FandomUniverse = "Prop Engineering Lab",
                ContentType = "Article",
                Description = "Micro-servos, Arduino microcontrollers, and lightweight PETG skeletal frames for articulated feathered wings.",
                ContentText = "Bridging robotics and costume design, modern cosplayers deploy Bluetooth-controlled actuators tucked into shoulder harnesses to expand 10-foot wings on convention stages.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85",
                Author = "Alex Rivera",
                Tags = "3D Printing, Animatronics, Cosplay Tech, Arduino",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 11, 8, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Wig Sculpting Masterclass: Defying Gravity for Anime Spikes",
                FandomUniverse = "Wig Artistry",
                ContentType = "Video",
                Description = "Crimping techniques, got2b glue laminations, and hidden felt structures for extreme anime silhouettes.",
                ContentText = "Transforming synthetic hair into rigid, aerodynamic spikes capable of surviving 12-hour convention days without sagging under stage heat.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85",
                Author = "Mei Ling",
                Tags = "Wig Styling, Anime, Hair Sculpting, Crafting",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2025, 9, 30, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Silicone Prosthetics & SFX Makeup: Becoming the Night City Cyberpsycho",
                FandomUniverse = "Special Effects Workshop",
                ContentType = "Image",
                Description = "Sculpting facial cyberware plates, encapsulating silicone appliances, and airbrushing vascular skin tones.",
                ContentText = "Creating seamless transitions between flesh and chrome requires anatomical understanding and skin-safe silicone casting with medical adhesive bonds.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "SFX Makeup, Cyberpunk, Prosthetics, Silicone",
                PopularityScore = 96,
                ReleaseDate = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "The Art of Weathering: Making Fabric and Armor Look Battle-Worn",
                FandomUniverse = "Costume Design Guild",
                ContentType = "Article",
                Description = "Dremel scuffing, shoe polish washes, dry-brushing silver highlights, and tea-staining medieval tunics.",
                ContentText = "A pristine costume looks like plastic; a weathered costume looks like it has survived ten skirmishes in the mud of Kaer Morhen.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Weathering, Painting, Armor, Textile Aging",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2025, 6, 25, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Convention Hallway Photography: Lighting and Portable Strobe Rigs",
                FandomUniverse = "Cosplay Photography",
                ContentType = "Article",
                Description = "Godox AD200 strobes, magmod diffusers, and working in crowded convention center environments.",
                ContentText = "How professional cosplay photographers isolate subjects from convention crowds using high-speed sync and shallow depth of field.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=85",
                Author = "Arthur Sterling",
                Tags = "Photography, Lighting, Convention, Portraits",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2025, 5, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Worbla vs. EVA Foam: Choosing the Right Substrate for Fantasy Armor",
                FandomUniverse = "Prop Engineering Lab",
                ContentType = "Article",
                Description = "Comparing tensile strength, compound curves, reusability, and weight across modern thermoplastics.",
                ContentText = "Worbla provides indestructible structural rigidity for chestplates and gauntlets, while dense EVA foam offers lightweight volume and clean beveled edges.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Worbla, EVA Foam, Materials Guide, Cosplay",
                PopularityScore = 92,
                ReleaseDate = new DateTime(2025, 4, 4, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "LED NeoPixel Programming: Illuminating Genshin Impact & Sci-Fi Weapons",
                FandomUniverse = "ElectroCraft Studio",
                ContentType = "Video",
                Description = "FastLED library animations, diffusion silicone tubes, and rechargeable 18650 battery integration.",
                ContentText = "Adding breathing light pulses and elemental color cycles transforms static plastic blades into magical glowing relics.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=85",
                Author = "Alex Rivera",
                Tags = "Electronics, NeoPixel, Coding, Prop Making",
                PopularityScore = 95,
                ReleaseDate = new DateTime(2025, 3, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Leatherworking for Fantasy: Carving Runes and Hand-Stitching Sheaths",
                FandomUniverse = "Traditional Crafts",
                ContentType = "Article",
                Description = "Vegetable-tanned leather, swivel knife carving, beveling, and burnishing edges with gum tragacanth.",
                ContentText = "For medieval knights, assassins, and witchers, nothing replicates the tactile presence and aroma of authentic hand-dyed leather.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=85",
                Author = "Marcus Thorne",
                Tags = "Leather, Medieval, Handcraft, Props",
                PopularityScore = 89,
                ReleaseDate = new DateTime(2025, 1, 28, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Cosplay Stage Performance: Blocking, Audio Cues, and Stage Combat",
                FandomUniverse = "Performance Guild",
                ContentType = "Article",
                Description = "Preparing 3-minute competitive skits for EuroCosplay and World Cosplay Summit judging.",
                ContentText = "Costume accuracy is only fifty percent of the competition score; body posture, theatrical voice projection, and safe stage choreography win trophies.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=85",
                Author = "Mei Ling",
                Tags = "Stage, Performance, Competition, WCS",
                PopularityScore = 90,
                ReleaseDate = new DateTime(2024, 11, 19, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Corsetry & Ballgowns: Historical Boning and Victorian Pattern Drafting",
                FandomUniverse = "Haute Couture Cosplay",
                ContentType = "Article",
                Description = "Spiral steel boning, coutil lining, and hoop skirts for regal royalty and anime empresses.",
                ContentText = "Constructing dresses with 20-meter fabric circumferences requires structural engineering underneath the lace and brocade.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=85",
                Author = "Sarah Jenkins",
                Tags = "Sewing, Ballgown, Corsetry, Historical Craft",
                PopularityScore = 91,
                ReleaseDate = new DateTime(2024, 9, 26, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Upcoming: Global Cosplay Expo 2026 — Master Artisan Championship",
                FandomUniverse = "International Cosplay Circuit",
                ContentType = "Article",
                Description = "Registration rules, international qualifying cities, and grand stage prize announcements for late 2026.",
                ContentText = "Featuring over 40 country delegacies competing under revised material innovation and eco-friendly fabrication categories.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=85",
                Author = "Kira 'Volta' Hoshino",
                Tags = "Convention, Competition, Global, Upcoming",
                PopularityScore = 93,
                ReleaseDate = new DateTime(2026, 11, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "Resin Eye Casting & Doll Sculpting: Anime Head Fabrication",
                FandomUniverse = "Animegao Kigurumi Lab",
                ContentType = "Article",
                Description = "Vacuum forming acrylic shells, casting high-gloss resin cabochon irises, and internal cooling fans.",
                ContentText = "Creating complete anime face masks with accurate ocular depth while maintaining breathable air circulation for the performer.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85",
                Author = "Alex Rivera",
                Tags = "Kigurumi, Masks, Resin, Animegao",
                PopularityScore = 88,
                ReleaseDate = new DateTime(2024, 7, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new ContentItem
            {
                CategoryId = Cat("cosplay"),
                Title = "The Convention Survival Kit: Emergency Repairs and Safety On the Go",
                FandomUniverse = "Cosplay Care Guild",
                ContentType = "Article",
                Description = "Safety pins, industrial hot glue guns, emergency needle threaders, and electrolyte hydration packs.",
                ContentText = "Every experienced cosplayer knows that costume preservation requires a tactical repair fanny pack ready to mend torn seams or broken straps at a moment's notice.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
                MediaUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=85",
                Author = "Mei Ling",
                Tags = "Survival Guide, Convention, Tips, Repair Kit",
                PopularityScore = 94,
                ReleaseDate = new DateTime(2024, 5, 14, 0, 0, 0, DateTimeKind.Utc)
            }
        };
    }

    public static List<Character> GetSeedCharacters(Dictionary<string, int> catMap)
    {
        int Cat(string slug) => catMap.TryGetValue(slug, out var id) ? id : catMap.Values.FirstOrDefault();

        return new List<Character>
        {
            new Character
            {
                CategoryId = Cat("gaming"),
                Name = "Johnny Silverhand",
                FandomUniverse = "Cyberpunk Universe",
                RoleTitle = "Rockerboy & Digital Ghost",
                Bio = "Legendary frontman of Samurai and notorious anti-corporate rebel who fought Arasaka to the bitter end.",
                Abilities = "Charismatic leadership, virtuoso guitarist, cybernetic arm combat, tactical firebrand.",
                Backstory = "Born Robert John Linder, Silverhand served in the Second Central American War before deserting and founding Samurai in 2003.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80",
                OriginUniverse = "Night City (Cyberpunk 2077)",
                VoiceActor = "Keanu Reeves",
                PopularityScore = 99
            },
            new Character
            {
                CategoryId = Cat("anime"),
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
                PopularityScore = 98
            },
            new Character
            {
                CategoryId = Cat("gaming"),
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
                PopularityScore = 97
            },
            new Character
            {
                CategoryId = Cat("anime"),
                Name = "Levi Ackerman",
                FandomUniverse = "Attack on Titan",
                RoleTitle = "Survey Corps Captain",
                Bio = "Humanity's strongest soldier, renowned for his unmatched ODM gear velocity and ruthless precision against Titans.",
                Abilities = "Ackerman bloodline awakened instincts, hypersonic ODM maneuvering, dual ultrahard blade cyclone strikes.",
                Backstory = "Raised in the squalor of the Underground city by Kenny the Ripper, Levi was recruited into the Survey Corps by Erwin Smith.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1600&q=80",
                OriginUniverse = "Paradis Island (Attack on Titan)",
                VoiceActor = "Hiroshi Kamiya",
                PopularityScore = 98
            },
            new Character
            {
                CategoryId = Cat("movies"),
                Name = "Paul Atreides",
                FandomUniverse = "Dune Universe",
                RoleTitle = "Duke of House Atreides & Muad'Dib",
                Bio = "Heir to Caladan who embraced the desert Fremen ways, drinking the Water of Life to unlock terrifying prescience.",
                Abilities = "Bene Gesserit Voice, Prana-bindu bodily control, desert survival, absolute Kwisatz Haderach prescience.",
                Backstory = "Trained by Duncan Idaho and Gurney Halleck, Paul led the Fremen jihad across the known universe after the Harkonnen massacre.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80",
                OriginUniverse = "Arrakis (Dune)",
                VoiceActor = "Timothée Chalamet",
                PopularityScore = 96
            },
            new Character
            {
                CategoryId = Cat("gaming"),
                Name = "Jinx (Powder)",
                FandomUniverse = "Arcane / League of Legends",
                RoleTitle = "Loose Cannon of Zaun",
                Bio = "Manic criminal mastermind and mechanical savant whose Shimmer enhancements and explosive arsenal terrorize Piltover.",
                Abilities = "Fishbones rocket launcher, Pow-Pow minigun, Flame Chompers, Shimmer hyper-reflexes, genius pyrotechnic engineering.",
                Backstory = "Traumatized by the loss of her adoptive family in the Zaun underground, Powder embraced chaos under the mentorship of Silco.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80",
                OriginUniverse = "Zaun & Piltover (Runeterra)",
                VoiceActor = "Ella Purnell",
                PopularityScore = 97
            },
            new Character
            {
                CategoryId = Cat("comics"),
                Name = "Miles Morales",
                FandomUniverse = "Spider-Man / Marvel",
                RoleTitle = "Brooklyn's Spider-Man",
                Bio = "Teenager bitten by an Alchemax genetically modified spider, inheriting Peter Parker's mantle across the Spider-Verse.",
                Abilities = "Wall-crawling, Spider-Sense, Bio-electric Venom Strike, active camouflage invisibility, web-swinging agility.",
                Backstory = "Juggling Brooklyn high school expectations and multiversal anomalies, Miles proved that anyone can wear the mask.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1600&q=80",
                OriginUniverse = "Earth-1610 (Brooklyn, NY)",
                VoiceActor = "Shameik Moore",
                PopularityScore = 97
            },
            new Character
            {
                CategoryId = Cat("comics"),
                Name = "Bruce Wayne (The Batman)",
                FandomUniverse = "DC Universe",
                RoleTitle = "The Dark Knight & World's Greatest Detective",
                Bio = "Gotham City's vigilante protector who weaponized fear, forensic genius, and peak human martial discipline against criminal corruption.",
                Abilities = "Master of 127 martial arts, deductive criminology, genius-level intellect, stealth mastery, WayneTech arsenal.",
                Backstory = "Witnessing his parents' murder in Crime Alley as a child, Bruce dedicated his life and fortune to an unending crusade for justice.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80",
                OriginUniverse = "Gotham City (DC Comics)",
                VoiceActor = "Kevin Conroy",
                PopularityScore = 99
            },
            new Character
            {
                CategoryId = Cat("manga"),
                Name = "Guts",
                FandomUniverse = "Berserk",
                RoleTitle = "The Black Swordsman",
                Bio = "Tragic branded mercenary cursed to battle horrific demonic apostles every night while wielding the colossal Dragonslayer.",
                Abilities = "Dragonslayer greatsword mastery, prosthetic cannon arm, Berserker Armor transcendent stamina, indomitable human grit.",
                Backstory = "Born from a corpse beneath a hanging tree, Guts survived grueling mercenary battlefields before Griffith's fateful betrayal during the Eclipse.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
                OriginUniverse = "Kingdom of Midland (Berserk)",
                VoiceActor = "Hiroaki Iwanaga",
                PopularityScore = 98
            },
            new Character
            {
                CategoryId = Cat("anime"),
                Name = "Makima",
                FandomUniverse = "Chainsaw Man Universe",
                RoleTitle = "Control Devil & Public Safety Chief",
                Bio = "Enigmatic high-ranking Public Safety Devil Hunter who exerts absolute psychological and physical dominion over all she deems inferior.",
                Abilities = "Control manipulation, invisible concussive force strikes, animal sensory commandeering, contract immortality.",
                Backstory = "The embodiment of the fear of control, Makima orchestrated Denji's life to break his pact with the Chainsaw Devil and create an ideal world.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80",
                OriginUniverse = "Public Safety Division 4 (Tokyo)",
                VoiceActor = "Tomori Kusunoki",
                PopularityScore = 95
            },
            new Character
            {
                CategoryId = Cat("gaming"),
                Name = "YoRHa No.2 Type B (2B)",
                FandomUniverse = "NieR: Automata",
                RoleTitle = "YoRHa All-Purpose Combat Android",
                Bio = "Stoic combat android deployed to Earth during the 14th Machine War, bound by the strict decree that soldiers are forbidden to show emotion.",
                Abilities = "Virtuous Contract dual-sword choreography, Pod 042 support fire, short-range phase evades, self-destruct override.",
                Backstory = "Created to eradicate machine lifeforms, 2B conceals her true designation as an executioner model tasked with eliminating 9S whenever he learns the truth.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80",
                OriginUniverse = "Ruined Earth (NieR: Automata)",
                VoiceActor = "Yui Ishikawa",
                PopularityScore = 96
            },
            new Character
            {
                CategoryId = Cat("tv-shows"),
                Name = "Walter White (Heisenberg)",
                FandomUniverse = "Breaking Bad",
                RoleTitle = "Methamphetamine Kingpin",
                Bio = "Underpaid high school chemistry teacher diagnosed with terminal lung cancer who transformed into the Southwest's most feared drug lord.",
                Abilities = "Master chemist, psychological manipulation, cold strategic planning, ruthless empire building.",
                Backstory = "Cheated out of Gray Matter Technologies in his youth, Walter unleashed decades of buried pride and calculated wrath under the moniker Heisenberg.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=80",
                OriginUniverse = "Albuquerque, New Mexico",
                VoiceActor = "Bryan Cranston",
                PopularityScore = 98
            },
            new Character
            {
                CategoryId = Cat("tv-shows"),
                Name = "Daemon Targaryen",
                FandomUniverse = "House of the Dragon",
                RoleTitle = "The Rogue Prince & Rider of Caraxes",
                Bio = "Mercurial Targaryen warrior prince wielding the Valyrian steel blade Dark Sister atop the ferocious Blood Wyrm Caraxes.",
                Abilities = "Valyrian steel mastery, aerial dragon combat, fearlessness, fierce dynastic loyalty.",
                Backstory = "Passed over for succession in favor of Viserys, Daemon fought brutal skirmishes in the Stepstones before wedding Rhaenyra to defend the Black faction.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&q=80",
                OriginUniverse = "Dragonstone & King's Landing",
                VoiceActor = "Matt Smith",
                PopularityScore = 96
            },
            new Character
            {
                CategoryId = Cat("movies"),
                Name = "Neo (Thomas Anderson)",
                FandomUniverse = "Matrix Universe",
                RoleTitle = "The One & Zion's Savior",
                Bio = "Software programmer who swallowed the red pill, unlocking code manipulation and airborne mastery within the simulated reality.",
                Abilities = "Bullet-time evasion, telekinetic machine disruption, flight, omni-martial arts mastery, Matrix source code rewriting.",
                Backstory = "Freed by Morpheus from the human harvesting pods, Neo ended the Machine War through self-sacrifice within the Source.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80",
                OriginUniverse = "The Matrix & Real World Zion",
                VoiceActor = "Keanu Reeves",
                PopularityScore = 97
            },
            new Character
            {
                CategoryId = Cat("gaming"),
                Name = "Malenia, Blade of Miquella",
                FandomUniverse = "Lands Between (Elden Ring)",
                RoleTitle = "Goddess of Rot & Empyrean Champion",
                Bio = "Unbeaten swordswoman born cursed with the Scarlet Rot, who never knew defeat while defending her twin brother Miquella at the Haligtree.",
                Abilities = "Waterfowl Dance, Scarlet Aeonia bloom, prosthetic blade flurry, life-steal on hit, golden needle suppression.",
                Backstory = "Clashing to a standstill against General Radahn in Caelid, Malenia bloomed her rot across the battlefield before slumbering at the roots.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80",
                OriginUniverse = "Elphael, Brace of the Haligtree",
                VoiceActor = "Pippa Bennett-Warner",
                PopularityScore = 97
            },
            new Character
            {
                CategoryId = Cat("cosplay"),
                Name = "Kaelen 'Forge' Vance",
                FandomUniverse = "Cosplay Craft Guild",
                RoleTitle = "Grandmaster Armorsmith & Fabricator",
                Bio = "Multi-time international cosplay champion renowned for pneumatic mech articulation, glowing resin gems, and high-density EVA foam alchemy.",
                Abilities = "3D CAD modeling, thermoplastic vacuum shaping, micro-circuit soldering, weathering paint illusionism.",
                Backstory = "Starting in a humble garage workshop with a boxcutter and heat gun, Kaelen rose to mentor hundreds of aspiring costume fabricators across global conventions.",
                AvatarUrl = "",
                BannerUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&q=80",
                OriginUniverse = "International Cosplay Circuit",
                VoiceActor = "Self-Portrayed Artisan",
                PopularityScore = 92
            }
        };
    }

    public static List<MediaItem> GetSeedMediaItems(Dictionary<string, int> catMap)
    {
        int Cat(string slug) => catMap.TryGetValue(slug, out var id) ? id : catMap.Values.FirstOrDefault();

        return new List<MediaItem>
        {
            new MediaItem
            {
                CategoryId = Cat("gaming"),
                Title = "Cyberpunk 2077 — Official E3 2019 Cinematic Trailer",
                FandomUniverse = "Cyberpunk Universe",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/qIcTM8WXFjk",
                ThumbnailUrl = "/media/gaming_trailer.jpg",
                Description = "Official cinematic trailer by CD PROJEKT RED featuring Johnny Silverhand (Keanu Reeves) in Night City.",
                Tags = "Trailer, Cyberpunk, Cinematic, Johnny Silverhand, CD PROJEKT RED",
                DurationSeconds = 250,
                AverageRating = 4.9,
                RatingsCount = 184
            },
            new MediaItem
            {
                CategoryId = Cat("anime"),
                Title = "Jujutsu Kaisen Season 2 Shibuya Incident OP — SPECIALZ (King Gnu)",
                FandomUniverse = "Jujutsu Kaisen",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=fhzKLBZJC3w",
                ThumbnailUrl = "/media/jjk_specialz.jpg",
                Description = "Official music video and theme song by King Gnu capturing the Shibuya Incident.",
                Tags = "OST, Shibuya Incident, King Gnu, Official Theme, Soundtrack",
                DurationSeconds = 240,
                AverageRating = 4.8,
                RatingsCount = 142
            },
            new MediaItem
            {
                CategoryId = Cat("movies"),
                Title = "Interstellar OST — No Time For Caution (Hans Zimmer)",
                FandomUniverse = "Sci-Fi Cinema",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=kpK4cDk2bRs",
                ThumbnailUrl = "/media/interstellar.jpg",
                Description = "Official soundtrack release by WaterTower Music, composed by Hans Zimmer for the Endurance docking sequence.",
                Tags = "Soundtrack, Hans Zimmer, Sci-Fi, WaterTower Music, Official Release",
                DurationSeconds = 246,
                AverageRating = 5.0,
                RatingsCount = 265
            },
            new MediaItem
            {
                CategoryId = Cat("movies"),
                Title = "Dune: Part Two — Official Main Trailer",
                FandomUniverse = "Dune Universe",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/Way9Dexny3w",
                ThumbnailUrl = "/media/movie_trailer.jpg",
                Description = "Warner Bros. Pictures official trailer showcasing Paul Atreides riding the sandworms of Arrakis.",
                Tags = "Trailer, Dune, Warner Bros, Timothee Chalamet, Sci-Fi",
                DurationSeconds = 182,
                AverageRating = 4.9,
                RatingsCount = 210
            },
            new MediaItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "Arcane Season 2 — Official Trailer (Netflix)",
                FandomUniverse = "Piltover & Zaun",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/watch?v=3Svs_hl897c",
                ThumbnailUrl = "/media/arcane_trailer.jpg",
                Description = "The official final season trailer for Arcane: League of Legends by Riot Games & Fortiche Production.",
                Tags = "Trailer, Arcane, Netflix, Riot Games, Animation",
                DurationSeconds = 160,
                AverageRating = 5.0,
                RatingsCount = 312
            },
            new MediaItem
            {
                CategoryId = Cat("anime"),
                Title = "Attack on Titan Final Season — The Rumbling (SiM)",
                FandomUniverse = "Attack on Titan",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=2S4qGKmzBJE",
                ThumbnailUrl = "/media/aot_rumbling.jpg",
                Description = "SiM's explosive metal opening theme for Attack on Titan: The Final Season Part 2.",
                Tags = "OST, Heavy Metal, SiM, Eren Yeager, Opening",
                DurationSeconds = 220,
                AverageRating = 4.9,
                RatingsCount = 195
            },
            new MediaItem
            {
                CategoryId = Cat("gaming"),
                Title = "Elden Ring: Shadow of the Erdtree — Official Gameplay Reveal",
                FandomUniverse = "Lands Between",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/qLZenOn7WUo",
                ThumbnailUrl = "/media/eldenring_erdtree.jpg",
                Description = "FromSoftware official gameplay trailer revealing Messmer the Impaler and the Land of Shadow.",
                Tags = "Gameplay, FromSoftware, Elden Ring, Messmer, DLC",
                DurationSeconds = 186,
                AverageRating = 4.9,
                RatingsCount = 278
            },
            new MediaItem
            {
                CategoryId = Cat("k-pop"),
                Title = "NewJeans — 'Super Shy' Official MV",
                FandomUniverse = "ADOR / HYBE Lore",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/ArmDp-zijuc",
                ThumbnailUrl = "/media/newjeans_supershy.jpg",
                Description = "Official music video directed by Shin Woo-seok featuring Lisbon flashmob choreography and Y2K aesthetic.",
                Tags = "Music Video, NewJeans, K-Pop, Flashmob, Summer",
                DurationSeconds = 195,
                AverageRating = 4.8,
                RatingsCount = 189
            },
            new MediaItem
            {
                CategoryId = Cat("k-pop"),
                Title = "BTS — 'Blood Sweat & Tears' Official MV",
                FandomUniverse = "Bangtan Universe",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/hmE9f-TEutc",
                ThumbnailUrl = "/media/bts_bst.jpg",
                Description = "The monumental WINGS era masterpiece combining baroque art museums with Demian literary symbolism.",
                Tags = "Music Video, BTS, Classical, Lore, Worldwide",
                DurationSeconds = 363,
                AverageRating = 4.9,
                RatingsCount = 340
            },
            new MediaItem
            {
                CategoryId = Cat("comics"),
                Title = "Spider-Man: Across the Spider-Verse — Official Trailer",
                FandomUniverse = "Spider-Verse",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/embed/cqGjhVJWtEg",
                ThumbnailUrl = "/media/spiderverse_trailer.jpg",
                Description = "Sony Pictures Animation official trailer showing Miles Morales facing hundreds of Spider-People across dimensions.",
                Tags = "Trailer, Marvel, Sony, Spider-Man, Animation",
                DurationSeconds = 170,
                AverageRating = 4.9,
                RatingsCount = 245
            },
            new MediaItem
            {
                CategoryId = Cat("movies"),
                Title = "Blade Runner 2049 — 'Tears In Rain' Synthesizer Tribute",
                FandomUniverse = "Blade Runner Universe",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=by2pM_0Sf8c",
                ThumbnailUrl = "/media/bladerunner_2049.jpg",
                Description = "Vangelis-inspired analogue CS-80 synthesizer soundscapes honoring Roy Batty and Officer K.",
                Tags = "Audio, Synthwave, Blade Runner, Ambient, Sci-Fi",
                DurationSeconds = 310,
                AverageRating = 4.9,
                RatingsCount = 160
            },
            new MediaItem
            {
                CategoryId = Cat("gaming"),
                Title = "The Witcher 3: Wild Hunt — 'Silver for Monsters' OST",
                FandomUniverse = "The Witcher",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=jRG0gyVFP60",
                ThumbnailUrl = "/media/witcher_monsters.jpg",
                Description = "Percival Schuttenbach and Marcin Przybyłowicz's iconic Slavic battle chant from Velen and Skellige.",
                Tags = "OST, Slavic, Witcher, Marcin Przybylowicz, Percival",
                DurationSeconds = 145,
                AverageRating = 5.0,
                RatingsCount = 280
            },
            new MediaItem
            {
                CategoryId = Cat("tv-shows"),
                Title = "House of the Dragon — Official Season 2 Teaser",
                FandomUniverse = "Westeros Universe",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/watch?v=HQ8H5gqGA34",
                ThumbnailUrl = "/media/hotd_teaser.jpg",
                Description = "HBO official teaser for the Dance of the Dragons war between Green and Black factions.",
                Tags = "Trailer, HBO, Dragons, Westeros, Teaser",
                DurationSeconds = 100,
                AverageRating = 4.8,
                RatingsCount = 175
            },
            new MediaItem
            {
                CategoryId = Cat("manga"),
                Title = "Berserk — 'Forces' (Susumu Hirasawa) Remastered",
                FandomUniverse = "Midland (Berserk)",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=jwu6YmLEBj8",
                ThumbnailUrl = "/media/anime_ost.jpg",
                Description = "Susumu Hirasawa's legendary battle anthem featuring soaring choral vocalizations and industrial martial rhythms.",
                Tags = "OST, Berserk, Susumu Hirasawa, Epic, Cult Classic",
                DurationSeconds = 244,
                AverageRating = 5.0,
                RatingsCount = 295
            },
            new MediaItem
            {
                CategoryId = Cat("cosplay"),
                Title = "World Cosplay Summit Championship — Stage Highlights",
                FandomUniverse = "Cosplay Craft Guild",
                MediaType = "Video",
                MediaUrl = "https://www.youtube.com/watch?v=Ye--yX7dyYU",
                ThumbnailUrl = "/media/cosplay_summit.jpg",
                Description = "Artistic grand stage performance showcase featuring illuminated LED armor and acrobatics in Nagoya, Japan.",
                Tags = "Performance, WCS, Armor, Stage, Championship",
                DurationSeconds = 310,
                AverageRating = 4.7,
                RatingsCount = 110
            },
            new MediaItem
            {
                CategoryId = Cat("gaming"),
                Title = "NieR: Automata — 'Weight of the World' (J'Nique Nicole)",
                FandomUniverse = "NieR Universe",
                MediaType = "Audio",
                MediaUrl = "https://www.youtube.com/watch?v=Yza2l5sWYzg",
                ThumbnailUrl = "/media/game_ost.jpg",
                Description = "Keiichi Okabe's emotionally overwhelming ending theme concluding the androids' struggle for existential purpose.",
                Tags = "OST, NieR, Keiichi Okabe, Choral, Masterpiece",
                DurationSeconds = 345,
                AverageRating = 5.0,
                RatingsCount = 310
            }
        };
    }
}
