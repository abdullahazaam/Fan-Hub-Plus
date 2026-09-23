import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CloseIcon, MoonIcon, SearchIcon, StarIcon, SunIcon } from './Icons'

interface NavbarProps {
  currentView: 'home' | 'explore' | 'characters' | 'media' | 'admin'
  onNavigate: (view: 'home' | 'explore' | 'characters' | 'media' | 'admin') => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  bookmarkCount: number
  onOpenAuth: () => void
  onOpenProfile: () => void
  onOpenDashboard: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  bookmarkCount,
  onOpenAuth,
  onOpenProfile,
  onOpenDashboard,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [showSearchInput, setShowSearchInput] = useState(false)

  return (
    <header className="cinematic-header" role="banner">
      <div className="header-container">
        {/* Brand / Logo */}
        <div
          className="brand-link"
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigate('home')
          }}
          aria-label="Fan Hub Plus Home"
        >
          <span className="brand-text">FAN HUB PLUS</span>
          <span className="brand-slash">/</span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="primary-nav" role="navigation" aria-label="Main Navigation">
          <button
            className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button
            className={`nav-link-btn ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            Explore
          </button>
          <button
            className={`nav-link-btn ${currentView === 'characters' ? 'active' : ''}`}
            onClick={() => onNavigate('characters')}
          >
            Characters
          </button>
          <button
            className={`nav-link-btn ${currentView === 'media' ? 'active' : ''}`}
            onClick={() => onNavigate('media')}
          >
            Media
          </button>

          {/* Admin link (Only visible to Admin) */}
          {isAdmin && (
            <button
              className={`nav-link-btn admin-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
              title="Admin Management Console"
            >
              Admin Tools
            </button>
          )}
        </nav>

        {/* Right Utility Group */}
        <div className="header-right-group">
          {/* Quick search input or toggle button */}
          {showSearchInput ? (
            <div className="nav-search-bar">
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search multiverse..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  if (currentView !== 'explore') onNavigate('explore')
                }}
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setShowSearchInput(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSearchInput(false)
                }}
              />
              <button
                className="btn-nav-icon"
                onClick={() => {
                  setShowSearchInput(false)
                  onSearchChange('')
                }}
                aria-label="Close search"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn-nav-icon"
              onClick={() => {
                setShowSearchInput(true)
                if (currentView !== 'explore') onNavigate('explore')
              }}
              title="Quick Search (Explore)"
              aria-label="Open Search"
            >
              <SearchIcon size={18} />
            </button>
          )}

          {/* Theme Switcher Toggle Pill */}
          <button
            className={`theme-toggle-pill ${theme === 'light' ? 'light-active' : 'dark-active'}`}
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span className="theme-toggle-knob">
              {theme === 'dark' ? <MoonIcon size={12} color="#ffffff" /> : <SunIcon size={13} color="#ffffff" />}
            </span>
          </button>

          {/* Account Actions */}
          {user ? (
            <div className="user-nav-dropdown">
              <button
                className="btn-nav-saved"
                onClick={onOpenDashboard}
                title="Saved Items"
                aria-label="View saved items"
              >
                <StarIcon size={14} fill="currentColor" />
                <span className="saved-badge">{bookmarkCount}</span>
              </button>

              <button
                className="btn-nav-profile-pill"
                onClick={onOpenProfile}
                title="Open User Profile"
              >
                <div className="avatar-chip">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="avatar-img-sm" />
                  ) : (
                    <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="username-sm">{user.displayName || user.username}</span>
              </button>

              <button
                className="btn-nav-logout"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              className="btn-nav-signin"
              onClick={onOpenAuth}
              aria-label="Sign in"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
