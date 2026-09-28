import { CinematicImage } from './CinematicImage'
import React from 'react'
import type { ContentItem } from '../types'
import { CardShell } from './CardShell'
import { ArrowRightIcon, BookmarkIcon, StarIcon } from './Icons'

interface FeaturedStoryProps {
  editorialIndex?: number
  item: ContentItem
  onSelect: (item: ContentItem) => void
  onToggleBookmark?: (item: ContentItem) => void
  isBookmarked?: boolean
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({
  item,
  editorialIndex,
  onSelect,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  const topic = `${item.title} ${item.fandomUniverse}`.toLowerCase()
  const curatedArt = /berserk/.test(topic) ? {src:'/editorial/berserk.jpg', position:'50% 22%'}
    : /watchmen/.test(topic) ? {src:'/editorial/watchmen.jpg', position:'50% 42%'}
    : /\bbts\b|bangtan|hwayangyeonhwa/.test(topic) ? {src:'/editorial/bts-hyyh.jpg', position:'50% 32%'}
    : (item.id === 1063 || /sh[oō]gun|feudal japan|sengoku/i.test(topic)) ? {src:'/editorial/shogun.jpg', position:'50% 28%'} : null

  if (editorialIndex !== undefined) {
    const originalArtwork = /\.(avif|webp|png|jpe?g)(?:[?#]|$)/i.test(item.mediaUrl || '')
      ? item.mediaUrl : item.thumbnailUrl
    const artwork = curatedArt?.src || originalArtwork
    return (
      <article className={`edition-story edition-story-${editorialIndex + 1}`} style={{'--edition-art-position':curatedArt?.position || 'center'} as React.CSSProperties}>
        <CinematicImage universe={item.fandomUniverse || item.categoryName} src={artwork}
          alt={item.title} className="edition-artwork" loading="lazy" decoding="async" />
        <div className="edition-image-shade" aria-hidden="true" />
        <div className="edition-topline">
          <span className="edition-category">{item.categoryName}</span>
          <span className="edition-number" aria-hidden="true">0{editorialIndex + 1}</span>
        </div>
        <div className="edition-copy">
          {item.fandomUniverse && <span className="edition-universe">{item.fandomUniverse}</span>}
          <h3 className="edition-headline">{item.title}</h3>
          <p className="edition-description">{item.description}</p>
          <div className="edition-actions">
            <button type="button" className="edition-read" onClick={() => onSelect(item)} aria-label={`Read Chronicle: ${item.title}`}>
              Read Chronicle <ArrowRightIcon size={16} />
            </button>
            {onToggleBookmark && <button type="button" className="edition-bookmark"
              onClick={() => onToggleBookmark(item)} aria-pressed={isBookmarked}
              aria-label={isBookmarked ? `Remove bookmark: ${item.title}` : `Bookmark: ${item.title}`}>
              <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>}
          </div>
        </div>
      </article>
    )
  }
  return (
    <CardShell className="featured-story-card" onClick={() => onSelect(item)}>
      <div className="story-image-canvas">
        <CinematicImage universe={item.categoryName}
          src={curatedArt?.src || item.mediaUrl || item.thumbnailUrl}
          alt={item.title}
          className="story-main-img"
          loading="lazy"
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
            <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
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
          <div className="story-rating-pill">
            <StarIcon size={14} fill="currentColor" />
            <span>{item.popularityScore}% Score</span>
          </div>
        </div>

        <div className="story-read-cta">
          <span>Read Full Chronicle</span>
          <ArrowRightIcon size={16} className="cta-arrow" />
        </div>
      </div>
    </CardShell>
  )
}
