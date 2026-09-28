import React from 'react'
import type { Category } from '../types'
import {
  ArchiveIcon,
  CloseIcon,
  CompassIcon,
  LayersIcon,
  RadioIcon,
  WrenchIcon,
  ZapIcon,
} from './Icons'

interface SitemapModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onNavigate: (view: 'home' | 'explore' | 'characters' | 'media' | 'merchandise' | 'releases' | 'events' | 'admin') => void
  onOpenSubmissionModal: () => void
  onOpenFeedbackModal: () => void
  onOpenDashboard: () => void
  onOpenProfile: () => void
  isAdmin: boolean
}

export const SitemapModal: React.FC<SitemapModalProps> = ({
  isOpen,
  onClose,
  categories,
  onNavigate,
  onOpenSubmissionModal,
  onOpenFeedbackModal,
  onOpenDashboard,
  onOpenProfile,
  isAdmin,
}) => {
  if (!isOpen) return null

  const handleJump = (action: () => void) => {
    onClose()
    action()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container glass-modal-card sitemap-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close sitemap">
          <CloseIcon size={14} />
        </button>

        {/* Header */}
        <div className="srs-modal-header">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>NEXUS GATE ARCHIVAL TOPOLOGY</span>
          </div>
          <h2 className="srs-modal-title">Comprehensive System Sitemap</h2>
          <p className="srs-modal-subtitle">
            Complete architectural blueprint and direct navigational vector map for the entire Fan Hub Plus platform.
          </p>
        </div>

        {/* Body Grid of Nodes */}
        <div className="sitemap-grid-layout">
          {/* Node 1: Primary Portals */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><LayersIcon size={18} /></span>
              <h3>Core Portals</h3>
            </div>
            <ul className="sitemap-links-list">
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('home'))}>
                  <strong>Nexus Gateway (Home)</strong>
                  <span>3D Portal canvas, hero experience & multiverse overview</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('explore'))}>
                  <strong>Fandom Chronicles (Explore)</strong>
                  <span>Deep lore articles, multi-genre stories, filters & pagination</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('characters'))}>
                  <strong>Character Dossiers</strong>
                  <span>Operative spotlight dossiers, combat stats & abilities</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('media'))}>
                  <strong>Multimedia Matrix</strong>
                  <span>Soundtracks, cinematic trailers, community ratings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Node 2: Expanded User Archives */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><ArchiveIcon size={18} /></span>
              <h3>Extended Archives</h3>
            </div>
            <ul className="sitemap-links-list">
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('merchandise'))}>
                  <strong>Merchandise Showcase</strong>
                  <span>Collector artifacts, limited editions, statues & prop relics</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('releases'))}>
                  <strong>Chrono Upcoming Releases</strong>
                  <span>Release countdown chronometers, platform specs & hype indices</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(() => onNavigate('events'))}>
                  <strong>Global Events & Conventions</strong>
                  <span>Geospatial radar map, city hubs, schedules & ticket portals</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Node 3: Community Dispatch & Interaction */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><RadioIcon size={18} /></span>
              <h3>Community & Dispatch</h3>
            </div>
            <ul className="sitemap-links-list">
              <li>
                <button className="sitemap-link" onClick={() => handleJump(onOpenSubmissionModal)}>
                  <strong>Fan Lore Submissions</strong>
                  <span>Submit community articles, cosplay build logs & check approval status</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(onOpenFeedbackModal)}>
                  <strong>Feedback & Bug Dispatch</strong>
                  <span>Report anomalies, suggest enhancements, ask archivist queries</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(onOpenDashboard)}>
                  <strong>Personal Archive & Dossier</strong>
                  <span>Manage bookmarks across articles, characters, media & artifacts</span>
                </button>
              </li>
              <li>
                <button className="sitemap-link" onClick={() => handleJump(onOpenProfile)}>
                  <strong>Operative Profile</strong>
                  <span>Callsign customization, favorite fandom realms & settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Node 4: Eight Multiverse Fandom Realms */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><ZapIcon size={18} /></span>
              <h3>The 8 Fandom Realms</h3>
            </div>
            <div className="sitemap-fandoms-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="sitemap-fandom-chip"
                  onClick={() => handleJump(() => onNavigate('explore'))}
                >
                  <span className="chip-name">{cat.name}</span>
                  <span className="chip-slug">/{cat.slug}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Node 5: System Administration & Accessibility */}
          <div className="sitemap-card glass-panel sitemap-card-wide">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><WrenchIcon size={18} /></span>
              <h3>Accessibility & System Operations</h3>
            </div>
            <div className="sitemap-systems-row">
              <div className="system-pill">
                <strong>Accessibility Font Controls:</strong>
                <span>Available via header [A- / A / A+] toggle or Dashboard display preferences.</span>
              </div>
              <div className="system-pill">
                <strong>Visual Themes:</strong>
                <span>Obsidian Smoked Glass (Dark) & Frosted Warm-Ivory (Light) with 68% transparency.</span>
              </div>
              {isAdmin && (
                <button
                  className="system-admin-btn"
                  onClick={() => handleJump(() => onNavigate('admin'))}
                >
                  <CompassIcon size={14} />
                  <span>Admin Console Management Matrix</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sitemap-modal-footer">
          <span>Fan Hub Plus Architecture Specification • All nodes operational</span>
          <button type="button" className="srs-btn-secondary" onClick={onClose}>Close Map</button>
        </div>
      </div>
    </div>
  )
}
