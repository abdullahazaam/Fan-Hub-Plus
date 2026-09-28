import React, { useEffect, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Bookmark, Category, FanSubmission, NavView } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import './DashboardDarkSurface.css'
import {
  BookmarkIcon,
  CheckCircleIcon,
  ClockIcon,
  MoonIcon,
  PenToolIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
  XCircleIcon,
} from './Icons'

interface DashboardPageProps {
  categories: Category[]
  bookmarks: Bookmark[]
  onRemoveBookmark: (id: number) => Promise<void>
  onOpenItem: (itemType: string, itemId: number) => void
  onNavigate: (view: NavView) => void
  onOpenAuth: () => void
  fontSize?: 'small' | 'normal' | 'large'
  onChangeFontSize?: (size: 'small' | 'normal' | 'large') => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  categories = [],
  bookmarks,
  onRemoveBookmark,
  onOpenItem,
  onNavigate,
  onOpenAuth,
  fontSize = 'normal',
  onChangeFontSize,
  theme = 'dark',
  onToggleTheme,
}) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions' | 'preferences'>('bookmarks')
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<string>('All')

  // Submissions state
  const [submissions, setSubmissions] = useState<FanSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  // Favorite category state
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
    if (user) {
      loadSubmissions()
    }
  }, [user, activeTab])

  const handleUpdateFavorite = async (catName: string) => {
    try {
      setUpdatingFavorite(true)
      setSelectedFavorite(catName)
      await updateProfile({
        displayName: profile?.displayName || user?.displayName || user?.username,
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

  const filteredBookmarks = bookmarks.filter((b) => {
    if (bookmarkTypeFilter === 'All') return true
    const type = b.itemType.toLowerCase()
    const filter = bookmarkTypeFilter.toLowerCase()
    if (filter === 'article' && (type === 'article' || type === 'content')) return true
    if (filter === 'content' && (type === 'article' || type === 'content')) return true
    return type === filter
  })

  const bookmarkTypes = ['All', 'Article', 'Character', 'Media', 'Merchandise', 'Release', 'Event']

  return (
    <div className="srs-page-container dashboard-page-view" aria-label="Command Dashboard">
      <div className="srs-page-inner">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Nexus Gate', onClick: () => onNavigate('home') },
            { label: 'Personal Archive', active: true },
          ]}
        />

        {/* Header */}
        <div className="srs-header-banner">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>OPERATIVE COMMAND TERMINAL</span>
          </div>
          <h1 className="srs-main-heading">Personal Archive & Telemetry</h1>
          <p className="srs-main-subtext">
            Access your saved lore chronicles, character dossiers, multimedia streams, and dispatched community submissions.
          </p>
        </div>

        {!user ? (
          <div className="srs-empty-box glass-panel">
            <div className="srs-empty-icon">
              <UserIcon size={44} />
            </div>
            <h3>Authentication Required</h3>
            <p>Sign in to view your personal archive, bookmarked multiverse items, and lore submissions.</p>
            <button type="button" className="srs-btn-action" onClick={onOpenAuth}>
              Sign In with Nexus Account
            </button>
          </div>
        ) : (
          <>
            {/* Quick Stats Strip */}
            <div className="dash-metrics-bar">
              <div className="dash-metric-card glass-panel">
                <div className="metric-icon-wrap">
                  <BookmarkIcon size={20} />
                </div>
                <div className="metric-details">
                  <span className="metric-val">{bookmarks.length}</span>
                  <span className="metric-lbl">Saved Relics</span>
                </div>
              </div>

              <div className="dash-metric-card glass-panel">
                <div className="metric-icon-wrap">
                  <PenToolIcon size={20} />
                </div>
                <div className="metric-details">
                  <span className="metric-val">{submissions.length}</span>
                  <span className="metric-lbl">Lore Dispatches</span>
                </div>
              </div>

              <div className="dash-metric-card glass-panel">
                <div className="metric-icon-wrap">
                  <StarIcon size={20} fill="currentColor" />
                </div>
                <div className="metric-details">
                  <span className="metric-val">{selectedFavorite || 'Nexus Prime'}</span>
                  <span className="metric-lbl">Primary Sector</span>
                </div>
              </div>

              <div className="dash-metric-card glass-panel">
                <div className="metric-icon-wrap">
                  <SparklesIcon size={20} />
                </div>
                <div className="metric-details">
                  <span className="metric-val">{user.role}</span>
                  <span className="metric-lbl">Operative Tier</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="srs-tab-bar dashboard-tabs">
              <button
                type="button"
                className={`srs-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookmarks')}
              >
                Saved Archive ({bookmarks.length})
              </button>
              <button
                type="button"
                className={`srs-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                onClick={() => setActiveTab('submissions')}
              >
                My Lore Submissions ({submissions.length})
              </button>
              <button
                type="button"
                className={`srs-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                Display & Preferences
              </button>
            </div>

            {/* Tab Contents */}
            <div className="dashboard-content-area">
              {/* TAB 1: SAVED BOOKMARKS */}
              {activeTab === 'bookmarks' && (
                <div>
                  {/* Filter chips */}
                  <div className="srs-filter-chips-row">
                    <span className="filter-chips-label">Filter Sector:</span>
                    <div className="filter-chips-list">
                      {bookmarkTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`filter-chip ${bookmarkTypeFilter === type ? 'active' : ''}`}
                          onClick={() => setBookmarkTypeFilter(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredBookmarks.length === 0 ? (
                    <div className="srs-empty-box glass-panel">
                      <div className="srs-empty-icon"><BookmarkIcon size={40} /></div>
                      <h3>No Saved Records in this Sector</h3>
                      <p>Browse chronicles, characters, media, or merchandise and click Save to add them to your archive.</p>
                      <button
                        type="button"
                        className="srs-btn-action"
                        onClick={() => onNavigate('explore')}
                      >
                        Explore Multiverse Chronicles
                      </button>
                    </div>
                  ) : (
                    <div className="srs-cards-grid bookmarks-grid">
                      {filteredBookmarks.map((b) => (
                        <div key={b.id} className="srs-card bookmark-card content-card">
                          <div className="srs-card-media-wrap" onClick={() => onOpenItem(b.itemType, b.itemId)} style={{ cursor: 'pointer' }}>
                            {b.itemImageUrl ? (
                              <img src={b.itemImageUrl} alt={b.itemTitle} className="srs-card-img" loading="lazy" />
                            ) : (
                              <div className="srs-card-img-placeholder">
                                <span>{b.itemType}</span>
                              </div>
                            )}
                            <div className="srs-card-badge-group">
                              <span className="srs-tag-badge">{b.itemType.toLowerCase() === 'content' ? 'Article' : b.itemType}</span>
                            </div>
                          </div>

                          <div className="srs-card-body">
                            <div className="srs-card-meta-line">
                              <span className="srs-meta-category">{b.itemSubtitle || 'Archive'}</span>
                              <span className="srs-meta-universe">{b.itemType.toLowerCase() === 'content' ? 'Article' : b.itemType}</span>
                            </div>
                            <h3
                              className="srs-card-title cursor-pointer"
                              onClick={() => onOpenItem(b.itemType, b.itemId)}
                            >
                              {b.itemTitle}
                            </h3>
                            <div className="bookmark-date-row">
                              Saved on {new Date(b.createdAt).toLocaleDateString()}
                            </div>
                            <div className="srs-card-footer">
                              <button
                                type="button"
                                className="srs-btn-secondary btn-sm"
                                onClick={() => onOpenItem(b.itemType, b.itemId)}
                              >
                                View Record
                              </button>
                              <button
                                type="button"
                                className="btn-icon-danger"
                                onClick={() => onRemoveBookmark(b.id)}
                                title="Remove from archive"
                                aria-label="Remove bookmark"
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LORE SUBMISSIONS */}
              {activeTab === 'submissions' && (
                <div>
                  <div className="submissions-action-bar">
                    <div className="submissions-action-text">
                      <h3>Dispatched Lore Submissions</h3>
                      <p>Track community content submissions, review progress, and editorial notes from overseers.</p>
                    </div>
                    <button
                      type="button"
                      className="srs-btn-action"
                      onClick={() => onNavigate('submissions')}
                    >
                      <PenToolIcon size={14} />
                      <span>Draft New Submission</span>
                    </button>
                  </div>

                  {loadingSubmissions ? (
                    <div className="srs-loading-box">
                      <div className="astral-spinner" />
                      <p>Gathering lore dispatch status...</p>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="srs-empty-box glass-panel">
                      <div className="srs-empty-icon"><PenToolIcon size={40} /></div>
                      <h3>No Lore Dispatches on Record</h3>
                      <p>Contribute your analysis, character deep-dives, theories, or cosplay logs to the multiverse archive.</p>
                      <button
                        type="button"
                        className="srs-btn-action"
                        onClick={() => onNavigate('submissions')}
                      >
                        Create Your First Submission
                      </button>
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
                          <p className="history-card-snippet">{sub.contentText.slice(0, 240)}...</p>

                          {sub.adminNotes && (
                            <div className="history-card-notes">
                              <span className="notes-label">Archivist Review Note:</span>
                              <p className="notes-text">{sub.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PREFERENCES */}
              {activeTab === 'preferences' && (
                <div className="dash-preferences-layout">
                  {/* Primary Realm */}
                  <div className="dash-section-card glass-panel">
                    <div className="section-head">
                      <h4>Primary Fandom Realm</h4>
                      <p>Select your home universe to personalize spotlight feeds and recommendations.</p>
                    </div>

                    {favoriteSuccess && (
                      <div className="srs-alert-banner success">
                        <CheckCircleIcon size={16} />
                        <span>Primary sector updated successfully!</span>
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

                  {/* Display & Accessibility */}
                  <div className="dash-section-card glass-panel">
                    <div className="section-head">
                      <h4>Display & Accessibility Preferences</h4>
                      <p>Adjust visual parameters for optimal archival reading clarity.</p>
                    </div>

                    <div className="pref-row">
                      <div className="pref-label-group">
                        <span className="pref-title">Font Scale Ratio</span>
                        <span className="pref-desc">Modifies base typography sizing across all chronicle archives.</span>
                      </div>
                      <div className="font-scale-group">
                        <button
                          type="button"
                          className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
                          onClick={() => onChangeFontSize?.('small')}
                        >
                          A- Compact
                        </button>
                        <button
                          type="button"
                          className={`font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                          onClick={() => onChangeFontSize?.('normal')}
                        >
                          A Standard
                        </button>
                        <button
                          type="button"
                          className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
                          onClick={() => onChangeFontSize?.('large')}
                        >
                          A+ Expanded
                        </button>
                      </div>
                    </div>

                    <div className="pref-row">
                      <div className="pref-label-group">
                        <span className="pref-title">Visual Atmosphere Theme</span>
                        <span className="pref-desc">Switch between Obsidian Smoked Glass and Frosted Warm-Ivory.</span>
                      </div>
                      <button
                        type="button"
                        className="srs-btn-secondary"
                        onClick={onToggleTheme}
                      >
                        {theme === 'dark' ? (
                          <>
                            <SunIcon size={14} />
                            <span>Switch to Warm-Ivory</span>
                          </>
                        ) : (
                          <>
                            <MoonIcon size={14} />
                            <span>Switch to Obsidian Glass</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
