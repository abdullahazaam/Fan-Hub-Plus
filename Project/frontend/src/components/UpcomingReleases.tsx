import React, { useEffect, useState } from 'react'
import * as api from '../api'
import type { Category, UpcomingRelease } from '../types'
import { BookmarkIcon, CloseIcon, SearchIcon, StarIcon } from './Icons'

interface UpcomingReleasesProps {
  categories: Category[]
  onBookmark: (release: UpcomingRelease) => void
  bookmarkedIds: Set<number>
  onOpenAuth: () => void
  isAuthenticated: boolean
}

export const UpcomingReleases: React.FC<UpcomingReleasesProps> = ({
  categories,
  onBookmark,
  bookmarkedIds,
  onOpenAuth,
  isAuthenticated,
}) => {
  const [releases, setReleases] = useState<UpcomingRelease[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [mediaType, setMediaType] = useState<string>('All')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 12

  const mediaTypes = ['All', 'Anime', 'Gaming', 'Movies', 'TV Shows', 'Comics', 'Merchandise']

  const RELEASE_IMAGE_MAP: Record<string, string> = {
    'infinity castle': '/releases/demonslayer_castle.jpg',
    'demon slayer': '/releases/demonslayer_castle.jpg',
    'grand theft auto': '/releases/gta6_vicecity.jpg',
    'gta': '/releases/gta6_vicecity.jpg',
    'secret wars': '/releases/secretwars.jpg',
    'avengers': '/releases/secretwars.jpg',
    'stranger things': '/releases/stranger_things_s5.jpg',
    'spider-verse': '/releases/beyond_spiderverse.jpg',
    'beyond the spider-verse': '/releases/beyond_spiderverse.jpg',
    'chainsaw man': '/releases/chainsawman_reze.jpg',
    'reze': '/releases/chainsawman_reze.jpg',
    'bts': '/releases/bts_reunion.jpg',
    'solo leveling': '/releases/sololeveling_s2.jpg',
  }

  const resolveReleaseImage = (item: UpcomingRelease): string => {
    const key = item.title.toLowerCase()
    for (const [pattern, path] of Object.entries(RELEASE_IMAGE_MAP)) {
      if (key.includes(pattern)) return path
    }
    return item.thumbnailUrl
  }

  const fetchReleases = async () => {
    try {
      if (releases.length === 0) {
        setLoading(true)
      }
      setError(null)
      const res = await api.getUpcomingReleases({
        categoryId: selectedCategoryId || undefined,
        mediaType: mediaType !== 'All' ? mediaType : undefined,
        search: search.trim() || undefined,
        page,
        pageSize,
      })
      const mapped = res.items.map((item) => ({
        ...item,
        thumbnailUrl: resolveReleaseImage(item),
      }))
      setReleases(mapped)
      setTotalCount(res.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve release chronolog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReleases()
  }, [selectedCategoryId, mediaType, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchReleases()
  }

  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr)
    const diff = target.getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Released'
    if (days === 0) return 'Releases Today'
    return `${days} Days to Launch`
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <section className="srs-section-container upcoming-releases-view" aria-label="Upcoming Chrono Releases">
      {/* Header Banner */}
      <div className="srs-header-banner">
        <div className="srs-badge-pill">
          <span className="srs-badge-dot" />
          <span>TEMPORAL CHRONO RADAR</span>
        </div>
        <h1 className="srs-main-heading">Upcoming Multiverse Premieres & Releases</h1>
        <p className="srs-main-subtext">
          Track verified premiere windows, countdown chronometers, hype trajectories, and launch platforms across cinema,
          gaming consoles, streaming, and publishing.
        </p>
      </div>

      {/* Control Bar */}
      <div className="srs-filter-bar glass-panel">
        <div className="srs-filter-row">
          {/* Media Types Pills */}
          <div className="srs-category-pills" role="tablist" aria-label="Filter by Media Type">
            {mediaTypes.map((type) => (
              <button
                key={type}
                className={`srs-pill ${mediaType === type ? 'active' : ''}`}
                onClick={() => {
                  setMediaType(type)
                  setPage(1)
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form className="srs-search-form" onSubmit={handleSearchSubmit}>
            <div className="srs-search-input-wrapper">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search upcoming titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="srs-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="srs-search-clear"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                >
                  <CloseIcon size={12} />
                </button>
              )}
            </div>
            <button type="submit" className="srs-btn-filter-submit">Filter</button>
          </form>
        </div>

        {/* Categories selector row */}
        <div className="srs-tags-row">
          <span className="srs-tags-label">Fandom Universe:</span>
          <button
            className={`srs-tag-chip ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategoryId(null)
              setPage(1)
            }}
          >
            All Universes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`srs-tag-chip ${selectedCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryId(cat.id)
                setPage(1)
              }}
            >
              {cat.name}
            </button>
          ))}
          <span className="srs-count-indicator">
            {totalCount} upcoming debuts documented
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading && releases.length === 0 ? (
        <div className="srs-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="srs-skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="srs-empty-box glass-panel">
          <p className="srs-error-text">{error}</p>
          <button className="srs-btn-action" onClick={fetchReleases}>Retry Connection</button>
        </div>
      ) : releases.length === 0 ? (
        <div className="srs-empty-box glass-panel">
          <div className="srs-empty-icon"><BookmarkIcon size={40} /></div>
          <h3>No Upcoming Releases Found</h3>
          <p>No titles currently matched the filter parameters.</p>
          <button
            className="srs-btn-action"
            onClick={() => {
              setSelectedCategoryId(null)
              setMediaType('All')
              setSearch('')
              setPage(1)
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="srs-cards-grid releases-grid">
            {releases.map((release) => {
              const isSaved = bookmarkedIds.has(release.id)
              const releaseDateObj = new Date(release.releaseDate)
              const formattedDate = releaseDateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const countdown = getDaysRemaining(release.releaseDate)

              return (
                <article key={release.id} className="srs-card release-card content-card">
                  {/* Thumbnail Banner */}
                  <div className="srs-card-media-wrap">
                    <img
                      src={release.thumbnailUrl}
                      alt={release.title}
                      className="srs-card-img"
                      loading="lazy"
                    />
                    <div className="srs-card-badge-group">
                      <span className="srs-tag-badge badge-media-type">{release.mediaType}</span>
                      <span className="srs-stock-badge countdown-badge">{countdown}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="srs-card-body">
                    <div className="folder-slide-window"><div className="folder-slide-panel">
                    <div className="srs-card-meta-line">
                      <span className="srs-meta-category">{release.categoryName}</span>
                      <span className="srs-meta-universe">{release.fandomUniverse}</span>
                    </div>

                    <h3 className="srs-card-title">{release.title}</h3>

                    <div className="folder-retract-details">
                    <p className="srs-card-description">{release.synopsis}</p>

                    {/* Platform & Date Matrix */}
                    <div className="release-specs-matrix">
                      <div className="spec-item">
                        <span className="spec-label">Launch Window</span>
                        <span className="spec-val-highlight">{release.releaseWindow} ({formattedDate})</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Target Platform</span>
                        <span className="spec-val">{release.platform}</span>
                      </div>
                    </div>

                    {/* Hype Meter */}
                    <div className="hype-meter-block">
                      <div className="hype-header">
                        <span className="hype-label">Multiverse Hype Index</span>
                        <span className="hype-score-val">{release.hypeScore}%</span>
                      </div>
                      <div className="hype-bar-track">
                        <div
                          className="hype-bar-fill"
                          style={{ width: `${release.hypeScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    </div>

                    </div></div>
                    <div className="srs-card-footer">
                      <button
                        type="button"
                        className={`btn-bookmark-action ${isSaved ? 'bookmarked' : ''}`}
                        onClick={() => {
                          if (!isAuthenticated) {
                            onOpenAuth()
                          } else {
                            onBookmark(release)
                          }
                        }}
                        title={isSaved ? 'Saved to Reminder Archive' : 'Add to Premiere Reminders'}
                        aria-label={isSaved ? 'Saved to Reminder Archive' : 'Add to Premiere Reminders'}
                      >
                        <StarIcon size={14} fill={isSaved ? 'currentColor' : 'none'} />
                        <span>{isSaved ? 'Tracked' : 'Set Reminder'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="srs-pagination-controls glass-panel">
              <button
                className="srs-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="srs-page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                className="srs-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
