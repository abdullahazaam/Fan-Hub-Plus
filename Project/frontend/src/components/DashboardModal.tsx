import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { Bookmark } from '../types'

interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
  bookmarks: Bookmark[]
  onRemoveBookmark: (id: number) => Promise<void>
  onOpenItem: (itemType: string, itemId: number) => void
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onOpenItem,
}) => {
  const { user } = useAuth()

  if (!isOpen || !user) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container dashboard-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="dashboard-header">
          <div className="dashboard-avatar-ring">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="dash-avatar-img" />
            ) : (
              <span className="dash-avatar-letter">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="dashboard-title">{user.displayName || user.username}'s Personal Archive</h2>
            <p className="dashboard-subtitle">
              Bookmarked chronicles, character dossiers, and media streams ({bookmarks.length} saved)
            </p>
          </div>
        </div>

        <div className="dashboard-body">
          {bookmarks.length === 0 ? (
            <div className="empty-catalog-state dashboard-empty">
              <div className="empty-icon">🔖</div>
              <h3>No Bookmarks Saved Yet</h3>
              <p>Explore articles, characters, and trailers and click the star icon to save them to your personal dossier.</p>
            </div>
          ) : (
            <div className="bookmarks-grid">
              {bookmarks.map((b) => (
                <div key={b.id} className="bookmark-item-card">
                  <div
                    className="bookmark-thumb-wrap"
                    onClick={() => {
                      onClose()
                      onOpenItem(b.itemType, b.itemId)
                    }}
                  >
                    <img
                      src={b.itemImageUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80'}
                      alt={b.itemTitle}
                      className="bookmark-thumb-img"
                    />
                    <span className="bookmark-type-tag">{b.itemType}</span>
                  </div>
                  <div className="bookmark-info">
                    <div className="bookmark-sub">{b.itemSubtitle}</div>
                    <h4
                      className="bookmark-title"
                      onClick={() => {
                        onClose()
                        onOpenItem(b.itemType, b.itemId)
                      }}
                    >
                      {b.itemTitle}
                    </h4>
                    <div className="bookmark-footer">
                      <span className="bookmark-date">
                        Saved {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        className="btn-remove-bookmark"
                        onClick={() => onRemoveBookmark(b.id)}
                        title="Remove Bookmark"
                        aria-label="Remove bookmark"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-footer-actions">
          <button className="btn-close-modal" onClick={onClose}>
            Back to Portal
          </button>
        </div>
      </div>
    </div>
  )
}
