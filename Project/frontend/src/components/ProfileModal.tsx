import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ProfileUpdateForm } from '../types'
import { CloseIcon } from './Icons'
import { apiUploadAvatar } from '../api'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, updateProfile } = useAuth()

  const parseFavorites = (prof: typeof profile): string[] => {
    if (prof?.favoriteCategories && prof.favoriteCategories.length > 0) {
      return prof.favoriteCategories
    }
    if (prof?.favoriteCategory) {
      return prof.favoriteCategory.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(() => parseFavorites(profile))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !user) return null

  const CATEGORIES = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga', 'Cosplay']

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please choose a valid JPG, PNG, or WebP image.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be 2MB or less.')
      return
    }

    setError('')
    setSelectedFile(file)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAvatarUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let finalAvatarUrl = avatarUrl

      if (selectedFile) {
        setUploading(true)
        try {
          const res = await apiUploadAvatar(selectedFile)
          finalAvatarUrl = res.avatarUrl
          setAvatarUrl(res.avatarUrl)
        } finally {
          setUploading(false)
        }
      }

      const form: ProfileUpdateForm = {
        displayName,
        bio,
        avatarUrl: finalAvatarUrl,
        favoriteCategory: favoriteCategories.join(', '),
        favoriteCategories,
      }
      await updateProfile(form)
      setSelectedFile(null)
      setPreviewUrl(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const activeAvatar = previewUrl || avatarUrl

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="User Profile">
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar-ring">
            {activeAvatar ? (
              <img src={activeAvatar} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-initials">
                {(displayName || user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="profile-identity">
            <div className="profile-display-name">{user.displayName || user.username}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
        </div>

        <div className="profile-meta-row">
          <span className="profile-meta-label">Member since:</span>
          <span className="profile-meta-value">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <label className="auth-field-label">Display Name</label>
          <input
            className="auth-input" type="text"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your public display name"
          />

          <label className="auth-field-label">Profile Photo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn-auth-submit"
              style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {activeAvatar ? 'Change Photo' : 'Choose Photo'}
            </button>
            {activeAvatar && (
              <button
                type="button"
                className="fandom-selector-chip"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
                onClick={handleRemovePhoto}
              >
                Remove Photo
              </button>
            )}
          </div>

          <label className="auth-field-label">
            Favorite Fandom Categories {favoriteCategories.length > 0 ? `(${favoriteCategories.length} selected)` : ''}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 14px' }}>
            {CATEGORIES.map((c) => {
              const isSelected = favoriteCategories.some((cat) => cat.toLowerCase() === c.toLowerCase())
              return (
                <button
                  key={c}
                  type="button"
                  className={`fandom-selector-chip ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '16px',
                    border: isSelected ? '1px solid rgba(220, 38, 38, 0.8)' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#ff6b6b' : 'inherit',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                  }}
                  onClick={() => {
                    setFavoriteCategories((prev) =>
                      prev.some((cat) => cat.toLowerCase() === c.toLowerCase())
                        ? prev.filter((cat) => cat.toLowerCase() !== c.toLowerCase())
                        : [...prev, c]
                    )
                  }}
                >
                  {isSelected ? '★ ' : ''}{c}
                </button>
              )
            })}
          </div>

          <label className="auth-field-label">Bio</label>
          <textarea
            className="auth-input auth-textarea"
            value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the fandom community about yourself..."
            rows={3}
          />

          {error && <div className="auth-error">{error}</div>}
          {saved && <div className="auth-success-text">Profile saved successfully!</div>}

          <button className="btn-auth-submit" type="submit" disabled={saving || uploading}>
            {uploading ? 'Uploading Photo…' : saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
