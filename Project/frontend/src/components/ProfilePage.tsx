import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Category, NavView, ProfileUpdateForm } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import { CheckIcon, ShieldIcon, StarIcon, UserIcon } from './Icons'
import { apiUploadAvatar } from '../api'

interface ProfilePageProps {
  categories: Category[]
  onNavigate: (view: NavView) => void
  onOpenAuth: () => void
  bookmarkCount: number
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  categories,
  onNavigate,
  onOpenAuth,
  bookmarkCount,
}) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth()

  const parseFavorites = (prof: typeof profile): string[] => {
    if (prof?.favoriteCategories && prof.favoriteCategories.length > 0) {
      return prof.favoriteCategories
    }
    if (prof?.favoriteCategory) {
      return prof.favoriteCategory.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.displayName ?? user?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? user?.avatarUrl ?? '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(() => parseFavorites(profile))

  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || user?.username || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatarUrl || user?.avatarUrl || '')
      setFavoriteCategories(parseFavorites(profile))
    }
  }, [profile, user])

  const toggleFavoriteCategory = (catName: string) => {
    setFavoriteCategories((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === catName.toLowerCase())
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== catName.toLowerCase())
      } else {
        return [...prev, catName]
      }
    })
  }

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

    setError(null)
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      setSavedMessage(null)

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
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: finalAvatarUrl,
        favoriteCategory: favoriteCategories.join(', ') || undefined,
        favoriteCategories: favoriteCategories,
      }

      await updateProfile(form)
      await refreshProfile()
      setSelectedFile(null)
      setPreviewUrl(null)
      setSavedMessage('Operative profile updated and synchronized across the multiverse network.')
      setTimeout(() => setSavedMessage(null), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update operative profile.')
    } finally {
      setSaving(false)
    }
  }

  const categoryNames = categories.length > 0
    ? categories.map((c) => c.name)
    : ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga', 'Cosplay']

  const activeAvatar = previewUrl || avatarUrl

  return (
    <div className="srs-page-container profile-page-view" aria-label="Operative Profile">
      <div className="srs-page-inner">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Nexus Gate', onClick: () => onNavigate('home') },
            { label: 'Operative Profile', active: true },
          ]}
        />

        {/* Hero Section Header */}
        <div className="srs-header-banner">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>NEXUS GATE ARCHIVAL DOSSIER</span>
          </div>
          <h1 className="srs-main-heading">Operative Credentials & Identity</h1>
          <p className="srs-main-subtext">
            Manage your agent callsign, custom avatar, preferred multiverse sector, and operative clearance settings.
          </p>
        </div>

        {!user ? (
          <div className="srs-empty-box glass-panel">
            <div className="srs-empty-icon">
              <UserIcon size={44} />
            </div>
            <h3>Authentication Required</h3>
            <p>Accessing the operative dossier requires an authenticated session clearance key.</p>
            <button type="button" className="srs-btn-action" onClick={onOpenAuth}>
              Sign In with Nexus Account
            </button>
          </div>
        ) : (
          <div className="profile-page-grid">
            {/* Column 1: Identity & Credentials Summary Card */}
            <div className="profile-identity-card glass-panel">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-large">
                  {activeAvatar ? (
                    <img src={activeAvatar} alt={displayName || user.username} className="avatar-img-cover" />
                  ) : (
                    <span className="avatar-letter-large">
                      {(displayName || user.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="profile-identity-badges">
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    <ShieldIcon size={12} />
                    <span>{user.role} OPERATIVE</span>
                  </span>
                  <span className="status-ping-badge">
                    <span className="status-ping-dot" />
                    <span>SYNCHRONIZED</span>
                  </span>
                </div>
              </div>

              <div className="profile-summary-body">
                <h2 className="profile-callsign">{displayName || user.displayName || user.username}</h2>
                <span className="profile-username">@{user.username}</span>
                <span className="profile-email-badge">{user.email}</span>

                {bio && <p className="profile-bio-text">{bio}</p>}

                <div className="profile-stats-strip">
                  <div className="profile-stat-box">
                    <span className="stat-number">{bookmarkCount}</span>
                    <span className="stat-label">Saved Relics</span>
                  </div>
                  <div className="profile-stat-box">
                    <span className="stat-number">
                      {favoriteCategories.length > 0
                        ? favoriteCategories.length === 1
                          ? favoriteCategories[0]
                          : `${favoriteCategories.length} Realms`
                        : 'Nexus'}
                    </span>
                    <span className="stat-label">
                      {favoriteCategories.length > 1 ? 'Favorite Realms' : 'Primary Realm'}
                    </span>
                  </div>
                  <div className="profile-stat-box">
                    <span className="stat-number">
                      {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2026'}
                    </span>
                    <span className="stat-label">Inducted</span>
                  </div>
                </div>

                <div className="profile-quick-actions">
                  <button
                    type="button"
                    className="srs-btn-secondary w-full"
                    onClick={() => onNavigate('dashboard')}
                  >
                    <StarIcon size={14} fill="currentColor" />
                    <span>Open Personal Archive</span>
                  </button>
                  <button
                    type="button"
                    className="srs-btn-action w-full"
                    onClick={() => onNavigate('submissions')}
                  >
                    <span>Submit Community Lore</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Edit Form & Preferences Card */}
            <div className="profile-form-card glass-panel">
              <div className="profile-card-head">
                <div className="head-title-wrap">
                  <h3 className="card-section-title">Edit Operative Profile</h3>
                  <p className="card-section-sub">
                    Update public information visible to the multiverse community and archive moderators.
                  </p>
                </div>
              </div>

              {savedMessage && (
                <div className="srs-alert-banner success">
                  <CheckIcon size={16} />
                  <span>{savedMessage}</span>
                </div>
              )}

              {error && (
                <div className="srs-alert-banner error">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="srs-form-grid profile-edit-form">
                <div className="form-group-full">
                  <label className="srs-label">Callsign / Display Name</label>
                  <input
                    type="text"
                    className="srs-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your operative callsign"
                  />
                  <span className="srs-hint">Displayed on public articles, comments, and archives.</span>
                </div>

                <div className="form-group-full">
                  <label className="srs-label">Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.4rem 0 0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      className="srs-btn-action"
                      style={{ width: 'auto', padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {activeAvatar ? 'Change Photo' : 'Choose Photo'}
                    </button>
                    {activeAvatar && (
                      <button
                        type="button"
                        className="fandom-selector-chip"
                        style={{
                          padding: '0.48rem 1rem',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          border: '1px solid rgba(220, 38, 38, 0.45)',
                          background: 'rgba(220, 38, 38, 0.12)',
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                        onClick={handleRemovePhoto}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <span className="srs-hint">Select a JPG, PNG, or WebP photo (up to 2MB). Instant preview shown above.</span>
                </div>

                <div className="form-group-full">
                  <label className="srs-label">
                    Favorite Fandom Realms {favoriteCategories.length > 0 ? `(${favoriteCategories.length} selected)` : ''}
                  </label>
                  <div className="fandom-pill-selector">
                    {categoryNames.map((catName) => {
                      const isSelected = favoriteCategories.some((c) => c.toLowerCase() === catName.toLowerCase())
                      return (
                        <button
                          key={catName}
                          type="button"
                          className={`fandom-selector-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleFavoriteCategory(catName)}
                        >
                          {isSelected && <StarIcon size={12} fill="currentColor" />}
                          <span>{catName}</span>
                        </button>
                      )
                    })}
                  </div>
                  <span className="srs-hint">Select one or multiple favorite realms to personalize your multiverse feed.</span>
                </div>

                <div className="form-group-full">
                  <label className="srs-label">Operative Biography</label>
                  <textarea
                    rows={4}
                    className="srs-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your fandom origins, favorite lore theories, or creative projects..."
                  />
                </div>

                <div className="form-group-full form-actions-row">
                  <button
                    type="submit"
                    className="srs-btn-action"
                    disabled={saving || uploading}
                  >
                    {uploading ? 'Uploading Photo…' : saving ? 'Synchronizing…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
