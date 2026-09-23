import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { Character } from '../types'
import { ArrowRightIcon, BookmarkIcon, EditIcon, StarIcon } from './Icons'

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

  return (
    <article className="character-card">
      <div className="char-banner-wrap" onClick={() => onSelect(character)}>
        <img
          src={character.bannerUrl || character.avatarUrl}
          alt={character.name}
          className="char-banner-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80'
          }}
        />
        <div className="char-banner-overlay" />
        <div className="char-avatar-ring">
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="char-avatar-img"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80'
            }}
          />
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
