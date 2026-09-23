import React from 'react'
import type { Character } from '../types'
import { CloseIcon, StarIcon } from './Icons'

interface CharacterDetailModalProps {
  character: Character | null
  onClose: () => void
  onEdit?: (char: Character) => void
  isAdmin?: boolean
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  onClose,
  onEdit,
  isAdmin = false,
}) => {
  if (!character) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal-container character-detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={14} />
        </button>

        <div className="detail-hero-banner">
          <img
            src={character.bannerUrl || character.avatarUrl}
            alt={character.name}
            className="detail-hero-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80'
            }}
          />
          <div className="detail-hero-gradient" />
          <div className="detail-hero-badges">
            <span className="badge-category">{character.categoryName}</span>
            <span className="badge-type">{character.fandomUniverse}</span>
            <span className="badge-popularity"><StarIcon size={12} fill="currentColor" /> {character.popularityScore}% Rating</span>
          </div>
        </div>

        <div className="detail-body-wrapper">
          <div className="character-header-profile">
            <div className="character-avatar-large">
              <img
                src={character.avatarUrl}
                alt={character.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80'
                }}
              />
            </div>
            <div className="character-identity-info">
              <div className="detail-universe">{character.fandomUniverse}</div>
              <h1 className="detail-title">{character.name}</h1>
              <div className="character-role-tag">{character.roleTitle}</div>
              <div className="detail-meta-row">
                <span className="meta-author">Origin: <strong>{character.originUniverse || 'Nexus Core'}</strong></span>
                {character.voiceActor && (
                  <>
                    <span className="meta-dot">•</span>
                    <span className="meta-author">Voice Actor: <strong>{character.voiceActor}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="detail-summary-box">
            <h3 className="section-title">Character Biography</h3>
            <p className="summary-text">{character.bio}</p>
          </div>

          {character.abilities && (
            <div className="character-abilities-box">
              <h3 className="section-title">Techniques, Powers & Abilities</h3>
              <p className="abilities-text">{character.abilities}</p>
            </div>
          )}

          {character.backstory && (
            <div className="detail-content-text">
              <h3 className="content-subheading">Chronicle & Backstory</h3>
              <p className="content-paragraph">{character.backstory}</p>
            </div>
          )}

          <div className="detail-footer-actions">
            {isAdmin && onEdit && (
              <button
                className="btn-edit-modal"
                onClick={() => {
                  onClose()
                  onEdit(character)
                }}
                aria-label="Edit character profile (Admin)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Character (Admin)</span>
              </button>
            )}
            <button className="btn-close-modal" onClick={onClose}>
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
