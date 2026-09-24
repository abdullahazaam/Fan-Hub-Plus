import { CinematicImage } from './CinematicImage'
import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { ContentItem } from '../types'
import { ArrowRightIcon, BookmarkIcon, EditIcon, StarIcon } from './Icons'

interface ContentCardProps {
  item: ContentItem
  onSelect: (item: ContentItem) => void
  onEdit: (item: ContentItem) => void
  isBookmarked?: boolean
  onToggleBookmark?: (item: ContentItem) => void
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onSelect,
  onEdit,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return 'badge-video'
      case 'audio': return 'badge-audio'
      case 'image': return 'badge-image'
      default: return 'badge-article'
    }
  }

  const tagsList = item.tags
    ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <article className="content-card">
      <div className="card-media-wrapper" onClick={() => onSelect(item)}>
        <CinematicImage universe={item.categoryName}
          src={item.thumbnailUrl}
          alt={item.title}
          className="card-thumbnail"
          loading="lazy"
        />
        <div className="media-overlay" />
        <div className="card-floating-badges">
          <span className="badge-category">{item.categoryName || 'Universe'}</span>
          <span className={`badge-type ${getTypeColor(item.contentType)}`}>
            {item.contentType}
          </span>
        </div>
        <div className="popularity-indicator">
          <StarIcon size={12} fill="currentColor" />
          <span>{item.popularityScore}%</span>
        </div>

        {user && onToggleBookmark && (
          <button
            className={`btn-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(item)
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Save to Personal Archive'}
            aria-label="Toggle bookmark"
          >
            <BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="card-universe">{item.fandomUniverse}</div>
        <h3 className="card-title" onClick={() => onSelect(item)}>
          {item.title}
        </h3>
        <p className="card-desc">{item.description}</p>

        {tagsList.length > 0 && (
          <div className="card-tags">
            {tagsList.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}

        <div className="card-footer-meta">
          <span className="author-name">{item.author}</span>
          <span className="release-date">
            {new Date(item.releaseDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="card-actions">
          <button className="btn-view-detail" onClick={() => onSelect(item)}>
            <span>View Details</span>
            <ArrowRightIcon size={14} />
          </button>
          {isAdmin && (
            <button
              className="btn-admin-edit"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(item)
              }}
              title="Edit this item (Admin only)"
              aria-label="Edit content item"
            >
              <EditIcon size={13} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
