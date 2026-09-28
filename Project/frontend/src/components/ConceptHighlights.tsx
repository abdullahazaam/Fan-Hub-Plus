import React from 'react'
import { DepthCarousel3D } from './DepthCarousel3D'

interface ConceptHighlightsProps {
  onExploreWorld: () => void
  onExploreCharacters: () => void
  onExploreMedia: () => void
  onExploreEvents?: () => void
  onExploreReleases?: () => void
  theme?: 'dark' | 'light'
}

export const ConceptHighlights: React.FC<ConceptHighlightsProps> = ({
  onExploreWorld,
  onExploreCharacters,
  onExploreMedia,
  onExploreEvents,
  onExploreReleases,
  theme = 'dark',
}) => {
  return (
    <section className="concept-highlights-section" aria-label="Portal gateways">
      {/* Section Identity */}
      <div className="gateways-header">
        <div className="gateways-eyebrow">
          <span className="gateways-eyebrow-pip" />
          <span>YOUR GATEWAYS</span>
        </div>
        <h2 className="gateways-title">Choose Your Path Through the Multiverse</h2>
        <p className="gateways-subtitle">
          Explore the worlds, people and experiences shaping every corner of Fan Hub Plus.
        </p>
      </div>

      {/* True 3D Depth Carousel (Scrolltide Reference Interaction) */}
      <DepthCarousel3D
        theme={theme}
        onExploreWorld={onExploreWorld}
        onExploreCharacters={onExploreCharacters}
        onExploreMedia={onExploreMedia}
        onExploreEvents={onExploreEvents}
        onExploreReleases={onExploreReleases}
      />
    </section>
  )
}
export default ConceptHighlights
