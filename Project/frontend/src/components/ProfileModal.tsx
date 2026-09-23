import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ProfileUpdateForm } from '../types'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')
  const [favoriteCategory, setFavoriteCategory] = useState(profile?.favoriteCategory ?? '')
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
      const form: ProfileUpdateForm = { displayName, bio, avatarUrl, favoriteCategory }
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
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

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

          <label className="auth-field-label">Favorite Fandom Category</label>
          <select
            className="auth-input"
            value={favoriteCategory}
            onChange={(e) => setFavoriteCategory(e.target.value)}
          >
            <option value="">— Select —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="auth-field-label">Bio</label>
          <textarea
            className="auth-input auth-textarea"
            value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the fandom community about yourself..."
            rows={3}
          />

          {error && <div className="auth-error">{error}</div>}
          {saved && <div className="auth-success-text">✓ Profile saved successfully!</div>}

          <button className="btn-auth-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
