import React from 'react'
import type { ContentItem } from '../types'
import { CardShell } from './CardShell'

interface FeaturedStoryProps {
  item: ContentItem
  onSelect: (item: ContentItem) => void
  onToggleBookmark?: (item: ContentItem) => void
  isBookmarked?: boolean
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({
  item,
  onSelect,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  return (
    <CardShell className="featured-story-card" onClick={() => onSelect(item)}>
      <div className="story-image-canvas">
        <img
          src={item.mediaUrl || item.thumbnailUrl}
          alt={item.title}
          className="story-main-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85'
          }}
        />
        <div className="story-image-gradient" />
        <div className="story-badge-cluster">
          <span className="story-eyebrow-tag">FEATURED STORY</span>
          <span className="story-category-tag">{item.categoryName}</span>
        </div>

        {onToggleBookmark && (
          <button
            className={`btn-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(item)
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark story'}
            aria-label="Toggle bookmark"
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="story-content-pane">
        <div className="story-universe-label">{item.fandomUniverse}</div>
        <h2 className="story-headline">{item.title}</h2>
        <p className="story-description">{item.description}</p>

        <div className="story-meta-bar">
          <span className="story-author">{item.author}</span>
          <span className="story-dot">•</span>
          <span className="story-date">
            {new Date(item.releaseDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="story-dot">•</span>
          <span className="story-rating">★ {item.popularityScore}% Score</span>
        </div>

        <div className="story-read-cta">
          <span>Read Full Chronicle</span>
          <span className="cta-arrow">→</span>
        </div>
      </div>
    </CardShell>
  )
}
