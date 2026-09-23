import React from 'react'

interface NavbarProps {
  apiStatus: string
  dbStatus: string
  onOpenCreate: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ apiStatus, dbStatus, onOpenCreate }) => {
  return (
    <header className="nexus-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-gem" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="brand-meta">NN-Zynex • Astral Nexus</div>
            <div className="brand-title">Fan Hub Plus</div>
          </div>
        </div>

        <div className="nav-actions">
          <div className="system-pill">
            <span className={`status-dot ${apiStatus === 'Healthy' ? 'active' : 'inactive'}`} />
            <span className="status-text">{apiStatus === 'Healthy' ? 'API Online' : 'Connecting'}</span>
            <span className="divider">•</span>
            <span className="db-text">{dbStatus || 'SQL Server'}</span>
          </div>

          <button className="btn-admin-action" onClick={onOpenCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Content</span>
            <span className="role-tag">Admin</span>
          </button>
        </div>
      </div>
    </header>
  )
}
