import React from 'react'

interface AdminConsoleProps {
  onOpenCreateContent: () => void
  onOpenCreateCharacter: () => void
  onOpenCreateMedia: () => void
  totalContent: number
  totalCharacters: number
  totalMedia: number
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onOpenCreateContent,
  onOpenCreateCharacter,
  onOpenCreateMedia,
  totalContent,
  totalCharacters,
  totalMedia,
}) => {
  return (
    <div className="admin-console-page">
      <div className="admin-console-header">
        <div className="admin-badge">ADMINISTRATION CONSOLE</div>
        <h1 className="admin-title">Multiverse Content Management</h1>
        <p className="admin-desc">
          Create, curate, update, and manage fandom chronicles, character dossiers, and audiovisual streams across all 8 universes.
        </p>
      </div>

      <div className="admin-action-grid">
        <div className="admin-action-card">
          <div className="action-icon">📄</div>
          <h3>Fandom Chronicles</h3>
          <p>Publish or modify universe articles, deep dives, and lore analysis.</p>
          <div className="action-stat">{totalContent} Published</div>
          <button className="btn-admin-action" onClick={onOpenCreateContent}>
            ＋ Publish New Article
          </button>
        </div>

        <div className="admin-action-card">
          <div className="action-icon">👤</div>
          <h3>Character Dossiers</h3>
          <p>Author or update hero/villain profiles, combat powers, and origin backstories.</p>
          <div className="action-stat">{totalCharacters} Characters</div>
          <button className="btn-admin-action" onClick={onOpenCreateCharacter}>
            ＋ Add Character Profile
          </button>
        </div>

        <div className="admin-action-card">
          <div className="action-icon">🎬</div>
          <h3>Multimedia Streams</h3>
          <p>Embed official trailers, YouTube previews, or SoundCloud soundtrack streams.</p>
          <div className="action-stat">{totalMedia} Media Streams</div>
          <button className="btn-admin-action" onClick={onOpenCreateMedia}>
            ＋ Add Media Stream
          </button>
        </div>
      </div>
    </div>
  )
}
