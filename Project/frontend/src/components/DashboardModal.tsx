import React, { useEffect, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Bookmark, Category, FanSubmission } from '../types'
import { BookmarkIcon, CheckCircleIcon, ClockIcon, CloseIcon, MoonIcon, SparklesIcon, StarIcon, SunIcon, XCircleIcon } from './Icons'
import './DashboardDarkSurface.css'

interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
  bookmarks: Bookmark[]
  onRemoveBookmark: (id: number) => Promise<void>
  onOpenItem: (itemType: string, itemId: number) => void
  categories?: Category[]
  onOpenSubmissionModal?: () => void
  fontSize?: 'small' | 'normal' | 'large'
  onChangeFontSize?: (size: 'small' | 'normal' | 'large') => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onOpenItem,
  categories = [],
  onOpenSubmissionModal,
  fontSize = 'normal',
  onChangeFontSize,
  theme = 'dark',
  onToggleTheme,
}) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions' | 'dossier'>('bookmarks')
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<string>('All')

  // Submissions state
  const [submissions, setSubmissions] = useState<FanSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  // Favorite category update state
  const [selectedFavorite, setSelectedFavorite] = useState<string>(profile?.favoriteCategory || '')
  const [updatingFavorite, setUpdatingFavorite] = useState(false)
  const [favoriteSuccess, setFavoriteSuccess] = useState(false)

  useEffect(() => {
    if (profile?.favoriteCategory) {
      setSelectedFavorite(profile.favoriteCategory)
    }
  }, [profile])

  const loadSubmissions = async () => {
    if (!user) return
    try {
      setLoadingSubmissions(true)
      const data = await api.getUserSubmissions()
      setSubmissions(data)
    } catch {
      // ignore
    } finally {
      setLoadingSubmissions(false)
    }
  }

  useEffect(() => {
    if (isOpen && user && activeTab === 'submissions') {
      loadSubmissions()
    }
  }, [isOpen, user, activeTab])

  if (!isOpen || !user) return null

  const handleUpdateFavorite = async (catName: string) => {
    try {
      setUpdatingFavorite(true)
      setSelectedFavorite(catName)
      await updateProfile({
        displayName: profile?.displayName || user.displayName || user.username,
        bio: profile?.bio || '',
        avatarUrl: profile?.avatarUrl || '',
        favoriteCategory: catName,
      })
      await refreshProfile()
      setFavoriteSuccess(true)
      setTimeout(() => setFavoriteSuccess(false), 2500)
    } catch {
      // ignore
    } finally {
      setUpdatingFavorite(false)
    }
  }

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    if (bookmarkTypeFilter === 'All') return true
    return b.itemType.toLowerCase() === bookmarkTypeFilter.toLowerCase()
  })

  const bookmarkTypes = ['All', 'Article', 'Character', 'Media', 'Merchandise', 'Release', 'Event']

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container glass-modal-card dashboard-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={14} />
        </button>

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-avatar-ring">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="dash-avatar-img" />
            ) : (
              <span className="dash-avatar-letter">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="dash-badge-role">
              <span className="role-dot" />
              <span>{user.role} OPERATIVE</span>
            </div>
            <h2 className="dashboard-title">{user.displayName || user.username}'s Command Terminal</h2>
            <p className="dashboard-subtitle">
              Manage personal bookmarks, track lore submissions, and configure operative display preferences.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="srs-tab-bar dashboard-tabs">
          <button
            className={`srs-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Saved Archive ({bookmarks.length})
          </button>
          <button
            className={`srs-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            My Lore Submissions ({submissions.length})
          </button>
          <button
            className={`srs-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
            onClick={() => setActiveTab('dossier')}
          >
            Operative Profile & Preferences
          </button>
        </div>

        {/* Tab Body */}
        <div className="dashboard-body">
          {/* TAB 1: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div>
              {/* Type filter chips */}
              <div className="bookmark-type-filters">
                {bookmarkTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`bmark-chip ${bookmarkTypeFilter === type ? 'active' : ''}`}
                    onClick={() => setBookmarkTypeFilter(type)}
                  >
                    {type === 'All' ? 'All Archive' : type}
                  </button>
                ))}
              </div>

              {filteredBookmarks.length === 0 ? (
                <div className="empty-catalog-state dashboard-empty glass-panel">
                  <div className="empty-icon"><BookmarkIcon size={36} /></div>
                  <h3>No Bookmarks in this Category</h3>
                  <p>Explore articles, characters, media, merchandise, and releases and click the star to save them.</p>
                </div>
              ) : (
                <div className="bookmarks-grid">
                  {filteredBookmarks.map((b) => (
                    <div key={b.id} className="bookmark-item-card glass-panel">
                      <div
                        className="bookmark-thumb-wrap"
                        onClick={() => {
                          onClose()
                          onOpenItem(b.itemType, b.itemId)
                        }}
                      >
                        <img
                          src={b.itemImageUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80'}
                          alt={b.itemTitle}
                          className="bookmark-thumb-img"
                        />
                        <span className="bookmark-type-tag">{b.itemType}</span>
                      </div>
                      <div className="bookmark-info">
                        <div className="bookmark-sub">{b.itemSubtitle}</div>
                        <h4
                          className="bookmark-title"
                          onClick={() => {
                            onClose()
                            onOpenItem(b.itemType, b.itemId)
                          }}
                        >
                          {b.itemTitle}
                        </h4>
                        <div className="bookmark-footer">
                          <span className="bookmark-date">
                            Saved {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            className="btn-remove-bookmark"
                            onClick={() => onRemoveBookmark(b.id)}
                            title="Remove Bookmark"
                            aria-label="Remove bookmark"
                          >
                            <CloseIcon size={11} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY FAN SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="dash-submissions-pane">
              <div className="dash-submissions-header">
                <div>
                  <h3 className="pane-title">Dispatched Lore Submissions</h3>
                  <p className="pane-subtext">Review the editorial review status of your community submissions.</p>
                </div>
                {onOpenSubmissionModal && (
                  <button
                    type="button"
                    className="srs-btn-primary"
                    onClick={() => {
                      onClose()
                      onOpenSubmissionModal()
                    }}
                  >
                    + Submit New Lore
                  </button>
                )}
              </div>

              {loadingSubmissions ? (
                <div className="srs-history-loading">Retrieving transmission telemetry...</div>
              ) : submissions.length === 0 ? (
                <div className="empty-catalog-state dashboard-empty glass-panel">
                  <div className="empty-icon"><SparklesIcon size={36} /></div>
                  <h3>No Lore Submissions Yet</h3>
                  <p>Share your multiverse analysis, cosplay logs, or theories with the Fan Hub Plus community.</p>
                  {onOpenSubmissionModal && (
                    <button
                      type="button"
                      className="srs-btn-action"
                      onClick={() => {
                        onClose()
                        onOpenSubmissionModal()
                      }}
                    >
                      Draft a Fan Submission
                    </button>
                  )}
                </div>
              ) : (
                <div className="srs-history-list">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="srs-history-card glass-panel">
                      <div className="history-card-top">
                        <div className="history-card-title-group">
                          <span className={`srs-status-tag status-${sub.status.toLowerCase()}`}>
                            {sub.status === 'Pending' && (
                              <>
                                <ClockIcon size={12} />
                                <span>In Review</span>
                              </>
                            )}
                            {sub.status === 'Approved' && (
                              <>
                                <CheckCircleIcon size={12} />
                                <span>Approved for Archive</span>
                              </>
                            )}
                            {sub.status === 'Rejected' && (
                              <>
                                <XCircleIcon size={12} />
                                <span>Needs Revision</span>
                              </>
                            )}
                          </span>
                          <span className="history-card-type">{sub.submissionType} • {sub.categoryName}</span>
                        </div>
                        <span className="history-card-date">
                          Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="history-card-heading">{sub.title}</h4>
                      <p className="history-card-universe">Universe: <strong>{sub.fandomUniverse}</strong></p>
                      <p className="history-card-snippet">{sub.contentText.slice(0, 180)}...</p>

                      {sub.adminNotes && (
                        <div className="history-card-notes">
                          <span className="notes-label">Archivist Review Note:</span>
                          <p>{sub.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPERATIVE DOSSIER & PREFERENCES */}
          {activeTab === 'dossier' && (
            <div className="dash-dossier-pane">
              {/* Activity Summary Stats */}
              <div className="dash-stats-grid">
                <div className="dash-stat-card glass-panel">
                  <span className="stat-label">Personal Bookmarks</span>
                  <span className="stat-val">{bookmarks.length}</span>
                  <span className="stat-foot">Archived across 8 realms</span>
                </div>
                <div className="dash-stat-card glass-panel">
                  <span className="stat-label">Lore Submissions</span>
                  <span className="stat-val">{submissions.length}</span>
                  <span className="stat-foot">Community contributions</span>
                </div>
                <div className="dash-stat-card glass-panel">
                  <span className="stat-label">Operative Role</span>
                  <span className="stat-val highlight">{user.role}</span>
                  <span className="stat-foot">Platform clearance</span>
                </div>
                <div className="dash-stat-card glass-panel">
                  <span className="stat-label">Active Since</span>
                  <span className="stat-val small">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                      : 'Jan 2026'}
                  </span>
                  <span className="stat-foot">Synchronized Operative</span>
                </div>
              </div>

              {/* Favourite Fandoms Configuration */}
              <div className="dash-section-card glass-panel">
                <div className="section-head">
                  <h4>Designated Favorite Fandom Realm</h4>
                  <p>Choose your primary allegiance to personalize your multiverse feed.</p>
                </div>

                {favoriteSuccess && (
                  <div className="srs-alert-banner success">
                    <span>Favorite fandom realm updated successfully!</span>
                  </div>
                )}

                <div className="fandom-fav-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={updatingFavorite}
                      className={`fandom-fav-btn ${selectedFavorite.toLowerCase() === cat.name.toLowerCase() ? 'selected' : ''}`}
                      onClick={() => handleUpdateFavorite(cat.name)}
                    >
                      <span className="fandom-name">{cat.name}</span>
                      {selectedFavorite.toLowerCase() === cat.name.toLowerCase() && (
                        <span className="fav-check">
                          <StarIcon size={12} fill="currentColor" />
                          <span>Primary</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display & Accessibility Preferences */}
              <div className="dash-section-card glass-panel">
                <div className="section-head">
                  <h4>Display & Accessibility Preferences</h4>
                  <p>Adjust visual parameters for optimal archival reading clarity.</p>
                </div>

                <div className="preferences-row">
                  {/* Font Size Selector */}
                  <div className="pref-item">
                    <span className="pref-label">Font Scale Accessibility:</span>
                    <div className="font-scale-group">
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize && onChangeFontSize('small')}
                        title="Compact Font (90%)"
                      >
                        A- (90%)
                      </button>
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize && onChangeFontSize('normal')}
                        title="Default Font (100%)"
                      >
                        A (100%)
                      </button>
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize && onChangeFontSize('large')}
                        title="Enhanced Font (115%)"
                      >
                        A+ (115%)
                      </button>
                    </div>
                  </div>

                  {/* Theme Mode Selector */}
                  <div className="pref-item">
                    <span className="pref-label">Interface Atmospheric Theme:</span>
                    <button
                      type="button"
                      className="dash-theme-btn"
                      onClick={onToggleTheme}
                    >
                      {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
                      <span>Current: {theme === 'dark' ? 'Smoked Obsidian Glass (Dark)' : 'Frosted Warm-Ivory Glass (Light)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="detail-footer-actions">
          <button className="btn-close-modal" onClick={onClose}>
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  )
}
