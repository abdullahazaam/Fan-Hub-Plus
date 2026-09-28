import React, { Suspense } from 'react'
import type { Category } from '../types'
import { HeroSceneFallback } from './NexusHeroFallback'
import HeroScene from './NexusHeroScene'
import './NexusGateHero.css'
interface NexusGateHeroProps {
  onExploreClick: () => void
  theme: 'dark' | 'light'
  categories?: Category[]
  selectedCategorySlug?: string | null
  onSelectCategory?: (slug: string | null) => void
  onWatchPreviewClick?: () => void
}

export const NexusGateHero: React.FC<NexusGateHeroProps> = ({onExploreClick, onSelectCategory, theme, selectedCategorySlug}) => {
  const select = (slug: string) => onSelectCategory ? onSelectCategory(slug) : onExploreClick()
  return <section className={`fh-nexus-hero theme-${theme}`} aria-label="Fan Hub Plus Multiverse Gate">
    <div className="fh-nexus-stage">
      <Suspense fallback={<HeroSceneFallback theme={theme} onSelect={select} selected={selectedCategorySlug} />}>
        <HeroScene theme={theme} onSelect={select} selected={selectedCategorySlug} />
      </Suspense>
    </div>
    <div className="fh-nexus-copy">
      <div className="fh-nexus-eyebrow"><i aria-hidden="true" /> FAN HUB PLUS</div>
      <h1><span>DON'T BROWSE</span><span>FANDOMS.</span><strong>ENTER THEM.</strong></h1>
      <div className="fh-nexus-tagline">8 REALMS / ONE LIVING ARCHIVE</div>
      <p>Explore stories, characters, media, events and more across the ultimate fandom multiverse.</p>
      <button type="button" onClick={onExploreClick} aria-label="Enter the Nexus">ENTER THE NEXUS <span aria-hidden="true">→</span></button>
    </div>
  </section>
}
