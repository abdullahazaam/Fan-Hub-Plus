import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ProfileUpdateForm } from '../types'
import { CloseIcon } from './Icons'

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
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(() => parseFavorites(profile))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !user) return null

  const CATEGORIES = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga', 'Cosplay']

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const form: ProfileUpdateForm = {
        displayName,
        bio,
        avatarUrl,
        favoriteCategory: favoriteCategories.join(', '),
        favoriteCategories,
      }
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="User Profile">
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
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

          <label className="auth-field-label">Avatar URL</label>
          <input
            className="auth-input" type="url"
            value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />

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

          <button className="btn-auth-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
