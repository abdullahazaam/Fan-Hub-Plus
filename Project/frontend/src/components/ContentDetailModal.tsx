import React from 'react'
import type { ContentItem } from '../types'

interface ContentDetailModalProps {
  item: ContentItem | null
  onClose: () => void
  onEdit: (item: ContentItem) => void
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ item, onClose, onEdit }) => {
  if (!item) return null

  const tagsList = item.tags
    ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="detail-hero-banner">
          <img
            src={item.mediaUrl || item.thumbnailUrl}
            alt={item.title}
            className="detail-hero-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80'
            }}
          />
          <div className="detail-hero-gradient" />
          <div className="detail-hero-badges">
            <span className="badge-category">{item.categoryName}</span>
            <span className="badge-type">{item.contentType}</span>
            <span className="badge-popularity">★ {item.popularityScore}% Rating</span>
          </div>
        </div>

        <div className="detail-body-wrapper">
          <div className="detail-header">
            <div className="detail-universe">{item.fandomUniverse}</div>
            <h1 className="detail-title">{item.title}</h1>
            <div className="detail-meta-row">
              <span className="meta-author">Curated by <strong>{item.author}</strong></span>
              <span className="meta-dot">•</span>
              <span className="meta-date">
                Released {new Date(item.releaseDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="detail-summary-box">
            <p className="summary-text">{item.description}</p>
          </div>

          <div className="detail-content-text">
            {item.contentText.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="content-subheading">{paragraph.replace('### ', '')}</h3>
              }
              return <p key={idx} className="content-paragraph">{paragraph}</p>
            })}
          </div>

          {tagsList.length > 0 && (
            <div className="detail-tags-section">
              <div className="tags-label">Associated Tags & Lore:</div>
              <div className="tags-cloud">
                {tagsList.map((tag, idx) => (
                  <span key={idx} className="detail-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {item.mediaUrl && (
            <div className="detail-media-reference">
              <span className="media-ref-label">Media Source URL:</span>
              <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="media-ref-link">
                {item.mediaUrl}
              </a>
            </div>
          )}

          <div className="detail-footer-actions">
            <button
              className="btn-edit-modal"
              onClick={() => {
                onClose()
                onEdit(item)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit Content (Admin Flow)</span>
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
