import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import type { NavView } from '../types'
import {
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  GemIcon,
  LogOutIcon,
  MapIcon,
  MenuIcon,
  MessageSquareIcon,
  MoonIcon,
  PenToolIcon,
  RadioIcon,
  SearchIcon,
  StarIcon,
  SunIcon,
  UserIcon,
} from './Icons'

interface NavbarProps {
  currentView: NavView
  onNavigate: (view: NavView) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  bookmarkCount: number
  onOpenAuth: () => void
  onOpenProfile?: () => void
  onOpenDashboard?: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  fontSize?: 'small' | 'normal' | 'large'
  onChangeFontSize?: (size: 'small' | 'normal' | 'large') => void
  onOpenFeedback?: () => void
  onOpenSubmission?: () => void
  onOpenSitemap?: () => void
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
  fontSize = 'normal',
  onChangeFontSize,
  onOpenFeedback,
  onOpenSubmission,
  onOpenSitemap,
}) => {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)

  // Dropdown states
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const moreDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const firstDrawerItemRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Dynamically synchronize exact rendered navbar height with CSS variable
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height
        document.documentElement.style.setProperty('--navbar-height', `${h}px`)
      }
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [fontSize, isScrolled])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

    const timer = setTimeout(() => {
      firstDrawerItemRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMobileDrawer()
        return
      }

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
    setTimeout(() => {
      menuButtonRef.current?.focus()
    }, 50)
  }

  const handleNavClick = (view: NavView) => {
    onNavigate(view)
    setMoreDropdownOpen(false)
    setProfileDropdownOpen(false)
    if (mobileMenuOpen) {
      closeMobileDrawer()
    }
  }

  const isSecondaryActive =
    currentView === 'merchandise' || currentView === 'releases' || currentView === 'events' || currentView === 'sitemap'

  return (
    <header
      ref={headerRef}
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
          <div className="brand-mark-chip theme-logo-image" role="img" aria-label="Fan Hub Plus logo" />
          <div className="brand-identity-text">
            <div className="brand-title-wrap">
              <span className="brand-text">FAN HUB PLUS</span>
              <span className="brand-badge">MULTIVERSE</span>
            </div>
            <span className="brand-subtitle">Every fandom. One universe.</span>
          </div>
        </div>

        {/* Primary Desktop Navigation Links: Clean & Streamlined */}
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
            <span>Chronicles</span>
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

          {/* More Dropdown for Secondary Portals */}
          <div className="nav-dropdown-wrapper" ref={moreDropdownRef}>
            <button
              type="button"
              className={`nav-link-btn nav-dropdown-btn ${isSecondaryActive || moreDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setMoreDropdownOpen(!moreDropdownOpen)
                setProfileDropdownOpen(false)
              }}
              aria-expanded={moreDropdownOpen}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDownIcon size={12} className={`dropdown-chevron ${moreDropdownOpen ? 'rotated' : ''}`} />
              {isSecondaryActive && <span className="nav-active-dot" />}
            </button>

            {moreDropdownOpen && (
              <div className="nav-floating-dropdown more-dropdown">
                <button
                  type="button"
                  className={`dropdown-menu-item ${currentView === 'merchandise' ? 'active' : ''}`}
                  onClick={() => handleNavClick('merchandise')}
                >
                  <span className="dropdown-item-icon"><GemIcon size={16} /></span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-title">Merchandise Vault</span>
                    <span className="dropdown-item-sub">Collectibles from your favorite worlds</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`dropdown-menu-item ${currentView === 'releases' ? 'active' : ''}`}
                  onClick={() => handleNavClick('releases')}
                >
                  <span className="dropdown-item-icon"><ClockIcon size={16} /></span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-title">Upcoming Releases</span>
                    <span className="dropdown-item-sub">See what’s coming next</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`dropdown-menu-item ${currentView === 'events' ? 'active' : ''}`}
                  onClick={() => handleNavClick('events')}
                >
                  <span className="dropdown-item-icon"><RadioIcon size={16} /></span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-title">Events & Conventions</span>
                    <span className="dropdown-item-sub">Find your next fan gathering</span>
                  </div>
                </button>

                <div className="dropdown-divider" />
                <button
                  type="button"
                  className={`dropdown-menu-item ${currentView === 'sitemap' ? 'active' : ''}`}
                  onClick={() => {
                    if (onOpenSitemap) onOpenSitemap()
                    handleNavClick('sitemap')
                  }}
                >
                  <span className="dropdown-item-icon"><MapIcon size={16} /></span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-title">Explore Fan Hub Plus</span>
                    <span className="dropdown-item-sub">Find every corner of the community</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Admin Tools Link (Only visible to Admin) */}
          {isAdmin && (
            <button
              className={`nav-link-btn admin-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
              title="Manage Fan Hub Plus"
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
                placeholder="Search stories and fandoms..."
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
              title="Search chronicles"
              aria-label="Open Search"
            >
              <SearchIcon size={17} />
            </button>
          )}

          {/* Accessibility Font Size Controls */}
          {onChangeFontSize && (
            <div className="nav-font-size-cluster" title="Text size" role="group" aria-label="Font Size Controls">
              <button
                type="button"
                className={`btn-font-scale ${fontSize === 'small' ? 'active' : ''}`}
                onClick={() => onChangeFontSize('small')}
                aria-label="Decrease font size (A-)"
                aria-pressed={fontSize === 'small'}
                title="Font: 85%"
              >
                A-
              </button>
              <button
                type="button"
                className={`btn-font-scale ${fontSize === 'normal' ? 'active' : ''}`}
                onClick={() => onChangeFontSize('normal')}
                aria-label="Default font size (A)"
                aria-pressed={fontSize === 'normal'}
                title="Font: 100%"
              >
                A
              </button>
              <button
                type="button"
                className={`btn-font-scale ${fontSize === 'large' ? 'active' : ''}`}
                onClick={() => onChangeFontSize('large')}
                aria-label="Increase font size (A+)"
                aria-pressed={fontSize === 'large'}
                title="Font: 118%"
              >
                A+
              </button>
            </div>
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

          {/* User Account / Profile Dropdown */}
          {user ? (
            <div className="profile-dropdown-wrapper" ref={profileDropdownRef}>
              <button
                type="button"
                className={`btn-nav-profile-pill ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen)
                  setMoreDropdownOpen(false)
                }}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                title="Account menu"
              >
                <div className="avatar-chip">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="avatar-img-sm" />
                  ) : (
                    <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="username-sm">{user.displayName || user.username}</span>
                <ChevronDownIcon size={12} className={`dropdown-chevron ${profileDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="nav-floating-dropdown profile-dropdown">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" />
                      ) : (
                        <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="dropdown-user-details">
                      <span className="dropdown-user-name">{user.displayName || user.username}</span>
                      <span className="dropdown-user-email">{user.email}</span>
                      <span className={`dropdown-role-chip ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className={`dropdown-menu-item ${currentView === 'profile' ? 'active' : ''}`}
                    onClick={() => {
                      if (onOpenProfile) onOpenProfile()
                      handleNavClick('profile')
                    }}
                  >
                    <span className="dropdown-item-icon"><UserIcon size={16} /></span>
                    <div className="dropdown-item-text">
                      <span className="dropdown-item-title">My Profile</span>
                      <span className="dropdown-item-sub">Your bio and favorite fandoms</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`dropdown-menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => {
                      if (onOpenDashboard) onOpenDashboard()
                      handleNavClick('dashboard')
                    }}
                  >
                    <span className="dropdown-item-icon"><StarIcon size={16} fill="none" /></span>
                    <div className="dropdown-item-text">
                      <span className="dropdown-item-title">My Archive</span>
                      <span className="dropdown-item-sub">Saved items & submissions</span>
                    </div>
                    {bookmarkCount > 0 && (
                      <span className="dropdown-badge-counter">{bookmarkCount}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`dropdown-menu-item ${currentView === 'submissions' ? 'active' : ''}`}
                    onClick={() => {
                      if (onOpenSubmission) onOpenSubmission()
                      handleNavClick('submissions')
                    }}
                  >
                    <span className="dropdown-item-icon"><PenToolIcon size={16} /></span>
                    <div className="dropdown-item-text">
                      <span className="dropdown-item-title">Submit Fan Lore</span>
                      <span className="dropdown-item-sub">Share your stories and theories</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`dropdown-menu-item ${currentView === 'feedback' ? 'active' : ''}`}
                    onClick={() => {
                      if (onOpenFeedback) onOpenFeedback()
                      handleNavClick('feedback')
                    }}
                  >
                    <span className="dropdown-item-icon"><MessageSquareIcon size={16} /></span>
                    <div className="dropdown-item-text">
                      <span className="dropdown-item-title">Feedback & Support</span>
                      <span className="dropdown-item-sub">Report an issue or share an idea</span>
                    </div>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-menu-item item-logout"
                    onClick={() => {
                      logout()
                      onNavigate('home')
                      setProfileDropdownOpen(false)
                    }}
                  >
                    <span className="dropdown-item-icon"><LogOutIcon size={16} /></span>
                    <div className="dropdown-item-text">
                      <span className="dropdown-item-title">Sign Out</span>
                      <span className="dropdown-item-sub">Sign out of your account</span>
                    </div>
                  </button>
                </div>
              )}
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
                  <span>Chronicles</span>
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
                <button
                  className={`mobile-nav-item ${currentView === 'merchandise' ? 'active' : ''}`}
                  onClick={() => handleNavClick('merchandise')}
                >
                  <span>Merchandise</span>
                  {currentView === 'merchandise' && <span className="mobile-active-dot" />}
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'releases' ? 'active' : ''}`}
                  onClick={() => handleNavClick('releases')}
                >
                  <span>Releases</span>
                  {currentView === 'releases' && <span className="mobile-active-dot" />}
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'events' ? 'active' : ''}`}
                  onClick={() => handleNavClick('events')}
                >
                  <span>Events</span>
                  {currentView === 'events' && <span className="mobile-active-dot" />}
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

                <div className="mobile-quick-links-divider" />
                <button
                  className={`mobile-nav-item sub-action-item ${currentView === 'submissions' ? 'active' : ''}`}
                  onClick={() => {
                    if (onOpenSubmission) onOpenSubmission()
                    handleNavClick('submissions')
                  }}
                >
                  <PenToolIcon size={16} />
                  <span>Submit Fan Lore</span>
                </button>
                <button
                  className={`mobile-nav-item sub-action-item ${currentView === 'feedback' ? 'active' : ''}`}
                  onClick={() => {
                    if (onOpenFeedback) onOpenFeedback()
                    handleNavClick('feedback')
                  }}
                >
                  <MessageSquareIcon size={16} />
                  <span>Feedback & Support</span>
                </button>
                <button
                  className={`mobile-nav-item sub-action-item ${currentView === 'sitemap' ? 'active' : ''}`}
                  onClick={() => {
                    if (onOpenSitemap) onOpenSitemap()
                    handleNavClick('sitemap')
                  }}
                >
                  <MapIcon size={16} />
                  <span>Sitemap</span>
                </button>
              </div>

              <div className="mobile-drawer-actions">
                {onChangeFontSize && (
                  <div className="mobile-font-scale-row">
                    <span className="action-label">Font Scale:</span>
                    <div className="font-scale-group sm" role="group" aria-label="Font Size Controls">
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize('small')}
                        aria-label="Decrease font size (A-)"
                        aria-pressed={fontSize === 'small'}
                      >
                        A-
                      </button>
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize('normal')}
                        aria-label="Default font size (A)"
                        aria-pressed={fontSize === 'normal'}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
                        onClick={() => onChangeFontSize('large')}
                        aria-label="Increase font size (A+)"
                        aria-pressed={fontSize === 'large'}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                )}

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
                        onClick={() => handleNavClick('dashboard')}
                      >
                        <StarIcon size={14} fill="currentColor" />
                        <span>Saved ({bookmarkCount})</span>
                      </button>
                      <button
                        className="btn-mobile-subaction"
                        onClick={() => handleNavClick('profile')}
                      >
                        <span>Profile</span>
                      </button>
                      <button
                        className="btn-mobile-subaction logout"
                        onClick={() => {
                          closeMobileDrawer()
                          logout()
                          onNavigate('home')
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
