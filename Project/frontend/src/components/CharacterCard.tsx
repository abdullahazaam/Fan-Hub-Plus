import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { Character } from '../types'

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
        <div className="char-pop-badge">★ {character.popularityScore}%</div>

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
            {isBookmarked ? '★' : '☆'}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
