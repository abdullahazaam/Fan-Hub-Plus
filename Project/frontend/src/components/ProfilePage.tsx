import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Category, NavView, ProfileUpdateForm } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import { CheckIcon, ShieldIcon, StarIcon, UserIcon } from './Icons'

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
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(() => parseFavorites(profile))

  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      setSavedMessage(null)

      const form: ProfileUpdateForm = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        favoriteCategory: favoriteCategories.join(', ') || undefined,
        favoriteCategories: favoriteCategories,
      }

      await updateProfile(form)
      await refreshProfile()
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
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || user.username} className="avatar-img-cover" />
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
                  <label className="srs-label">Avatar Image URL</label>
                  <input
                    type="url"
                    className="srs-input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.webp"
                  />
                  <span className="srs-hint">Direct link to a square PNG, WebP, or JPG image.</span>
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
                    disabled={saving}
                  >
                    {saving ? 'Synchronizing…' : 'Save Changes'}
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
