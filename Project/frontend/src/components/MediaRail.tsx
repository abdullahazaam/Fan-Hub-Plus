import React, { useRef } from 'react'
import type { MediaItem } from '../types'
import { CardShell } from './CardShell'

interface MediaRailProps {
  items: MediaItem[]
  onSelectMedia: (item: MediaItem) => void
  onToggleBookmark?: (item: MediaItem) => void
  isBookmarked?: (id: number) => boolean
}

export const MediaRail: React.FC<MediaRailProps> = ({
  items,
  onSelectMedia,
  onToggleBookmark,
  isBookmarked,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <section className="media-rail-section" aria-label="Multimedia Rail">
      <div className="rail-header">
        <div className="rail-title-group">
          <span className="rail-eyebrow">AUDIOVISUAL MULTIVERSE</span>
          <h2 className="rail-heading">Trailers, Streams & Soundtracks</h2>
        </div>
        <div className="rail-controls">
          <button
            className="rail-arrow-btn"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            className="rail-arrow-btn"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div className="media-rail-track" ref={scrollRef}>
        {items.map((m) => (
          <CardShell
            key={m.id}
            className="rail-item-card"
            onClick={() => onSelectMedia(m)}
          >
            <div className="rail-thumbnail-box">
              <img
                src={m.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'}
                alt={m.title}
                className="rail-thumb-img"
                loading="lazy"
              />
              <div className="rail-thumb-overlay" />
              <div className="rail-play-badge">
                {m.mediaType.toLowerCase() === 'audio' ? '♫' : '▶'}
              </div>
              <span className="rail-format-pill">{m.mediaType}</span>

              {onToggleBookmark && isBookmarked && (
                <button
                  className={`btn-card-bookmark ${isBookmarked(m.id) ? 'bookmarked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleBookmark(m)
                  }}
                  title="Bookmark media"
                  aria-label="Bookmark media"
                >
                  {isBookmarked(m.id) ? '★' : '☆'}
                </button>
              )}
            </div>

            <div className="rail-item-details">
              <div className="rail-item-universe">{m.fandomUniverse}</div>
              <h4 className="rail-item-title">{m.title}</h4>
              <div className="rail-item-rating">
                <span className="star">★</span>
                <span>{m.averageRating.toFixed(1)}</span>
                <span className="count">({m.ratingsCount})</span>
              </div>
            </div>
          </CardShell>
        ))}
      </div>
    </section>
  )
}
