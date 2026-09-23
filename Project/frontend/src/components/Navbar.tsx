import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  apiStatus: 'online' | 'offline' | 'loading'
  dbStatus: string
  onOpenCreate: () => void
  onOpenAuth: () => void
  onOpenProfile: () => void
}

export function Navbar({ apiStatus, dbStatus, onOpenCreate, onOpenAuth, onOpenProfile }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <nav className="nexus-navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        <span className="brand-hex">⬡</span>
        <span className="brand-title">Fan Hub Plus</span>
        <span className="brand-divider">|</span>
        <span className="brand-sub">Fandom Multiverse</span>
      </div>

      <div className="navbar-status-group">
        <div className={`status-chip ${apiStatus}`} title={dbStatus}>
          <span className="status-dot" />
          <span className="status-label">
            {apiStatus === 'loading' ? 'Connecting…' : apiStatus === 'online' ? 'API Live' : 'API Offline'}
          </span>
        </div>

        {apiStatus === 'online' && (
          <div className="status-chip online" title="SQL Server active">
            <span className="status-dot" />
            <span className="status-label">SQL Server</span>
          </div>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            {/* Admin-only: Create button — hidden from non-admins, but API also enforces this */}
            {user.role === 'Admin' && (
              <button
                className="btn-create-content"
                onClick={onOpenCreate}
                title="Admin: Create new fandom content item"
                aria-label="Create fandom content (Admin)"
              >
                <span>＋</span> Create Content
              </button>
            )}

            {/* User identity pill */}
            <div className="user-pill" role="group" aria-label="User menu">
              <div className="user-pill-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="user-avatar-img" />
                ) : (
                  <span className="user-avatar-initial">
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="user-pill-name">{user.displayName || user.username}</span>
              <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
            </div>

            <button className="btn-nav-secondary" onClick={onOpenProfile} aria-label="Open profile">
              Profile
            </button>
            <button className="btn-nav-signout" onClick={logout} aria-label="Sign out">
              Sign Out
            </button>
          </>
        ) : (
          <button className="btn-nav-auth" onClick={onOpenAuth} aria-label="Sign in or register">
            Sign In / Register
          </button>
        )}
      </div>
    </nav>
  )
}
