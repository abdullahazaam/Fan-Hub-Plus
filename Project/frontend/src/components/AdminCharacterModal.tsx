import React, { useState } from 'react'
import type { Category, Character, CharacterFormData } from '../types'
import { CloseIcon } from './Icons'

interface AdminCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CharacterFormData, id?: number) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  categories: Category[]
  editCharacter: Character | null
}

export const AdminCharacterModal: React.FC<AdminCharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  editCharacter,
}) => {
  const isEditing = !!editCharacter

  const [categoryId, setCategoryId] = useState<number>(editCharacter?.categoryId || (categories[0]?.id ?? 1))
  const [name, setName] = useState<string>(editCharacter?.name || '')
  const [fandomUniverse, setFandomUniverse] = useState<string>(editCharacter?.fandomUniverse || '')
  const [roleTitle, setRoleTitle] = useState<string>(editCharacter?.roleTitle || '')
  const [bio, setBio] = useState<string>(editCharacter?.bio || '')
  const [abilities, setAbilities] = useState<string>(editCharacter?.abilities || '')
  const [backstory, setBackstory] = useState<string>(editCharacter?.backstory || '')
  const [avatarUrl, setAvatarUrl] = useState<string>(editCharacter?.avatarUrl || '')
  const [bannerUrl, setBannerUrl] = useState<string>(editCharacter?.bannerUrl || '')
  const [originUniverse, setOriginUniverse] = useState<string>(editCharacter?.originUniverse || '')
  const [voiceActor, setVoiceActor] = useState<string>(editCharacter?.voiceActor || '')
  const [popularityScore, setPopularityScore] = useState<number>(editCharacter?.popularityScore || 90)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync state if edit item changes
  React.useEffect(() => {
    if (editCharacter) {
      setCategoryId(editCharacter.categoryId)
      setName(editCharacter.name)
      setFandomUniverse(editCharacter.fandomUniverse)
      setRoleTitle(editCharacter.roleTitle)
      setBio(editCharacter.bio)
      setAbilities(editCharacter.abilities)
      setBackstory(editCharacter.backstory)
      setAvatarUrl(editCharacter.avatarUrl)
      setBannerUrl(editCharacter.bannerUrl)
      setOriginUniverse(editCharacter.originUniverse)
      setVoiceActor(editCharacter.voiceActor)
      setPopularityScore(editCharacter.popularityScore)
    } else {
      setCategoryId(categories[0]?.id ?? 1)
      setName('')
      setFandomUniverse('')
      setRoleTitle('')
      setBio('')
      setAbilities('')
      setBackstory('')
      setAvatarUrl('')
      setBannerUrl('')
      setOriginUniverse('')
      setVoiceActor('')
      setPopularityScore(90)
    }
    setError(null)
  }, [editCharacter, categories])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Character name is required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const data: CharacterFormData = {
        categoryId,
        name: name.trim(),
        fandomUniverse: fandomUniverse.trim(),
        roleTitle: roleTitle.trim(),
        bio: bio.trim(),
        abilities: abilities.trim(),
        backstory: backstory.trim(),
        avatarUrl: avatarUrl.trim(),
        bannerUrl: bannerUrl.trim(),
        originUniverse: originUniverse.trim(),
        voiceActor: voiceActor.trim(),
        popularityScore,
      }
      await onSave(data, editCharacter?.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving character.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editCharacter || !onDelete) return
    if (window.confirm(`Are you sure you want to delete "${editCharacter.name}"?`)) {
      try {
        setSubmitting(true)
        await onDelete(editCharacter.id)
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error deleting character.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{isEditing ? `Edit Character: ${editCharacter.name}` : 'Create Character Profile'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={14} />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Character Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Johnny Silverhand, Satoru Gojo"
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
                placeholder="e.g. Cyberpunk Universe, Jujutsu Kaisen"
              />
            </div>
            <div className="form-group flex-1">
              <label>Role / Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Rockerboy, Special Grade Sorcerer"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Biography Summary *</label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Core personality and identity..."
            />
          </div>

          <div className="form-group">
            <label>Powers, Abilities & Equipment</label>
            <textarea
              rows={2}
              value={abilities}
              onChange={(e) => setAbilities(e.target.value)}
              placeholder="Techniques, magical barriers, cyberware..."
            />
          </div>

          <div className="form-group">
            <label>Chronicle Backstory</label>
            <textarea
              rows={4}
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Origins and lore progression..."
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Avatar Portrait URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="form-group flex-1">
              <label>Banner URL</label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Origin World / Faction</label>
              <input
                type="text"
                value={originUniverse}
                onChange={(e) => setOriginUniverse(e.target.value)}
                placeholder="e.g. Night City, Tokyo Tech"
              />
            </div>
            <div className="form-group flex-1">
              <label>Voice Actor / Portrayal</label>
              <input
                type="text"
                value={voiceActor}
                onChange={(e) => setVoiceActor(e.target.value)}
                placeholder="e.g. Keanu Reeves"
              />
            </div>
            <div className="form-group flex-1">
              <label>Popularity Score (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={popularityScore}
                onChange={(e) => setPopularityScore(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={submitting}
              >
                Delete Character
              </button>
            )}
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={submitting}>
                {submitting ? 'Committing...' : isEditing ? 'Update Character' : 'Publish Character'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
