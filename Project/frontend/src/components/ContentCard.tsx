import React from 'react'
import type { ContentItem } from '../types'

interface ContentCardProps {
  item: ContentItem
  onSelect: (item: ContentItem) => void
  onEdit: (item: ContentItem) => void
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onSelect, onEdit }) => {
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
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="card-thumbnail"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'
          }}
        />
        <div className="media-overlay" />
        <div className="card-floating-badges">
          <span className="badge-category">{item.categoryName || 'Universe'}</span>
          <span className={`badge-type ${getTypeColor(item.contentType)}`}>
            {item.contentType}
          </span>
        </div>
        <div className="popularity-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{item.popularityScore}%</span>
        </div>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <button
            className="btn-admin-edit"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            title="Edit this item (Admin flow)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>
      </div>
    </article>
  )
}
