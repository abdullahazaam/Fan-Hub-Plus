import React, { useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { NavView } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import {
  BugIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  LightbulbIcon,
} from './Icons'

interface FeedbackPageProps {
  onNavigate: (view: NavView) => void
  onSuccessToast?: (msg: string) => void
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  onNavigate,
  onSuccessToast,
}) => {
  const { user } = useAuth()

  const [feedbackType, setFeedbackType] = useState<'Bug' | 'Suggestion' | 'Query'>('Bug')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState(user?.email || '')
  const [userName, setUserName] = useState(user?.displayName || user?.username || '')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      onSuccessToast?.('Feedback transmitted successfully to Nexus overseers!')
      setSubject('')
      setMessage('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to transmit feedback dispatch.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="srs-page-container feedback-page-view" aria-label="Feedback and Anomaly Dispatch">
      <div className="srs-page-inner">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Nexus Gate', onClick: () => onNavigate('home') },
            { label: 'Feedback & Support', active: true },
          ]}
        />

        {/* Header */}
        <div className="srs-header-banner">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>NEXUS ARCHIVIST COMM-LINK</span>
          </div>
          <h1 className="srs-main-heading">Operative Feedback & Anomaly Dispatch</h1>
          <p className="srs-main-subtext">
            Report dimensional interface anomalies, suggest multiverse features, or submit general platform queries to the central archivist council.
          </p>
        </div>

        {/* 3 Interactive Cards to Pick Category */}
        <div className="feedback-cards-grid">
          <div
            className={`feedback-choice-card glass-panel ${feedbackType === 'Bug' ? 'selected' : ''}`}
            onClick={() => setFeedbackType('Bug')}
            aria-pressed={feedbackType === 'Bug'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeedbackType('Bug') } }}
            role="button"
            tabIndex={0}
          >
            <div className="choice-icon-wrap bug">
              <BugIcon size={24} />
            </div>
            <h3>Anomaly & Bug Report</h3>
            <p>Report UI render glitches, audio playback issues, or API connectivity failures.</p>
            <span className="choice-status-pill">{feedbackType === 'Bug' ? 'Selected' : 'Select'}</span>
          </div>

          <div
            className={`feedback-choice-card glass-panel ${feedbackType === 'Suggestion' ? 'selected' : ''}`}
            onClick={() => setFeedbackType('Suggestion')}
            aria-pressed={feedbackType === 'Suggestion'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeedbackType('Suggestion') } }}
            role="button"
            tabIndex={0}
          >
            <div className="choice-icon-wrap suggestion">
              <LightbulbIcon size={24} />
            </div>
            <h3>Feature Suggestion</h3>
            <p>Propose new fandom realms, media capabilities, or visual design refinements.</p>
            <span className="choice-status-pill">{feedbackType === 'Suggestion' ? 'Selected' : 'Select'}</span>
          </div>

          <div
            className={`feedback-choice-card glass-panel ${feedbackType === 'Query' ? 'selected' : ''}`}
            onClick={() => setFeedbackType('Query')}
            aria-pressed={feedbackType === 'Query'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeedbackType('Query') } }}
            role="button"
            tabIndex={0}
          >
            <div className="choice-icon-wrap query">
              <HelpCircleIcon size={24} />
            </div>
            <h3>Archivist Inquiry / Query</h3>
            <p>Questions regarding bookmarks, fan lore submission reviews, or permissions.</p>
            <span className="choice-status-pill">{feedbackType === 'Query' ? 'Selected' : 'Select'}</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="feedback-form-container glass-panel">
          <div className="form-card-header">
            <h3>
              {feedbackType === 'Bug' && 'Transmit Anomaly Report'}
              {feedbackType === 'Suggestion' && 'Submit Platform Enhancement Proposal'}
              {feedbackType === 'Query' && 'Dispatch Archivist Support Query'}
            </h3>
            <p>
              Your transmission is assigned an encrypted telemetry key and reviewed by technical overseers.
            </p>
          </div>

          {success && (
            <div className="srs-alert-banner success">
              <CheckCircleIcon size={18} />
              <div>
                <strong>Transmission Received & Queued!</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem' }}>
                  Thank you for keeping the Nexus Gate matrix pristine. Your dispatch ticket is active.
                </p>
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
              <label className="srs-label">Subject Line *</label>
              <input
                type="text"
                required
                placeholder={
                  feedbackType === 'Bug'
                    ? 'e.g. Media stream player pauses unexpectedly on Chromium browsers'
                    : feedbackType === 'Suggestion'
                    ? 'e.g. Integrate custom playlist support for soundtrack tracks'
                    : 'e.g. Inquiry regarding cosplay showcase publishing timeframe'
                }
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="srs-input"
              />
            </div>

            <div className="form-group-half">
              <label className="srs-label">Operative Callsign / Name</label>
              <input
                type="text"
                placeholder="Agent callsign"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="srs-input"
              />
            </div>

            <div className="form-group-half">
              <label className="srs-label">Contact Relay Email</label>
              <input
                type="email"
                placeholder="agent@nexus.fanhubplus.local"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="srs-input"
              />
            </div>

            <div className="form-group-full">
              <label className="srs-label">Detailed Transmission Description *</label>
              <textarea
                required
                rows={6}
                placeholder="Provide comprehensive details, steps to reproduce (for anomalies), or user stories (for suggestions)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="srs-textarea"
              />
            </div>

            <div className="form-group-full form-actions-row">
              <button
                type="submit"
                className="srs-btn-action"
                disabled={submitting}
              >
                {submitting ? 'Transmitting...' : 'Dispatch Comm-Link Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
