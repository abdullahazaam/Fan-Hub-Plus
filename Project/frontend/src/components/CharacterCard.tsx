import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Character } from '../types'
import { ArrowRightIcon, BookmarkIcon, EditIcon, StarIcon, UserSilhouetteIcon } from './Icons'

export interface CharacterCardProps {
  character: Character
  onSelect: (char: Character) => void
  onEdit?: (char: Character) => void
  isBookmarked?: boolean
  onToggleBookmark?: (char: Character) => void
  isPrototype?: boolean
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onEdit,
  isBookmarked = false,
  onToggleBookmark,
  isPrototype = false,
}) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const cardRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  const isPrototypeCard = isPrototype || character.id < 0 || character.fandomUniverse?.includes('Prototype')

  // Check if character has a genuine, usable foreground asset
  const isSuitableAvatar = Boolean(
    character.avatarUrl &&
    character.avatarUrl.trim() !== '' &&
    !character.avatarUrl.includes('photo-1579783902614') &&
    !character.avatarUrl.includes('photo-1534447677768') &&
    !character.avatarUrl.includes('photo-1568602471122')
  )

  // Smooth pointer-following physics with requestAnimationFrame
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const card = cardRef.current
    if (!card) return

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect()
      // Normalized coordinates (-0.5 to 0.5)
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5

      // Realistic subtle 3D pitch/yaw (max ~7.5 degrees)
      const rotX = -ny * 13
      const rotY = nx * 13

      // Multi-layer parallax shifts:
      // Background layer shifts opposite to pointer (-14px max)
      const bgX = -nx * 15
      const bgY = -ny * 15

      // Foreground portrait pops forward and tracks pointer (+20px max)
      const fgX = nx * 22
      const fgY = ny * 22

      // Pointer highlight percentage
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100

      card.style.setProperty('--rot-x', `${rotX.toFixed(2)}deg`)
      card.style.setProperty('--rot-y', `${rotY.toFixed(2)}deg`)
      card.style.setProperty('--bg-shift-x', `${bgX.toFixed(2)}px`)
      card.style.setProperty('--bg-shift-y', `${bgY.toFixed(2)}px`)
      card.style.setProperty('--fg-shift-x', `${fgX.toFixed(2)}px`)
      card.style.setProperty('--fg-shift-y', `${fgY.toFixed(2)}px`)
      card.style.setProperty('--mouse-x', `${mouseX.toFixed(1)}%`)
      card.style.setProperty('--mouse-y', `${mouseY.toFixed(1)}%`)
      card.style.setProperty('--rim-opacity', '1')
    })
  }, [])

  const handlePointerEnter = useCallback(() => {
    setIsInteracting(true)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setIsInteracting(false)
    const card = cardRef.current
    if (!card) return

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    // Smoothly return to rest state
    card.style.setProperty('--rot-x', '0deg')
    card.style.setProperty('--rot-y', '0deg')
    card.style.setProperty('--bg-shift-x', '0px')
    card.style.setProperty('--bg-shift-y', '0px')
    card.style.setProperty('--fg-shift-x', '0px')
    card.style.setProperty('--fg-shift-y', '0px')
    card.style.setProperty('--rim-opacity', '0')
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(character)
    }
  }

  return (
    <div className={`character-card-outer ${isPrototypeCard ? 'is-prototype-card' : ''}`}>
      <article
        ref={cardRef}
        className={`character-card ${isInteracting ? 'is-hovering' : ''} ${isSuitableAvatar ? 'has-popout-asset' : 'has-pending-asset'}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={() => onSelect(character)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={`Character dossier for ${character.name}`}
      >
        {/* Subtle Fandom-Colored Rim Light Layer */}
        <div className="char-rim-light" aria-hidden="true" />

        {/* 3D Pop-Out Visual Stage */}
        <div className="character-popout-stage">
          {/* Layer 1: Clipped Deep Background Environment */}
          <div className="character-popout-bg-box">
            <img
              src={character.bannerUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80'}
              alt=""
              className="popout-bg-img"
              loading="lazy"
            />
            <div className="popout-bg-overlay" />
          </div>

          {/* Layer 2: Pop-Out Portrait / Dossier Placeholder */}
          <div className="character-popout-fg">
            {isSuitableAvatar ? (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="popout-fg-img"
                loading="lazy"
              />
            ) : (
              <div className="neutral-dossier-placeholder">
                <div className="dossier-silhouette-icon">
                  <UserSilhouetteIcon size={44} />
                </div>
                <span className="artwork-pending-pill">Character artwork pending</span>
              </div>
            )}
          </div>

          {/* Top Badges: Prototype Tag / Popularity */}
          <div className="char-stage-badges">
            {isPrototypeCard ? (
              <div className="prototype-specimen-badge">
                <span className="prototype-indicator-dot" />
                <span>Prototype</span>
              </div>
            ) : (
              <div className="char-pop-badge">
                <StarIcon size={12} fill="currentColor" />
                <span>{character.popularityScore}%</span>
              </div>
            )}
          </div>

          {/* Bookmark Button */}
          {user && onToggleBookmark && (
            <button
              className={`btn-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(character)
              }}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Character'}
              aria-label="Toggle character bookmark"
            >
              <BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Layer 3: Editorial Typography & Dossier Action */}
        <div className="char-card-body">
          <div className="char-header-row">
            <span className="char-universe-tag">{character.fandomUniverse}</span>
            {isPrototypeCard && (
              <span className="prototype-status-pill">Interactive Specimen</span>
            )}
          </div>

          <h3 className="char-name">
            {character.name}
          </h3>

          <div className="char-role-title">{character.roleTitle}</div>
          <p className="char-bio-excerpt">{character.bio}</p>

          <div className="char-meta-footer">
            <span className="char-origin">Origin: {character.originUniverse || 'Nexus Core'}</span>
            {character.voiceActor && (
              <span className="char-va">VA: {character.voiceActor}</span>
            )}
          </div>

          <div className="card-actions">
            <button
              className="btn-view-detail"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(character)
              }}
              aria-label={`Open Dossier for ${character.name}`}
            >
              <span>Dossier</span>
              <ArrowRightIcon size={14} />
            </button>

            {isAdmin && onEdit && !isPrototypeCard && (
              <button
                className="btn-admin-edit"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(character)
                }}
                title="Edit character profile (Admin)"
                aria-label="Edit character"
              >
                <EditIcon size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
