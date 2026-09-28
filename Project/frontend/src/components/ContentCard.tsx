import { CinematicImage } from './CinematicImage'
import React, { useEffect, useRef, useState } from 'react'
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

const ContentCardComponent: React.FC<ContentCardProps> = ({
  item,
  onSelect,
  onEdit,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [flipped, setFlipped] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frontRef = useRef<HTMLButtonElement>(null)
  const detailsRef = useRef<HTMLButtonElement>(null)
  const focusBack = useRef(false)
  const cancelHover = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); hoverTimer.current = null }
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current) }, [])
  useEffect(() => { if (flipped && focusBack.current) { focusBack.current = false; detailsRef.current?.focus() } }, [flipped])
  const showFront = () => { cancelHover(); setFlipped(false); frontRef.current?.focus() }


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
    <article className={`content-card chronicle-flip ${flipped ? 'is-flipped' : ''}`}
      onPointerEnter={e => {
        if (e.pointerType !== 'mouse' || !matchMedia('(hover: hover)').matches) return
        cancelHover(); hoverTimer.current = setTimeout(() => setFlipped(true), 240)
      }}
      onPointerLeave={e => {
        cancelHover()
        if (e.pointerType === 'mouse' && !e.currentTarget.contains(document.activeElement)) setFlipped(false)
      }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { cancelHover(); setFlipped(false) } }}
      onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); showFront() } }}>
      <div className="chronicle-flip-inner">
        <button ref={frontRef} type="button" className="chronicle-front" aria-label={`Show details for ${item.title}`}
          aria-expanded={flipped} aria-hidden={flipped} tabIndex={flipped ? -1 : 0}
          onClick={() => { cancelHover(); focusBack.current = true; setFlipped(true) }}>
          <CinematicImage universe={item.categoryName} src={item.thumbnailUrl} alt="" className="chronicle-art" loading="lazy" />
          <span className="chronicle-front-shade" />
          <span className="chronicle-category">{item.categoryName || 'Universe'}</span>
          <span className="chronicle-front-title">{item.title}</span>
        </button>
        <div className="chronicle-back" aria-hidden={!flipped}>
          <div className="chronicle-back-heading">
            <span className={`badge-type ${getTypeColor(item.contentType)}`}>{item.contentType}</span>
            <button type="button" className="chronicle-return" tabIndex={flipped ? 0 : -1} onClick={showFront} aria-label={`Show artwork for ${item.title}`}>Artwork</button>
          </div>
          {item.fandomUniverse && <div className="card-universe">{item.fandomUniverse}</div>}
          <h3 className="card-title">{item.title}</h3>
          <p className="card-desc">{item.description}</p>
          {tagsList.length > 0 && <div className="card-tags">{tagsList.slice(0, 3).map((tag, idx) => <span key={idx} className="tag-pill">#{tag}</span>)}</div>}
          <div className="chronicle-rating"><StarIcon size={13} fill="currentColor" /><span>{item.popularityScore}%</span></div>
          <div className="card-footer-meta">
            <span className="author-name">{item.author}</span>
            <span className="release-date">{new Date(item.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="chronicle-back-actions">
            <button ref={detailsRef} type="button" className="btn-view-detail" tabIndex={flipped ? 0 : -1} onClick={() => onSelect(item)}><span>VIEW DETAILS</span><ArrowRightIcon size={14} /></button>
            {user && onToggleBookmark && <button type="button" className={`chronicle-save ${isBookmarked ? 'bookmarked' : ''}`} tabIndex={flipped ? 0 : -1}
              onClick={() => onToggleBookmark(item)} title={isBookmarked ? 'Remove Bookmark' : 'Save to Personal Archive'} aria-label={isBookmarked ? 'Remove Bookmark' : 'Save to Personal Archive'} aria-pressed={isBookmarked}>
              <BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>}
            {isAdmin && <button type="button" className="btn-admin-edit" tabIndex={flipped ? 0 : -1} onClick={() => onEdit(item)} title="Edit this item (Admin only)" aria-label="Edit content item"><EditIcon size={13} /><span>Edit</span></button>}
          </div>
        </div>
      </div>
    </article>
  )
}

export const ContentCard = React.memo(ContentCardComponent)
