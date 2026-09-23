import React from 'react'
import type { Category } from '../types'

interface NexusGateHeroProps {
  categories: Category[]
  selectedCategorySlug: string | null
  onSelectCategory: (slug: string | null) => void
  onExploreClick: () => void
  onWatchPreviewClick: () => void
  theme: 'dark' | 'light'
}

// 8 Fandom Worlds with icons/symbol representation matching the concept art
const FANDOM_PORTALS = [
  { name: 'ANIME', slug: 'anime', icon: '⛩', position: 'top' },
  { name: 'GAMING', slug: 'gaming', icon: '🎮', position: 'top-right' },
  { name: 'MOVIES', slug: 'movies', icon: '🎬', position: 'right' },
  { name: 'TV', slug: 'tv-shows', icon: '📺', position: 'bottom-right' },
  { name: 'K-POP', slug: 'k-pop', icon: '♫', position: 'bottom' },
  { name: 'COMICS', slug: 'comics', icon: '💬', position: 'bottom-left' },
  { name: 'MANGA', slug: 'manga', icon: '📖', position: 'left' },
  { name: 'COSPLAY', slug: 'cosplay', icon: '🎭', position: 'top-left' },
]

export const NexusGateHero: React.FC<NexusGateHeroProps> = ({
  onSelectCategory,
  onExploreClick,
  onWatchPreviewClick,
  theme,
}) => {
  return (
    <section className="nexus-hero-section" aria-label="Fandom Multiverse Portal">
      {/* Background Architectural Hall atmosphere */}
      <div className={`hall-architecture-bg ${theme}`} aria-hidden="true">
        <div className="hall-pillar pillar-left">
          <div className="hall-banner">
            <span className="banner-text">A BIGGER BRIGHTER FANDOM TOMORROW</span>
          </div>
        </div>
        <div className="hall-pillar pillar-right">
          <div className="hall-banner">
            <span className="banner-text">DIFFERENT WORLDS SAME PEOPLE</span>
          </div>
        </div>
        <div className="hall-floor-reflection" />
      </div>

      <div className="hero-grid-layout">
        {/* Left Column: Hero Title, Subtitle, and Call to Actions */}
        <div className="hero-left-column">
          <div className="eyebrow-accent">
            <span>EIGHT WORLDS. ONE HOME.</span>
          </div>

          <h1 className="hero-main-title">
            Every fandom.<br />
            <span className="title-crimson">One universe.</span>
          </h1>

          <p className="hero-lead-text">
            Discover amazing stories, characters and events from every fan world, all in one place.
          </p>

          <div className="hero-cta-group">
            <button
              className="btn-hero-primary"
              onClick={onExploreClick}
              aria-label="Explore worlds"
            >
              <span>Explore worlds</span>
              <span className="btn-arrow">→</span>
            </button>

            <button
              className="btn-hero-secondary"
              onClick={onWatchPreviewClick}
              aria-label="Watch the preview"
            >
              <span className="play-circle-icon">▶</span>
              <span>Watch the preview</span>
            </button>
          </div>
        </div>

        {/* Center / Right Column: Octagonal Nexus Gate Slot (Ready for Astra-6 3D) */}
        <div className="hero-nexus-container" id="nexus-gate-3d-slot">
          <div className="nexus-gate-apparatus">
            {/* The Outer Octagonal Frame */}
            <div className="octagonal-ring">
              {FANDOM_PORTALS.map((portal) => (
                <button
                  key={portal.slug}
                  className={`portal-facet facet-${portal.position}`}
                  onClick={() => onSelectCategory(portal.slug)}
                  title={`Enter ${portal.name} Realm`}
                  aria-label={`Enter ${portal.name} Realm`}
                >
                  <span className="facet-icon">{portal.icon}</span>
                  <span className="facet-label">{portal.name}</span>
                </button>
              ))}

              {/* The Inner Gate Portal Singularity */}
              <div
                className="portal-inner-aperture"
                onClick={onExploreClick}
                role="button"
                tabIndex={0}
                aria-label="Enter central multiverse gate"
              >
                <div className="portal-vortex-art">
                  <div className="portal-castle-silhouette" />
                  <div className="portal-cosmic-haze" />
                  <div className="portal-event-horizon-ring" />
                </div>
              </div>
            </div>

            {/* Platform steps & illumination underneath the gate */}
            <div className="gate-pedestal-steps">
              <div className="step-level step-1" />
              <div className="step-level step-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
