import React, { lazy, Suspense, useState } from 'react'
import type { Category } from '../types'
import { ArrowRightIcon, BookOpenIcon, ClapperboardIcon, GamepadIcon, MaskIcon, MessageSquareIcon, MusicIcon, PlayIcon, ToriiIcon, TvIcon } from './Icons'
import { NexusArchitectureFallback, NexusWorld } from './NexusWorld'
import './NexusGateHero.css'

const NexusGate3DCanvas = lazy(() => import('./NexusGate3DCanvas').then(module => ({ default: module.NexusGate3DCanvas })))

interface NexusGateHeroProps {
  categories: Category[]
  selectedCategorySlug: string | null
  onSelectCategory: (slug: string | null) => void
  onExploreClick: () => void
  onWatchPreviewClick: () => void
  theme: 'dark' | 'light'
}

const FANDOM_PORTALS = [
  { name: 'ANIME', slug: 'anime', Icon: ToriiIcon },
  { name: 'GAMING', slug: 'gaming', Icon: GamepadIcon },
  { name: 'MOVIES', slug: 'movies', Icon: ClapperboardIcon },
  { name: 'TV', slug: 'tv-shows', Icon: TvIcon },
  { name: 'K-POP', slug: 'k-pop', Icon: MusicIcon },
  { name: 'COMICS', slug: 'comics', Icon: MessageSquareIcon },
  { name: 'MANGA', slug: 'manga', Icon: BookOpenIcon },
  { name: 'COSPLAY', slug: 'cosplay', Icon: MaskIcon },
]

export const NexusGateHero: React.FC<NexusGateHeroProps> = ({ onSelectCategory, onExploreClick, onWatchPreviewClick, selectedCategorySlug, theme }) => {
  const [activeFacet, setActiveFacet] = useState<number | null>(null)
  return <section className="nexus-hero-section" aria-label="Fandom Multiverse Portal">
    <div className="hero-grid-layout">
      <div className="hero-left-column">
        <div className="eyebrow-accent">EIGHT WORLDS. ONE HOME.</div>
        <h1 className="hero-main-title">Every fandom.<br /><span className="title-crimson">One universe.</span></h1>
        <p className="hero-lead-text">Discover amazing stories, characters and events from every fan world, all in one place.</p>
        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={onExploreClick} aria-label="Explore worlds"><span>Explore worlds</span><ArrowRightIcon size={18} className="btn-arrow" /></button>
          <button className="btn-hero-secondary" onClick={onWatchPreviewClick} aria-label="Watch the preview"><span className="play-circle-icon"><PlayIcon size={11} fill="currentColor" /></span><span>Watch the preview</span></button>
        </div>
      </div>
      <div className="hero-nexus-container">
        <div className="nexus-chamber" aria-hidden="true"><span /><span /><span /></div>
        <div className="nexus-stage">
          <Suspense fallback={<div className="nexus-3d-canvas-wrap"><NexusArchitectureFallback /></div>}><NexusGate3DCanvas theme={theme} activeFacet={activeFacet} /></Suspense>
          <div className="nexus-contact-shadow" aria-hidden="true" />
          <button className="portal-inner-aperture" onClick={onExploreClick} aria-label="Enter central multiverse gate"><NexusWorld /></button>
          <nav className="nexus-entry-points" aria-label="Eight fandom universes">
            {FANDOM_PORTALS.map(({ name, slug, Icon }, index) => {
              const angle = index * Math.PI / 4 - Math.PI / 2
              return <button key={slug} className="portal-facet" style={{left: `${50 + Math.cos(angle)*33.1}%`, top: `${46 + Math.sin(angle)*33.1}%`}} onClick={() => onSelectCategory(slug)} onPointerEnter={() => setActiveFacet(index)} onPointerLeave={() => setActiveFacet(null)} onFocus={() => setActiveFacet(index)} onBlur={() => setActiveFacet(null)} aria-label={`Enter ${name} Realm`} aria-pressed={selectedCategorySlug === slug}>
                <Icon size={24} className="facet-svg-icon" /><span className="facet-label">{name}</span>
              </button>
            })}
          </nav>
        </div>
      </div>
    </div>
  </section>
}
