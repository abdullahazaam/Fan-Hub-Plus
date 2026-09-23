import React, { useState } from 'react'
import { rateMedia } from '../api'
import { useAuth } from '../context/AuthContext'
import type { MediaItem } from '../types'

interface MediaCardProps {
  item: MediaItem
  onEdit?: (item: MediaItem) => void
  onDelete?: (id: number) => void
  isBookmarked?: boolean
  onToggleBookmark?: (item: MediaItem) => void
  onRatingUpdated?: (id: number, avg: number, count: number, userScore: number) => void
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onEdit,
  onDelete,
  isBookmarked = false,
  onToggleBookmark,
  onRatingUpdated,
}) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [embedError, setEmbedError] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [currentRating, setCurrentRating] = useState<number | null>(item.userRating ?? null)

  const isYouTube = item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be')
  const isSoundCloud = item.mediaUrl.includes('soundcloud.com')

  // Transform standard YouTube watch links into embed links safely
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube-nocookie.com/embed/${vidId}`
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube-nocookie.com/embed/${vidId}`
    }
    return url
  }

  const handleRate = async (star: number) => {
    if (!user || ratingLoading) return
    setRatingLoading(true)
    try {
      const res = await rateMedia(item.id, star)
      setCurrentRating(star)
      if (onRatingUpdated) {
        onRatingUpdated(item.id, res.averageRating, res.ratingsCount, star)
      }
    } catch (err) {
      console.error('Failed to rate media item:', err)
    } finally {
      setRatingLoading(false)
    }
  }

  const tagsList = item.tags
    ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <article className="media-card">
      <div className="media-player-wrapper">
        {!embedError && isYouTube ? (
          <iframe
            className="media-iframe"
            src={getEmbedUrl(item.mediaUrl)}
            title={item.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setEmbedError(true)}
          />
        ) : !embedError && isSoundCloud ? (
          <div className="audio-player-box">
            <div className="audio-visual-wave">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
            <div className="audio-track-info">
              <span className="audio-track-title">{item.title}</span>
              <a
                href={item.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="audio-external-link"
              >
                Stream on SoundCloud ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="embed-fallback-box">
            <img
              src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'}
              alt={item.title}
              className="embed-fallback-img"
            />
            <div className="embed-fallback-overlay">
              <a
                href={item.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-external-media"
              >
                ▶ Open External Stream
              </a>
            </div>
          </div>
        )}

        {user && onToggleBookmark && (
          <button
            className={`btn-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(item)
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Media'}
            aria-label="Toggle media bookmark"
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="media-card-body">
        <div className="card-universe">{item.fandomUniverse}</div>
        <h3 className="media-card-title">{item.title}</h3>
        <p className="media-card-desc">{item.description}</p>

        {tagsList.length > 0 && (
          <div className="card-tags">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}

        {/* Rating Section */}
        <div className="media-rating-row">
          <div className="average-rating-display">
            <span className="star-icon">★</span>
            <span className="rating-value">{item.averageRating.toFixed(1)}</span>
            <span className="rating-count">({item.ratingsCount} {item.ratingsCount === 1 ? 'review' : 'reviews'})</span>
          </div>

          {user ? (
            <div className="user-rating-stars">
              <span className="user-rating-label">Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${(currentRating ?? 0) >= star ? 'active' : ''}`}
                  onClick={() => handleRate(star)}
                  disabled={ratingLoading}
                  title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                  aria-label={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          ) : (
            <span className="sign-in-to-rate-hint">Sign in to rate</span>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && (onEdit || onDelete) && (
          <div className="card-actions media-admin-actions">
            {onEdit && (
              <button className="btn-admin-edit" onClick={() => onEdit(item)} title="Edit media item">
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                className="btn-admin-delete"
                onClick={() => {
                  if (window.confirm(`Delete media item "${item.title}"?`)) {
                    onDelete(item.id)
                  }
                }}
                title="Delete media item"
              >
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
