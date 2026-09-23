import React, { useState } from 'react'
import type { Category, MediaFormData, MediaItem } from '../types'

interface AdminMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MediaFormData, id?: number) => Promise<void>
  categories: Category[]
  editItem: MediaItem | null
}

export const AdminMediaModal: React.FC<AdminMediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editItem,
}) => {
  const isEditing = !!editItem

  const [categoryId, setCategoryId] = useState<number>(editItem?.categoryId || (categories[0]?.id ?? 1))
  const [title, setTitle] = useState<string>(editItem?.title || '')
  const [fandomUniverse, setFandomUniverse] = useState<string>(editItem?.fandomUniverse || '')
  const [mediaType, setMediaType] = useState<string>(editItem?.mediaType || 'Video')
  const [mediaUrl, setMediaUrl] = useState<string>(editItem?.mediaUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(editItem?.thumbnailUrl || '')
  const [description, setDescription] = useState<string>(editItem?.description || '')
  const [tags, setTags] = useState<string>(editItem?.tags || '')
  const [durationSeconds, setDurationSeconds] = useState<number>(editItem?.durationSeconds || 180)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (editItem) {
      setCategoryId(editItem.categoryId)
      setTitle(editItem.title)
      setFandomUniverse(editItem.fandomUniverse)
      setMediaType(editItem.mediaType)
      setMediaUrl(editItem.mediaUrl)
      setThumbnailUrl(editItem.thumbnailUrl)
      setDescription(editItem.description)
      setTags(editItem.tags)
      setDurationSeconds(editItem.durationSeconds)
    } else {
      setCategoryId(categories[0]?.id ?? 1)
      setTitle('')
      setFandomUniverse('')
      setMediaType('Video')
      setMediaUrl('')
      setThumbnailUrl('')
      setDescription('')
      setTags('')
      setDurationSeconds(180)
    }
    setError(null)
  }, [editItem, categories])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !mediaUrl.trim()) {
      setError('Title and Media URL are required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const data: MediaFormData = {
        categoryId,
        title: title.trim(),
        fandomUniverse: fandomUniverse.trim(),
        mediaType,
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        description: description.trim(),
        tags: tags.trim(),
        durationSeconds,
      }
      await onSave(data, editItem?.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving media item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{isEditing ? `Edit Media: ${editItem.title}` : 'Add Multimedia Entry'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Media Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official Trailer, Soundtrack Stream"
              />
            </div>
            <div className="form-group flex-1">
              <label>Category *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Fandom Universe *</label>
              <input
                type="text"
                required
                value={fandomUniverse}
                onChange={(e) => setFandomUniverse(e.target.value)}
                placeholder="e.g. Cyberpunk Universe"
              />
            </div>
            <div className="form-group flex-1">
              <label>Media Format *</label>
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="Video">Video / Trailer (YouTube embed or MP4)</option>
                <option value="Audio">Audio / OST (SoundCloud or Audio Stream)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Stream / Embed Media URL *</label>
            <input
              type="url"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://soundcloud.com/..."
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Thumbnail Poster URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="form-group flex-1">
              <label>Duration (Seconds)</label>
              <input
                type="number"
                min="0"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Track details, artist attribution, trailer synopsis..."
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Trailer, Soundtrack, Hans Zimmer"
            />
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Media' : 'Publish Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
