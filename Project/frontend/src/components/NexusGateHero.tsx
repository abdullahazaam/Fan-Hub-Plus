import React from 'react'
import type { Category } from '../types'
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClapperboardIcon,
  GamepadIcon,
  MaskIcon,
  MessageSquareIcon,
  MusicIcon,
  PlayIcon,
  ToriiIcon,
  TvIcon,
} from './Icons'

interface NexusGateHeroProps {
  categories: Category[]
  selectedCategorySlug: string | null
  onSelectCategory: (slug: string | null) => void
  onExploreClick: () => void
  onWatchPreviewClick: () => void
  theme: 'dark' | 'light'
}

// 8 Fandom Worlds with matching professional SVG icons
const FANDOM_PORTALS = [
  { name: 'ANIME', slug: 'anime', Icon: ToriiIcon, position: 'top' },
  { name: 'GAMING', slug: 'gaming', Icon: GamepadIcon, position: 'top-right' },
  { name: 'MOVIES', slug: 'movies', Icon: ClapperboardIcon, position: 'right' },
  { name: 'TV', slug: 'tv-shows', Icon: TvIcon, position: 'bottom-right' },
  { name: 'K-POP', slug: 'k-pop', Icon: MusicIcon, position: 'bottom' },
  { name: 'COMICS', slug: 'comics', Icon: MessageSquareIcon, position: 'bottom-left' },
  { name: 'MANGA', slug: 'manga', Icon: BookOpenIcon, position: 'left' },
  { name: 'COSPLAY', slug: 'cosplay', Icon: MaskIcon, position: 'top-left' },
]

export const NexusGateHero: React.FC<NexusGateHeroProps> = ({
  onSelectCategory,
  onExploreClick,
  onWatchPreviewClick,
  theme,
}) => {
  return (
    <section className="nexus-hero-section" aria-label="Fandom Multiverse Portal">
      {/* Background Architectural Hall atmosphere with subtle perspective and clean clearance */}
      <div className={`hall-architecture-bg ${theme}`} aria-hidden="true">
        <div className="hall-pillar pillar-far-left">
          <div className="hall-banner">
            <span className="banner-text">A BIGGER BRIGHTER FANDOM TOMORROW</span>
          </div>
        </div>
        <div className="hall-pillar pillar-far-right">
          <div className="hall-banner">
            <span className="banner-text">DIFFERENT WORLDS SAME PEOPLE</span>
          </div>
        </div>
        <div className="hall-floor-reflection" />
        <div className="hall-light-cone" />
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
              <ArrowRightIcon size={18} className="btn-arrow" />
            </button>

            <button
              className="btn-hero-secondary"
              onClick={onWatchPreviewClick}
              aria-label="Watch the preview"
            >
              <div className="play-circle-icon">
                <PlayIcon size={11} fill="currentColor" />
              </div>
              <span>Watch the preview</span>
            </button>
          </div>
        </div>

        {/* Center / Right Column: Large Focal Octagonal Nexus Gate */}
        <div className="hero-nexus-container" id="nexus-gate-3d-slot">
          <div className="nexus-gate-apparatus">
            {/* The Outer Octagonal Frame */}
            <div className="octagonal-ring">
              {FANDOM_PORTALS.map(({ name, slug, Icon, position }) => (
                <button
                  key={slug}
                  className={`portal-facet facet-${position}`}
                  onClick={() => onSelectCategory(slug)}
                  title={`Enter ${name} Realm`}
                  aria-label={`Enter ${name} Realm`}
                >
                  <Icon size={20} className="facet-svg-icon" />
                  <span className="facet-label">{name}</span>
                </button>
              ))}

              {/* The Inner Gate Portal Singularity */}
              <div
                className="portal-inner-aperture"
                onClick={onExploreClick}
                role="button"
                tabIndex={0}
                aria-label="Enter central multiverse gate"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onExploreClick()
                }}
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
              <div className="step-level step-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
