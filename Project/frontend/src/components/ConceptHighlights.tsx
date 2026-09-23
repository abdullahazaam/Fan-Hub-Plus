import React from 'react'
import { ArrowRightIcon } from './Icons'

interface ConceptHighlightsProps {
  onExploreWorld: () => void
  onExploreCharacters: () => void
  onExploreMedia: () => void
}

export const ConceptHighlights: React.FC<ConceptHighlightsProps> = ({
  onExploreWorld,
  onExploreCharacters,
  onExploreMedia,
}) => {
  return (
    <section className="concept-highlights-section" aria-label="Portal highlights">
      <div className="highlights-grid">
        {/* Card 1: Global Fandom Worlds / Expo */}
        <article className="concept-card" onClick={onExploreWorld} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onExploreWorld() }}>
          <div className="concept-card-media">
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
              alt="Global Fan Expo"
              className="concept-card-img"
              loading="lazy"
            />
            <div className="concept-card-overlay" />
          </div>
          <div className="concept-card-body">
            <div className="concept-category-eyebrow">WORLDS & EVENTS</div>
            <h3 className="concept-card-title">Global Fan Expo & Lore</h3>
            <p className="concept-card-desc">Communities. Creators. A Bigger Tomorrow.</p>
            <div className="concept-card-arrow" aria-hidden="true">
              <ArrowRightIcon size={15} />
            </div>
          </div>
        </article>

        {/* Card 2: Characters Spotlight */}
        <article className="concept-card" onClick={onExploreCharacters} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onExploreCharacters() }}>
          <div className="concept-card-media">
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80"
              alt="Icons Across Worlds"
              className="concept-card-img"
              loading="lazy"
            />
            <div className="concept-card-overlay" />
          </div>
          <div className="concept-card-body">
            <div className="concept-category-eyebrow">CHARACTERS</div>
            <h3 className="concept-card-title">Icons Across Worlds</h3>
            <p className="concept-card-desc">Legendary. Beloved. Always Here.</p>
            <div className="concept-card-arrow" aria-hidden="true">
              <ArrowRightIcon size={15} />
            </div>
          </div>
        </article>

        {/* Card 3: New Releases & Streams */}
        <article className="concept-card" onClick={onExploreMedia} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onExploreMedia() }}>
          <div className="concept-card-media">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
              alt="What's New In Multiverse"
              className="concept-card-img"
              loading="lazy"
            />
            <div className="concept-card-overlay" />
          </div>
          <div className="concept-card-body">
            <div className="concept-category-eyebrow">RELEASES & STREAMS</div>
            <h3 className="concept-card-title">What's New In Multiverse</h3>
            <p className="concept-card-desc">Trailers. Updates. Fan Favourites.</p>
            <div className="concept-card-arrow" aria-hidden="true">
              <ArrowRightIcon size={15} />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
