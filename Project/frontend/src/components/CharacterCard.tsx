import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Character } from '../types'
import { ArrowRightIcon, BookmarkIcon, EditIcon, StarIcon } from './Icons'
import './CharacterCard.css'

/* ==============================================================================
   ORIGINAL VECTOR INSIGNIA FOR LORE DOSSIERS (NO UNVERIFIED THIRD-PARTY ART)
   ============================================================================== */

const JohnnyInsigniaIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="28" stroke="rgba(229, 9, 20, 0.4)" strokeWidth="1.2" strokeDasharray="3 3" />
    <path d="M16 26C16 17.1634 23.1634 10 32 10C40.8366 10 48 17.1634 48 26C48 31.854 44.8504 36.9723 40.1875 39.75L39 46H25L23.8125 39.75C19.1496 36.9723 16 31.854 16 26Z" fill="rgba(229, 9, 20, 0.08)" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M22 24L28 27L22 30Z" fill="#dc2626" />
    <circle cx="41" cy="27" r="3.5" stroke="#ef4444" strokeWidth="1.5" />
    <circle cx="41" cy="27" r="1.5" fill="#ef4444" />
    <path d="M32 10V4M32 60V54M4 32H10M60 32H54" stroke="rgba(229, 9, 20, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M27 46H37M29 50H35M31 54H33" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M20 18L13 12M44 18L51 12" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const GojoInsigniaIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="27" stroke="rgba(220, 38, 38, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
    <circle cx="32" cy="32" r="20" stroke="rgba(99, 102, 241, 0.45)" strokeWidth="1.2" />
    <path d="M24 32C24 28 20 25 16 25C12 25 8 28 8 32C8 36 12 39 16 39C20 39 24 36 28 32L36 32C40 28 44 25 48 25C52 25 56 28 56 32C56 36 52 39 48 39C44 39 40 36 36 32" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="32" y1="5" x2="32" y2="12" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="32" y1="52" x2="32" y2="59" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="9" y1="18" x2="15" y2="22" stroke="rgba(99, 102, 241, 0.85)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="49" y1="42" x2="55" y2="46" stroke="rgba(99, 102, 241, 0.85)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9" y1="46" x2="15" y2="42" stroke="rgba(99, 102, 241, 0.85)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="49" y1="22" x2="55" y2="18" stroke="rgba(99, 102, 241, 0.85)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="32" cy="32" r="3" fill="#dc2626" />
  </svg>
)

const GeraltInsigniaIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="28" stroke="rgba(220, 38, 38, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
    <line x1="12" y1="12" x2="52" y2="52" stroke="rgba(220, 38, 38, 0.45)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="12" x2="12" y2="52" stroke="rgba(220, 38, 38, 0.45)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 18L26 27L22 35L32 46L42 35L38 27L44 18L35 24L32 20L29 24L20 18Z" fill="rgba(220, 38, 38, 0.12)" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" />
    <path d="M26 30L29 32" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M38 30L35 32" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 39L30 43L32 40L34 43L36 39" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ClassifiedInsigniaIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="26" stroke="rgba(220, 38, 38, 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
    <path d="M32 14L46 22V34C46 44 38 49 32 52C26 49 18 44 18 34V22L32 14Z" fill="rgba(220, 38, 38, 0.08)" stroke="#dc2626" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="32" cy="33" r="5" stroke="#ef4444" strokeWidth="1.5" />
    <line x1="32" y1="21" x2="32" y2="25" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="32" y1="41" x2="32" y2="45" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const getDossierMetadata = (name: string, universe?: string) => {
  const lowerName = (name || '').toLowerCase()
  const lowerUni = (universe || '').toLowerCase()

  if (lowerName.includes('johnny') || lowerName.includes('silverhand') || lowerUni.includes('cyberpunk')) {
    return {
      theme: 'cyberpunk',
      accession: 'ARCHIVE // NC-2077-JS',
      classification: 'ENGRAM MATRIX',
      specKey: 'BIOWARE / CHIP',
      specVal: 'RELIC 2.0 // SILVERHAND MATRIX',
      dotColor: '#e50914',
      glowColor: 'rgba(229, 9, 20, 0.22)',
      icon: <JohnnyInsigniaIcon />
    }
  }

  if (lowerName.includes('gojo') || lowerName.includes('satoru') || lowerUni.includes('jujutsu')) {
    return {
      theme: 'jujutsu',
      accession: 'REGISTRY // TK-JJ-SG',
      classification: 'SPECIAL GRADE',
      specKey: 'TECHNIQUE',
      specVal: 'LIMITLESS // SIX EYES ACTIVE',
      dotColor: '#dc2626',
      glowColor: 'rgba(99, 102, 241, 0.2)',
      icon: <GojoInsigniaIcon />
    }
  }

  if (lowerName.includes('geralt') || lowerName.includes('rivia') || lowerUni.includes('witcher')) {
    return {
      theme: 'witcher',
      accession: 'CODEX // KM-WOLF-01',
      classification: 'SCHOOL OF WOLF',
      specKey: 'WITCHER SIGNS',
      specVal: 'AARD • IGNI • QUEN • AXII • YRDEN',
      dotColor: '#dc2626',
      glowColor: 'rgba(148, 163, 184, 0.2)',
      icon: <GeraltInsigniaIcon />
    }
  }

  return {
    theme: 'classified',
    accession: 'ARCHIVE // NX-CLASS-00',
    classification: 'CLASSIFIED SPECIMEN',
    specKey: 'TELEMETRY STATUS',
    specVal: 'CORE PROTOCOL SYNCHRONIZED',
    dotColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.16)',
    icon: <ClassifiedInsigniaIcon />
  }
}

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
  const dossierMeta = getDossierMetadata(character.name, character.fandomUniverse)

  // Check if character has a genuine, usable foreground asset
  const isSuitableAvatar = Boolean(
    character.avatarUrl &&
    character.avatarUrl.trim() !== '' &&
    !character.avatarUrl.includes('photo-1579783902614') &&
    !character.avatarUrl.includes('photo-1534447677768') &&
    !character.avatarUrl.includes('photo-1568602471122')
  )

  // Use dedicated sci-fi nexus chamber for prototype card, or character's bannerUrl
  const bgImageUrl = isPrototypeCard
    ? '/vanguard_nexus_bg.jpg'
    : (character.bannerUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80')

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

      // Foreground portrait / insignia pops forward and tracks pointer (+20px max)
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
        className={`character-card ${isInteracting ? 'is-hovering' : ''} ${isSuitableAvatar ? 'has-popout-asset' : 'has-dossier-composition'} dossier-theme-${dossierMeta.theme}`}
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

        {/* 3D Pop-Out / Dossier Composition Stage */}
        <div className="character-popout-stage">
          {/* Layer 1: Clipped Deep Background Environment */}
          <div className="character-popout-bg-box">
            <img
              src={bgImageUrl}
              alt=""
              className="popout-bg-img"
              loading="lazy"
            />
            <div className={`popout-bg-overlay overlay-${dossierMeta.theme}`} />
          </div>

          {/* Layer 2: Pop-Out Portrait OR Bespoke Editorial Dossier Composition */}
          {isSuitableAvatar ? (
            <div className="character-popout-fg">
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="popout-fg-img"
                loading="lazy"
              />
            </div>
          ) : (
            <div className={`character-dossier-composition theme-${dossierMeta.theme}`} aria-label={`Archival telemetry composition for ${character.name}`}>
              {/* Corner Reticle Brackets */}
              <span className="dossier-reticle reticle-tl" aria-hidden="true" />
              <span className="dossier-reticle reticle-tr" aria-hidden="true" />
              <span className="dossier-reticle reticle-bl" aria-hidden="true" />
              <span className="dossier-reticle reticle-br" aria-hidden="true" />

              {/* Accession Header */}
              <div className="dossier-telemetry-header">
                <span className="dossier-accession-tag">{dossierMeta.accession}</span>
                <span className="dossier-classification-pill">{dossierMeta.classification}</span>
              </div>

              {/* 3D Floating Insignia Layer */}
              <div className="dossier-emblem-wrap">
                <div className="dossier-emblem-halo" style={{ background: dossierMeta.glowColor }} aria-hidden="true" />
                <div className="dossier-emblem-icon">
                  {dossierMeta.icon}
                </div>
              </div>

              {/* Telemetry Specs */}
              <div className="dossier-telemetry-specs">
                <span className="dossier-spec-key">{dossierMeta.specKey}</span>
                <span className="dossier-spec-val">{dossierMeta.specVal}</span>
              </div>

              {/* Honest Archival Telemetry Status Badge */}
              <div className="dossier-status-pill">
                <span className="dossier-status-dot" style={{ backgroundColor: dossierMeta.dotColor }} />
                <span>Biometric Telemetry Pending</span>
              </div>
            </div>
          )}

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
