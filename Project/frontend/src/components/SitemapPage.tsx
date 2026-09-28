import React from 'react'
import type { Category, NavView } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import {
  ArchiveIcon,
  CompassIcon,
  LayersIcon,
  RadioIcon,
  WrenchIcon,
  ZapIcon,
} from './Icons'

interface SitemapPageProps {
  categories: Category[]
  onNavigate: (view: NavView) => void
  isAdmin: boolean
}

export const SitemapPage: React.FC<SitemapPageProps> = ({
  categories,
  onNavigate,
  isAdmin,
}) => {
  return (
    <div className="srs-page-container sitemap-page-view" aria-label="Architecture Topology Sitemap">
      <div className="srs-page-inner">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Nexus Gate', onClick: () => onNavigate('home') },
            { label: 'Platform Topology Sitemap', active: true },
          ]}
        />

        {/* Header */}
        <div className="srs-header-banner">
          <div className="srs-badge-pill">
            <span className="srs-badge-dot" />
            <span>NEXUS GATE ARCHIVAL TOPOLOGY</span>
          </div>
          <h1 className="srs-main-heading">Platform Architecture & Vector Sitemap</h1>
          <p className="srs-main-subtext">
            Complete architectural blueprint, multiverse directory, and direct navigational access map for every sector of Fan Hub Plus.
          </p>
        </div>

        {/* 5 Structural Architecture Nodes */}
        <div className="sitemap-grid-layout">
          {/* Node 1: Primary Portals */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><LayersIcon size={18} /></span>
              <h3>Core Portals</h3>
            </div>
            <ul className="sitemap-links-list">
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('home')}>
                  <strong>Nexus Gateway (Home)</strong>
                  <span>3D Portal canvas, hero experience & multiverse overview</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('explore')}>
                  <strong>Fandom Chronicles (Explore)</strong>
                  <span>Deep lore articles, multi-genre stories, filters & pagination</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('characters')}>
                  <strong>Character Dossiers</strong>
                  <span>Operative spotlight dossiers, combat stats & abilities</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('media')}>
                  <strong>Multimedia Matrix</strong>
                  <span>Soundtracks, cinematic trailers, community ratings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Node 2: Extended Archives */}
          <div className="sitemap-card glass-panel">
            <div className="sitemap-card-head">
              <span className="sitemap-icon"><ArchiveIcon size={18} /></span>
              <h3>Extended Archives</h3>
            </div>
            <ul className="sitemap-links-list">
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('merchandise')}>
                  <strong>Merchandise Vault</strong>
                  <span>Collector artifacts, limited editions, statues & prop relics</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('releases')}>
                  <strong>Chrono Upcoming Releases</strong>
                  <span>Release countdown chronometers, platform specs & hype indices</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('events')}>
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
                <button type="button" className="sitemap-link" onClick={() => onNavigate('submissions')}>
                  <strong>Fan Lore Submissions</strong>
                  <span>Submit community articles, cosplay build logs & track approval status</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('feedback')}>
                  <strong>Feedback & Bug Dispatch</strong>
                  <span>Report anomalies, suggest enhancements, ask archivist queries</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('dashboard')}>
                  <strong>Personal Archive & Dossier</strong>
                  <span>Manage bookmarks across articles, characters, media & artifacts</span>
                </button>
              </li>
              <li>
                <button type="button" className="sitemap-link" onClick={() => onNavigate('profile')}>
                  <strong>Operative Profile</strong>
                  <span>Callsign customization, favorite fandom realms & display settings</span>
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
                  type="button"
                  className="sitemap-fandom-chip"
                  onClick={() => onNavigate('explore')}
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
                <strong>Accessibility Controls:</strong>
                <span>Available via header [A- / A / A+] toggle or Dashboard preferences.</span>
              </div>
              <div className="system-pill">
                <strong>Visual Atmosphere:</strong>
                <span>Obsidian Smoked Glass (Dark) & Frosted Warm-Ivory (Light) with 68% transparency.</span>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="system-admin-btn"
                  onClick={() => onNavigate('admin')}
                >
                  <CompassIcon size={14} />
                  <span>Admin Console Management Matrix</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
