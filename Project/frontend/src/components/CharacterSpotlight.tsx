import React from 'react'
import type { Character } from '../types'
import { CardShell } from './CardShell'
import { ArrowRightIcon, BookmarkIcon, StarIcon, UserIcon } from './Icons'

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
  return (
    <CardShell className="character-spotlight-card" onClick={() => onSelect(character)}>
      <div className="spotlight-visual-area">
        <img
          src={character.bannerUrl || character.avatarUrl}
          alt={character.name}
          className="spotlight-bg-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80'
          }}
        />
        <div className="spotlight-overlay-gradient" />

        <div className="spotlight-badge-cluster">
          <span className="spotlight-category-tag">{character.fandomUniverse}</span>
        </div>

        <div className="spotlight-avatar-box">
          {character.avatarUrl ? (
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="spotlight-portrait-img"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80'
              }}
            />
          ) : (
            <div className="spotlight-avatar-fallback">
              <UserIcon size={36} />
            </div>
          )}
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
