import React, { useEffect, useState } from 'react'
import type { Category, ContentFormData, ContentItem } from '../types'

interface AdminContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ContentFormData, id?: number) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  categories: Category[]
  editItem?: ContentItem | null
}

export const AdminContentModal: React.FC<AdminContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  editItem,
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    categoryId: categories[0]?.id || 1,
    title: '',
    fandomUniverse: '',
    contentType: 'Article',
    description: '',
    contentText: '',
    thumbnailUrl: '',
    mediaUrl: '',
    author: 'Admin Curator',
    tags: '',
    popularityScore: 90,
    releaseDate: new Date().toISOString().split('T')[0],
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editItem) {
      setFormData({
        categoryId: editItem.categoryId,
        title: editItem.title,
        fandomUniverse: editItem.fandomUniverse,
        contentType: editItem.contentType,
        description: editItem.description,
        contentText: editItem.contentText,
        thumbnailUrl: editItem.thumbnailUrl,
        mediaUrl: editItem.mediaUrl,
        author: editItem.author,
        tags: editItem.tags,
        popularityScore: editItem.popularityScore,
        releaseDate: editItem.releaseDate ? editItem.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
      })
    } else {
      setFormData({
        categoryId: categories[0]?.id || 1,
        title: '',
        fandomUniverse: '',
        contentType: 'Article',
        description: '',
        contentText: '',
        thumbnailUrl: '',
        mediaUrl: '',
        author: 'Admin Curator',
        tags: '',
        popularityScore: 90,
        releaseDate: new Date().toISOString().split('T')[0],
      })
    }
    setError(null)
  }, [editItem, categories, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Title is mandatory.')
      return
    }
    if (!formData.fandomUniverse.trim()) {
      setError('Fandom Universe is required.')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSave(formData, editItem ? editItem.id : undefined)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save content item')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editItem || !onDelete) return
    if (window.confirm(`Are you sure you want to delete "${editItem.title}"?`)) {
      try {
        setSaving(true)
        await onDelete(editItem.id)
        onClose()
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div className="modal-badge">{editItem ? 'Admin Edit Mode' : 'Admin Content Creation'}</div>
          <h2 className="modal-title">{editItem ? `Edit: ${editItem.title}` : 'Add New Fandom Content'}</h2>
          <p className="modal-subtitle">Direct persistence to SQL Server via EF Core</p>
        </div>

        {error && (
          <div className="admin-error-banner">
            <span>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="content-title">Title *</label>
              <input
                id="content-title"
                type="text"
                required
                placeholder="e.g. Neon Horizon: Ghost in the Shell Aesthetics"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content-universe">Fandom Universe *</label>
              <input
                id="content-universe"
                type="text"
                required
                placeholder="e.g. Cyberpunk Universe / Marvel / Anime"
                value={formData.fandomUniverse}
                onChange={(e) => setFormData({ ...formData, fandomUniverse: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="content-cat">Category *</label>
              <select
                id="content-cat"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content-type">Content Type *</label>
              <select
                id="content-type"
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              >
                <option value="Article">Article</option>
                <option value="Video">Video / Trailer</option>
                <option value="Audio">Audio / OST</option>
                <option value="Image">Image / Cosplay</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content-pop">Popularity (1-100)</label>
              <input
                id="content-pop"
                type="number"
                min="1"
                max="100"
                value={formData.popularityScore}
                onChange={(e) => setFormData({ ...formData, popularityScore: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content-desc">Short Summary / Description *</label>
            <textarea
              id="content-desc"
              rows={2}
              required
              placeholder="Concise overview displayed on card listings..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content-text">Full Content / Article Story *</label>
            <textarea
              id="content-text"
              rows={5}
              required
              placeholder="In-depth fandom narrative, review, or analysis (markdown-friendly with ### headers)..."
              value={formData.contentText}
              onChange={(e) => setFormData({ ...formData, contentText: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="content-thumb">Thumbnail URL (Card cover)</label>
              <input
                id="content-thumb"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content-media">Media URL (Embed / High-Res)</label>
              <input
                id="content-media"
                type="text"
                placeholder="https://... (video embed or image URL)"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="content-author">Author / Curator</label>
              <input
                id="content-author"
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content-tags">Tags (comma-separated)</label>
              <input
                id="content-tags"
                type="text"
                placeholder="Lore, Sci-Fi, Season 2"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content-date">Release Date</label>
              <input
                id="content-date"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            {editItem && onDelete && (
              <button
                type="button"
                className="btn-danger-action"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete Item
              </button>
            )}
            <div className="action-right-group">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={saving}
              >
                {saving ? 'Persisting to SQL Server...' : editItem ? 'Update Content' : 'Save to SQL Server'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
