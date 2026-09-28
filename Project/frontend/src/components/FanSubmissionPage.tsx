import React, { useEffect, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Category, FanSubmission, FanSubmissionFormData, NavView } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import {
  CheckCircleIcon,
  ClockIcon,
  PenToolIcon,
  SparklesIcon,
  UserIcon,
  XCircleIcon,
} from './Icons'

interface FanSubmissionPageProps {
  categories: Category[]
  onNavigate: (view: NavView) => void
  onOpenAuth: () => void
  onSuccessToast?: (msg: string) => void
}

export const FanSubmissionPage: React.FC<FanSubmissionPageProps> = ({
  categories,
  onNavigate,
  onOpenAuth,
  onSuccessToast,
}) => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1)
  const [fandomUniverse, setFandomUniverse] = useState('')
  const [submissionType, setSubmissionType] = useState('Article')
  const [contentText, setContentText] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [authorName, setAuthorName] = useState(user?.displayName || user?.username || '')
  const [authorEmail, setAuthorEmail] = useState(user?.email || '')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // User submissions history
  const [mySubmissions, setMySubmissions] = useState<FanSubmission[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories])

  const fetchHistory = async () => {
    if (!user) return
    try {
      setLoadingHistory(true)
      const data = await api.getUserSubmissions()
      setMySubmissions(data)
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (user) {
      if (!authorName) setAuthorName(user.displayName || user.username || '')
      if (!authorEmail) setAuthorEmail(user.email || '')
      fetchHistory()
    }
  }, [user, activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !contentText.trim() || !fandomUniverse.trim()) {
      setError('Please provide a title, universe, and the chronicle text.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload: FanSubmissionFormData = {
        title: title.trim(),
        categoryId,
        fandomUniverse: fandomUniverse.trim(),
        submissionType,
        contentText: contentText.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        authorName: (authorName.trim() || user?.displayName || user?.username || undefined),
        authorEmail: (authorEmail.trim() || user?.email || undefined),
      }

      await api.submitFanContent(payload)
      setSuccess(true)
      onSuccessToast?.('Your lore transmission has been received for overseer review!')

      // Reset form
      setTitle('')
      setFandomUniverse('')
      setContentText('')
      setMediaUrl('')

      // Refresh history immediately
      if (user) {
        await fetchHistory()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transmission failed. Please verify connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="srs-page-container submission-page-view" aria-label="Community Lore Dispatch">
      <div className="srs-page-inner">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Nexus Gate', onClick: () => onNavigate('home') },
            { label: 'Submit Fan Lore', active: true },
          ]}
        />

        {/* Header */}
        <div className="srs-header-banner">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>COMMUNITY MULTIVERSE CREATIVE FORGE</span>
          </div>
          <h1 className="srs-main-heading">Dispatch Fan Lore & Multiverse Chronicles</h1>
          <p className="srs-main-subtext">
            Submit original theories, character retrospectives, deep analyses, or cosplay logs to be reviewed and immortalized in the Nexus Gate chronicle archive.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="srs-tab-bar">
          <button
            type="button"
            className={`srs-tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <PenToolIcon size={14} />
            <span>Draft New Submission</span>
          </button>
          {user && (
            <button
              type="button"
              className={`srs-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span>My Submissions History ({mySubmissions.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Submit Form */}
        {activeTab === 'submit' && (
          <div className="submission-content-grid">
            {/* Form Column */}
            <div className="submission-form-card glass-panel">
              <div className="form-card-header">
                <h3>Draft Chronicle Transmission</h3>
                <p>Fill out all required parameters before beaming your entry to archive moderators.</p>
              </div>

              {success && (
                <div className="srs-alert-banner success">
                  <CheckCircleIcon size={18} />
                  <div>
                    <strong>Lore Transmission Received!</strong>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem' }}>
                      Your submission has been cataloged and placed in the verification queue. Once approved, it will be published to the Fandom Chronicles.
                    </p>
                    {user && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="srs-btn srs-btn-outline"
                        style={{ marginTop: '0.6rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <span>View in My Submissions History</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="srs-alert-banner error">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="srs-form-grid">
                <div className="form-group-full">
                  <label className="srs-label">Chronicle Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Paradox of Time Lines in Modern Shonen"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="srs-input"
                  />
                </div>

                <div className="form-group-half">
                  <label className="srs-label">Multiverse Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="srs-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-half">
                  <label className="srs-label">Fandom Universe *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyberpunk, Jujutsu Kaisen, Star Wars"
                    value={fandomUniverse}
                    onChange={(e) => setFandomUniverse(e.target.value)}
                    className="srs-input"
                  />
                </div>

                <div className="form-group-half">
                  <label className="srs-label">Submission Category *</label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="srs-select"
                  >
                    <option value="Article">Article & Lore</option>
                    <option value="Cosplay">Cosplay Showcase & Build Log</option>
                    <option value="Theory">Multiverse Theory / Analysis</option>
                    <option value="Interview">Creator / Fan Spotlight</option>
                  </select>
                </div>

                <div className="form-group-half">
                  <label className="srs-label">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.webp"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="srs-input"
                  />
                </div>

                {!user && (
                  <>
                    <div className="form-group-half">
                      <label className="srs-label">Author Name / Callsign</label>
                      <input
                        type="text"
                        placeholder="Your pen name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="srs-input"
                      />
                    </div>
                    <div className="form-group-half">
                      <label className="srs-label">Author Email</label>
                      <input
                        type="email"
                        placeholder="For status notifications"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="srs-input"
                      />
                    </div>
                  </>
                )}

                <div className="form-group-full">
                  <label className="srs-label">Chronicle Text / Article Body *</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write your comprehensive analysis, creative theory, character breakdown, or fabrication guide here..."
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="srs-textarea"
                  />
                </div>

                <div className="form-group-full form-actions-row">
                  <button
                    type="submit"
                    className="srs-btn-action"
                    disabled={submitting}
                  >
                    {submitting ? 'Transmitting to Nexus...' : 'Transmit Lore for Review'}
                  </button>
                  {!user && (
                    <button
                      type="button"
                      className="srs-btn-secondary"
                      onClick={onOpenAuth}
                    >
                      <UserIcon size={14} />
                      <span>Sign In to Track Dispatches</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sidebar Guidelines Column */}
            <div className="submission-sidebar">
              <div className="sidebar-card glass-panel">
                <div className="sidebar-card-head">
                  <SparklesIcon size={18} />
                  <h4>Archival Guidelines</h4>
                </div>
                <ul className="guidelines-list">
                  <li>
                    <strong>Rich Original Insight:</strong> Deep lore theories, character psychological dives, and historical fandom analyses are preferred.
                  </li>
                  <li>
                    <strong>Respect Lore Integrity:</strong> Ground your speculative hypotheses in canon events or notable spin-offs.
                  </li>
                  <li>
                    <strong>Image Dimensions:</strong> Provide high-resolution widescreen banners (16:9 or 16:10) for optimal chronicle presentation.
                  </li>
                  <li>
                    <strong>Review Turnaround:</strong> Submissions are inspected by Nexus Overseers within 24–48 standard cycles.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Submission History */}
        {activeTab === 'history' && user && (
          <div>
            {loadingHistory ? (
              <div className="srs-loading-box">
                <div className="astral-spinner" />
                <p>Retrieving your dispatch history...</p>
              </div>
            ) : mySubmissions.length === 0 ? (
              <div className="srs-empty-box glass-panel">
                <div className="srs-empty-icon"><PenToolIcon size={40} /></div>
                <h3>No Lore Transmissions on Record</h3>
                <p>Draft your first submission today to see it tracked here with review notes.</p>
                <button
                  type="button"
                  className="srs-btn-action"
                  onClick={() => setActiveTab('submit')}
                >
                  Draft First Lore Piece
                </button>
              </div>
            ) : (
              <div className="srs-history-list">
                {mySubmissions.map((sub) => (
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
      </div>
    </div>
  )
}
