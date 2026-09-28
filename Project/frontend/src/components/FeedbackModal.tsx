import React, { useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import { BugIcon, CheckIcon, CloseIcon, HelpCircleIcon, LightbulbIcon } from './Icons'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const [feedbackType, setFeedbackType] = useState<'Bug' | 'Suggestion' | 'Query'>('Bug')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState(user?.email || '')
  const [userName, setUserName] = useState(user?.displayName || user?.username || '')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('Please provide a subject and detailed description.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await api.submitFeedback({
        feedbackType,
        subject: subject.trim(),
        message: message.trim(),
        userEmail: userEmail.trim() || undefined,
        userName: userName.trim() || undefined,
      })

      setSuccess(true)
      setSubject('')
      setMessage('')

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch feedback transmission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container glass-modal-card feedback-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={14} />
        </button>

        {/* Header */}
        <div className="srs-modal-header">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>OPERATIVE TELEMETRY DISPATCH</span>
          </div>
          <h2 className="srs-modal-title">System Feedback & Inquiries</h2>
          <p className="srs-modal-subtitle">
            Report anomalous bugs, propose interface improvements, or query archivist administration.
          </p>
        </div>

        {/* Body */}
        <div className="srs-modal-body">
          {success ? (
            <div className="srs-alert-banner success">
              <CheckIcon size={20} />
              <div>
                <strong>Transmission Received!</strong>
                <p>Your dispatch has been logged in the system registry. Thank you for assisting platform integrity.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="srs-form-grid">
              {error && (
                <div className="srs-alert-banner error">
                  <span>{error}</span>
                </div>
              )}

              {/* Feedback Type Selector */}
              <div className="form-group-full">
                <label className="srs-label">Feedback Category *</label>
                <div className="srs-type-selector-pills">
                  {(['Bug', 'Suggestion', 'Query'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`srs-type-pill ${feedbackType === type ? 'active' : ''}`}
                      onClick={() => setFeedbackType(type)}
                    >
                      {type === 'Bug' && (
                        <>
                          <BugIcon size={14} />
                          <span>Bug Report</span>
                        </>
                      )}
                      {type === 'Suggestion' && (
                        <>
                          <LightbulbIcon size={14} />
                          <span>Suggestion / Idea</span>
                        </>
                      )}
                      {type === 'Query' && (
                        <>
                          <HelpCircleIcon size={14} />
                          <span>Question / Query</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-full">
                <label className="srs-label">Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    feedbackType === 'Bug'
                      ? 'Brief summary of the issue (e.g. Media modal audio stops on safari)'
                      : feedbackType === 'Suggestion'
                      ? 'Proposed feature or aesthetic enhancement'
                      : 'Topic of your query or question'
                  }
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-half">
                <label className="srs-label">Operative Name</label>
                <input
                  type="text"
                  placeholder="Your callsign or name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-half">
                <label className="srs-label">Reply Email (Optional)</label>
                <input
                  type="email"
                  placeholder="operative@fanhubplus.local"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="srs-input"
                />
              </div>

              <div className="form-group-full">
                <label className="srs-label">Detailed Dispatch / Description *</label>
                <textarea
                  required
                  rows={5}
                  placeholder={
                    feedbackType === 'Bug'
                      ? 'Please describe steps to reproduce, device/browser, and observed behavior...'
                      : feedbackType === 'Suggestion'
                      ? 'Describe your idea, how it enhances the multiverse experience, and potential use cases...'
                      : 'Enter your inquiry with any relevant fandom details or question...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                  {submitting ? 'Transmitting Dispatch...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
