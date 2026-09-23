import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { Character } from '../types'
import { ArrowRightIcon, BookmarkIcon, EditIcon, StarIcon, UserSilhouetteIcon } from './Icons'

interface CharacterCardProps {
  character: Character
  onSelect: (char: Character) => void
  onEdit?: (char: Character) => void
  isBookmarked?: boolean
  onToggleBookmark?: (char: Character) => void
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onEdit,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const isSuitableAvatar = Boolean(
    character.avatarUrl &&
    character.avatarUrl.trim() !== '' &&
    !character.avatarUrl.includes('photo-1579783902614') &&
    !character.avatarUrl.includes('photo-1534447677768') &&
    !character.avatarUrl.includes('photo-1568602471122')
  )

  return (
    <article className="character-card">
      <div className="character-popout-stage" onClick={() => onSelect(character)}>
        {/* Layer 1: Background Environment Layer */}
        <div className="character-popout-bg">
          <img
            src={character.bannerUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80'}
            alt=""
            className="popout-bg-img"
            loading="lazy"
          />
          <div className="popout-bg-overlay" />
        </div>

        {/* Layer 2: Foreground Pop-Out Character Layer */}
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

        <div className="char-pop-badge">
          <StarIcon size={12} fill="currentColor" />
          <span>{character.popularityScore}%</span>
        </div>

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

      <div className="char-card-body">
        <div className="char-universe-tag">{character.fandomUniverse}</div>
        <h3 className="char-name" onClick={() => onSelect(character)}>
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
          <button className="btn-view-detail" onClick={() => onSelect(character)}>
            <span>Dossier</span>
            <ArrowRightIcon size={14} />
          </button>
          {isAdmin && onEdit && (
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
  )
}
