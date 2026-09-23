import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import {
  CloseIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  StarIcon,
  SunIcon,
} from './Icons'

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
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)

  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const firstDrawerItemRef = useRef<HTMLButtonElement>(null)

  // Track scroll position to update surface style (compact obsidian/ivory with crimson rim)
  useEffect(() => {
    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const scrolled = window.scrollY > 20
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Manage keyboard focus and Escape key for mobile menu drawer
  useEffect(() => {
    if (!mobileMenuOpen) return

    // Focus the first focusable element inside the drawer upon opening
    const timer = setTimeout(() => {
      firstDrawerItemRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMobileDrawer()
        return
      }

      // Trap focus inside mobile drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  const closeMobileDrawer = () => {
    setMobileMenuOpen(false)
    // Restore focus to the mobile menu hamburger button
    setTimeout(() => {
      menuButtonRef.current?.focus()
    }, 50)
  }

  const handleNavClick = (view: 'home' | 'explore' | 'characters' | 'media' | 'admin') => {
    onNavigate(view)
    if (mobileMenuOpen) {
      closeMobileDrawer()
    }
  }

  return (
    <header
      className={`cinematic-header ${isScrolled ? 'is-scrolled' : ''} theme-${theme}`}
      role="banner"
    >
      <div className="header-container">
        {/* Brand / Logo with Obsidian Chip & Crimson Accent */}
        <div
          className="brand-link"
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNavClick('home')
          }}
          aria-label="Fan Hub Plus Home"
        >
          <div className="brand-mark-chip">
            <span className="brand-mark-initials">FH+</span>
            <div className="brand-mark-crimson-line" />
          </div>
          <div className="brand-identity-text">
            <div className="brand-title-wrap">
              <span className="brand-text">FAN HUB PLUS</span>
              <span className="brand-badge">MULTIVERSE</span>
            </div>
            <span className="brand-subtitle">Nexus Gate Archive</span>
          </div>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="primary-nav" role="navigation" aria-label="Main Navigation">
          <button
            className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <span>Home</span>
            {currentView === 'home' && <span className="nav-active-dot" />}
          </button>
          <button
            className={`nav-link-btn ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => handleNavClick('explore')}
          >
            <span>Explore</span>
            {currentView === 'explore' && <span className="nav-active-dot" />}
          </button>
          <button
            className={`nav-link-btn ${currentView === 'characters' ? 'active' : ''}`}
            onClick={() => handleNavClick('characters')}
          >
            <span>Characters</span>
            {currentView === 'characters' && <span className="nav-active-dot" />}
          </button>
          <button
            className={`nav-link-btn ${currentView === 'media' ? 'active' : ''}`}
            onClick={() => handleNavClick('media')}
          >
            <span>Media</span>
            {currentView === 'media' && <span className="nav-active-dot" />}
          </button>

          {/* Admin Tools Link (Only visible to Admin) */}
          {isAdmin && (
            <button
              className={`nav-link-btn admin-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
              title="Admin Management Console"
            >
              <span>Admin Tools</span>
              {currentView === 'admin' && <span className="nav-active-dot" />}
            </button>
          )}
        </nav>

        {/* Right Desktop Utility Group */}
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
              <SearchIcon size={17} />
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

          {/* Mobile Hamburger Button */}
          <button
            ref={menuButtonRef}
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Drawer (mounted via createPortal to cover full screen) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className={`mobile-drawer-portal ${mobileMenuOpen ? 'is-open' : ''} theme-${theme}`}
            aria-hidden={!mobileMenuOpen}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mobile-drawer-backdrop" onClick={closeMobileDrawer} />

            <div className="mobile-drawer-content">
              <div className="mobile-drawer-header">
                <div className="brand-mark-chip sm">
                  <span className="brand-mark-initials">FH+</span>
                </div>
                <span className="mobile-drawer-title">Navigation</span>
                <button
                  className="btn-drawer-close"
                  onClick={closeMobileDrawer}
                  aria-label="Close mobile menu"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <div className="mobile-nav-links">
                <button
                  ref={firstDrawerItemRef}
                  className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => handleNavClick('home')}
                >
                  <span>Home</span>
                  {currentView === 'home' && <span className="mobile-active-dot" />}
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'explore' ? 'active' : ''}`}
                  onClick={() => handleNavClick('explore')}
                >
                  <span>Explore</span>
                  {currentView === 'explore' && <span className="mobile-active-dot" />}
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'characters' ? 'active' : ''}`}
                  onClick={() => handleNavClick('characters')}
                >
                  <span>Characters</span>
                  {currentView === 'characters' && <span className="mobile-active-dot" />}
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'media' ? 'active' : ''}`}
                  onClick={() => handleNavClick('media')}
                >
                  <span>Media</span>
                  {currentView === 'media' && <span className="mobile-active-dot" />}
                </button>

                {isAdmin && (
                  <button
                    className={`mobile-nav-item admin-item ${currentView === 'admin' ? 'active' : ''}`}
                    onClick={() => handleNavClick('admin')}
                  >
                    <span>Admin Tools</span>
                    {currentView === 'admin' && <span className="mobile-active-dot" />}
                  </button>
                )}
              </div>

              <div className="mobile-drawer-actions">
                <div className="mobile-theme-row">
                  <span className="action-label">Theme Mode: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                  <button
                    className={`theme-toggle-pill ${theme === 'light' ? 'light-active' : 'dark-active'}`}
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                  >
                    <span className="theme-toggle-knob">
                      {theme === 'dark' ? <MoonIcon size={12} color="#ffffff" /> : <SunIcon size={13} color="#ffffff" />}
                    </span>
                  </button>
                </div>

                {user ? (
                  <div className="mobile-user-box">
                    <div className="mobile-user-info">
                      <div className="avatar-chip">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="avatar-img-sm" />
                        ) : (
                          <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="mobile-user-name">{user.displayName || user.username}</span>
                    </div>

                    <div className="mobile-user-btns">
                      <button
                        className="btn-mobile-subaction"
                        onClick={() => {
                          closeMobileDrawer()
                          onOpenDashboard()
                        }}
                      >
                        <StarIcon size={14} fill="currentColor" />
                        <span>Saved ({bookmarkCount})</span>
                      </button>
                      <button
                        className="btn-mobile-subaction"
                        onClick={() => {
                          closeMobileDrawer()
                          onOpenProfile()
                        }}
                      >
                        <span>Profile</span>
                      </button>
                      <button
                        className="btn-mobile-subaction logout"
                        onClick={() => {
                          closeMobileDrawer()
                          logout()
                        }}
                      >
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-mobile-signin"
                    onClick={() => {
                      closeMobileDrawer()
                      onOpenAuth()
                    }}
                  >
                    Sign in to Fan Hub Plus
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
