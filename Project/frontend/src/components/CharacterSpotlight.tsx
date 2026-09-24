import { CinematicImage } from './CinematicImage'
import React from 'react'
import type { Character } from '../types'
import { CardShell } from './CardShell'
import { ArrowRightIcon, BookmarkIcon, StarIcon, UserSilhouetteIcon } from './Icons'

interface CharacterSpotlightProps {
  character: Character
  onSelect: (char: Character) => void
  onToggleBookmark?: (char: Character) => void
  isBookmarked?: boolean
}

export const CharacterSpotlight: React.FC<CharacterSpotlightProps> = ({
  character,
  onSelect,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  const isSuitableAvatar = Boolean(
    character.avatarUrl &&
    character.avatarUrl.trim() !== '' &&
    !character.avatarUrl.includes('photo-1579783902614') &&
    !character.avatarUrl.includes('photo-1534447677768') &&
    !character.avatarUrl.includes('photo-1568602471122')
  )

  return (
    <CardShell className="character-spotlight-card" onClick={() => onSelect(character)}>
      <div className="spotlight-visual-area character-popout-stage">
        {/* Layer 1: Background Environment Layer */}
        <div className="character-popout-bg">
          <CinematicImage universe="character"
            src={character.bannerUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80'}
            alt=""
            className="spotlight-bg-img popout-bg-img"
            loading="lazy"
          />
          <div className="spotlight-overlay-gradient popout-bg-overlay" />
        </div>

        {/* Layer 2: Foreground Pop-Out Character Layer */}
        <div className="character-popout-fg">
          {isSuitableAvatar ? (
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="spotlight-portrait-img popout-fg-img"
              loading="lazy"
            />
          ) : (
            <div className="neutral-dossier-placeholder spotlight-dossier-placeholder">
              <div className="dossier-silhouette-icon">
                <UserSilhouetteIcon size={56} />
              </div>
              <span className="artwork-pending-pill">Character artwork pending</span>
            </div>
          )}
        </div>

        <div className="spotlight-badge-cluster">
          <span className="spotlight-category-tag">{character.fandomUniverse}</span>
        </div>

        {onToggleBookmark && (
          <button
            className={`btn-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(character)
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark character'}
            aria-label="Toggle character bookmark"
          >
            <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="spotlight-info-pane">
        <div className="spotlight-eyebrow">
          <span className="universe-tag">{character.fandomUniverse}</span>
          <div className="pop-badge-pill">
            <StarIcon size={13} fill="currentColor" />
            <span>{character.popularityScore}% Rating</span>
          </div>
        </div>

        <h3 className="spotlight-name">{character.name}</h3>
        <div className="spotlight-role">{character.roleTitle}</div>
        <p className="spotlight-bio">{character.bio}</p>

        {character.abilities && (
          <div className="spotlight-powers-preview">
            <span className="power-label">Key Techniques & Traits:</span>
            <span className="power-text">{character.abilities}</span>
          </div>
        )}

        <div className="spotlight-footer">
          <span className="origin-text">Origin: <strong>{character.originUniverse || 'Nexus Core'}</strong></span>
          <div className="view-dossier-link">
            <span>Open Dossier</span>
            <ArrowRightIcon size={15} className="arrow" />
          </div>
        </div>
      </div>
    </CardShell>
  )
}
