import React, { useEffect, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Category, FanSubmission } from '../types'
import { CheckCircleIcon, CheckIcon, ClockIcon, CloseIcon, SparklesIcon, XCircleIcon } from './Icons'

interface FanSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onOpenAuth: () => void
  onSuccess?: () => void
}

export const FanSubmissionModal: React.FC<FanSubmissionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onOpenAuth,
  onSuccess,
}) => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1)
  const [fandomUniverse, setFandomUniverse] = useState('')
  const [submissionType, setSubmissionType] = useState('Article')
  const [contentText, setContentText] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')

  // User History
  const [mySubmissions, setMySubmissions] = useState<FanSubmission[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories])

  const loadUserSubmissions = async () => {
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
    if (isOpen && user) {
      loadUserSubmissions()
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      onOpenAuth()
      return
    }

    if (!title.trim() || !contentText.trim()) {
      setSubmitError('Title and chronicle content are required.')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      await api.submitFanContent({
        title: title.trim(),
        authorName: user.displayName || user.username,
        authorEmail: user.email,
        categoryId,
        fandomUniverse: fandomUniverse.trim() || 'General Fandom',
        submissionType,
        contentText: contentText.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
      })

      setSubmitSuccess(true)
      setTitle('')
      setFandomUniverse('')
      setContentText('')
      setMediaUrl('')

      // Reload user history
      await loadUserSubmissions()
      if (onSuccess) onSuccess()

      setTimeout(() => {
        setSubmitSuccess(false)
        setActiveTab('history')
      }, 1500)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission transmission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container glass-modal-card fan-submission-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={14} />
        </button>

        {/* Modal Header */}
        <div className="srs-modal-header">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>FAN HUB COMMUNITY DISPATCH</span>
          </div>
          <h2 className="srs-modal-title">Archival Lore & Fan Submissions</h2>
          <p className="srs-modal-subtitle">
            Submit your community articles, multiverse theories, cosplay build logs, or lore breakdowns for official curation.
          </p>

          {/* Navigation Tabs */}
          <div className="srs-tab-bar">
            <button
              className={`srs-tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              Submit New Lore
            </button>
            <button
              className={`srs-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('history')
                loadUserSubmissions()
              }}
            >
              My Submissions ({mySubmissions.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="srs-modal-body">
          {!user ? (
            <div className="srs-auth-gate-box glass-panel">
              <div className="srs-gate-icon"><SparklesIcon size={40} /></div>
              <h3>Operative Authentication Required</h3>
              <p>You must be signed in to submit fan lore or monitor approval status in the archives.</p>
              <button
                type="button"
                className="srs-btn-action"
                onClick={() => {
                  onClose()
                  onOpenAuth()
                }}
              >
                Sign In / Register Operative Account
              </button>
            </div>
          ) : activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="srs-form-grid">
              {submitSuccess && (
                <div className="srs-alert-banner success">
                  <CheckIcon size={16} />
                  <span>Submission transmitted successfully! Our archivists will review your entry shortly.</span>
                </div>
              )}

              {submitError && (
                <div className="srs-alert-banner error">
                  <span>{submitError}</span>
                </div>
              )}

              <div className="form-group-full">
                <label className="srs-label">Submission Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cyberpunk 2077: Decrypting the Blackwall Protocol"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-half">
                <label className="srs-label">Fandom Universe *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Elden Ring, Marvel, Attack on Titan"
                  value={fandomUniverse}
                  onChange={(e) => setFandomUniverse(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-half">
                <label className="srs-label">Primary Realm / Category</label>
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
                <label className="srs-label">Submission Type</label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="srs-select"
                >
                  <option value="Article">Chronicle Article</option>
                  <option value="Theory">Multiverse Theory</option>
                  <option value="Cosplay">Cosplay Build Log</option>
                  <option value="Lore Breakdown">Lore Breakdown</option>
                  <option value="Art">Visual Concept / Fan Art</option>
                </select>
              </div>

              <div className="form-group-half">
                <label className="srs-label">Media / Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-full">
                <label className="srs-label">Chronicle Text / Analysis *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write your analysis, character breakdown, or theory here with evidence, citations, and detailed insights..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  className="srs-textarea"
                />
              </div>

              <div className="form-actions-bar">
                <button
                  type="button"
                  className="srs-btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="srs-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Transmitting Entry...' : 'Submit to Archivists'}
                </button>
              </div>
            </form>
          ) : (
            <div className="srs-submissions-history">
              {loadingHistory ? (
                <div className="srs-history-loading">Retrieving user dossiers...</div>
              ) : mySubmissions.length === 0 ? (
                <div className="srs-empty-box glass-panel">
                  <p>You have not submitted any fan lore or chronicles yet.</p>
                  <button
                    className="srs-btn-action"
                    onClick={() => setActiveTab('submit')}
                  >
                    Create Your First Submission
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
        </div>
      </div>
    </div>
  )
}
