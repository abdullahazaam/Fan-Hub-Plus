import React, { useEffect, useState } from 'react'
import * as api from '../api'
import type { Category, MerchandiseItem } from '../types'
import { BookmarkIcon, CloseIcon, SearchIcon, StarIcon } from './Icons'
import { resolveMerchImage } from './MerchandiseDetailPage'

interface MerchandiseShowcaseProps {
  categories: Category[]
  onBookmark: (item: MerchandiseItem) => void
  bookmarkedIds: Set<number>
  onOpenAuth: () => void
  isAuthenticated: boolean
  onInspect?: (item: MerchandiseItem) => void
}

export const MerchandiseShowcase: React.FC<MerchandiseShowcaseProps> = ({
  categories,
  onBookmark,
  bookmarkedIds,
  onOpenAuth,
  isAuthenticated,
  onInspect,
}) => {
  const [items, setItems] = useState<MerchandiseItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 12

  // Quick detail preview
  const [previewItem, setPreviewItem] = useState<MerchandiseItem | null>(null)

  const tags = ['All', 'Limited Edition', 'Pre-Order', 'Collectible', 'Official Artifact']

  const fetchMerchandise = async () => {
    try {
      if (items.length === 0) {
        setLoading(true)
      }
      setError(null)
      const res = await api.getMerchandise({
        categoryId: selectedCategoryId || undefined,
        tag: selectedTag !== 'All' ? selectedTag : undefined,
        search: search.trim() || undefined,
        page,
        pageSize,
      })
      const mapped = res.items.map((item) => ({
        ...item,
        imageUrl: resolveMerchImage(item),
      }))
      setItems(mapped)
      setTotalCount(res.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load merchandise.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchandise()
  }, [selectedCategoryId, selectedTag, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchMerchandise()
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <section className="srs-section-container merchandise-showcase-view" aria-label="Merchandise Vault">
      {/* Section Header */}
      <div className="srs-header-banner">
        <div className="srs-badge-pill">
          <span className="srs-badge-dot" />
          <span>OFFICIAL MULTIVERSE MERCHANDISE VAULT</span>
        </div>
        <h1 className="srs-main-heading">Artifacts, Replicas & Collector Editions</h1>
        <p className="srs-main-subtext">
          Browse authenticated limited drops, wearable relics, and high-fidelity figurines from across all 8 fandom realms.
          Save artifacts to your personal archive.
        </p>
      </div>

      {/* Control Bar: Categories, Tags & Search */}
      <div className="srs-filter-bar glass-panel">
        <div className="srs-filter-row">
          {/* Categories Horizontal Pills */}
          <div className="srs-category-pills" role="tablist" aria-label="Filter by Category">
            <button
              className={`srs-pill ${selectedCategoryId === null ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryId(null)
                setPage(1)
              }}
            >
              All Fandoms
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`srs-pill ${selectedCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategoryId(cat.id)
                  setPage(1)
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form className="srs-search-form" onSubmit={handleSearchSubmit}>
            <div className="srs-search-input-wrapper">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search collectibles..."
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

        {/* Tag Filters */}
        <div className="srs-tags-row">
          <span className="srs-tags-label">Edition:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`srs-tag-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => {
                setSelectedTag(tag)
                setPage(1)
              }}
            >
              {tag}
            </button>
          ))}
          <span className="srs-count-indicator">
            {totalCount} {totalCount === 1 ? 'artifact' : 'artifacts'} documented
          </span>
        </div>
      </div>

      {/* Content Grid */}
      {loading && items.length === 0 ? (
        <div className="srs-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="srs-skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="srs-empty-box glass-panel">
          <p className="srs-error-text">{error}</p>
          <button className="srs-btn-action" onClick={fetchMerchandise}>Retry Connection</button>
        </div>
      ) : items.length === 0 ? (
        <div className="srs-empty-box glass-panel">
          <div className="srs-empty-icon"><BookmarkIcon size={40} /></div>
          <h3>No Artifacts Located</h3>
          <p>No merchandise matched the current fandom or edition filters.</p>
          <button
            className="srs-btn-action"
            onClick={() => {
              setSelectedCategoryId(null)
              setSelectedTag('All')
              setSearch('')
              setPage(1)
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="srs-cards-grid">
            {items.map((item) => {
              const isSaved = bookmarkedIds.has(item.id)
              return (
                <article key={item.id} className="srs-card merchandise-card content-card">
                  {/* Card Media Banner */}
                  <div
                    className="srs-card-media-wrap"
                    onClick={() => setPreviewItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setPreviewItem(item)
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="srs-card-img"
                      loading="lazy"
                    />
                    <div className="srs-card-badge-group">
                      <span className={`srs-tag-badge badge-${item.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.tag}
                      </span>
                      <span className={`srs-stock-badge stock-${item.stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.stockStatus}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="srs-card-body">
                    <div className="srs-card-meta-line">
                      <span className="srs-meta-category">{item.categoryName}</span>
                      <span className="srs-meta-universe">{item.fandomUniverse}</span>
                    </div>

                    <h3
                      className="srs-card-title"
                      onClick={() => setPreviewItem(item)}
                      role="button"
                      tabIndex={0}
                    >
                      {item.name}
                    </h3>

                    <p className="srs-card-description">{item.description}</p>

                    <div className="srs-card-footer">
                      <div className="srs-price-tag">
                        <span className="srs-currency">$</span>
                        <span className="srs-amount">{item.price.toFixed(2)}</span>
                        <span className="srs-currency-code">{item.currency}</span>
                      </div>

                      <div className="srs-card-actions">
                        <button
                          type="button"
                          className={`btn-bookmark-action ${isSaved ? 'bookmarked' : ''}`}
                          onClick={() => {
                            if (!isAuthenticated) {
                              onOpenAuth()
                            } else {
                              onBookmark(item)
                            }
                          }}
                          title={isSaved ? 'Saved to Archive' : 'Save to Personal Archive'}
                          aria-label={isSaved ? 'Saved to Archive' : 'Save to Personal Archive'}
                        >
                          <StarIcon size={14} fill={isSaved ? 'currentColor' : 'none'} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-inspect-action"
                          onClick={() => {
                            if (onInspect) {
                              onInspect(item)
                            } else {
                              setPreviewItem(item)
                            }
                          }}
                        >
                          Inspect
                        </button>
                      </div>
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

      {/* Artifact Inspect Modal */}
      {previewItem && (
        <div className="modal-backdrop" onClick={() => setPreviewItem(null)} role="dialog" aria-modal="true">
          <div className="detail-modal-container glass-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setPreviewItem(null)}
              aria-label="Close preview"
            >
              <CloseIcon size={14} />
            </button>

            <div className="srs-detail-modal-grid">
              <div className="srs-detail-image-box">
                <img src={previewItem.imageUrl} alt={previewItem.name} className="srs-detail-image" />
                <div className="srs-detail-tags">
                  <span className="srs-tag-badge">{previewItem.tag}</span>
                  <span className="srs-stock-badge">{previewItem.stockStatus}</span>
                </div>
              </div>

              <div className="srs-detail-content-box">
                <div className="srs-detail-meta">
                  <span className="srs-meta-cat">{previewItem.categoryName}</span>
                  <span className="srs-meta-sep">•</span>
                  <span className="srs-meta-universe">{previewItem.fandomUniverse}</span>
                </div>

                <h2 className="srs-detail-title">{previewItem.name}</h2>
                <div className="srs-detail-price">
                  ${previewItem.price.toFixed(2)} {previewItem.currency}
                </div>

                <div className="srs-detail-desc-block">
                  <h4>Artifact Specification</h4>
                  <p>{previewItem.description}</p>
                </div>

                <div className="srs-detail-notice">
                  <span className="srs-notice-dot" />
                  <span>Exhibition Showcase Only • Official licensed manufacturer artifact</span>
                </div>

                <div className="srs-detail-actions">
                  <button
                    type="button"
                    className={`srs-btn-save-primary ${bookmarkedIds.has(previewItem.id) ? 'saved' : ''}`}
                    onClick={() => {
                      if (!isAuthenticated) onOpenAuth()
                      else onBookmark(previewItem)
                    }}
                  >
                    <StarIcon size={16} fill={bookmarkedIds.has(previewItem.id) ? 'currentColor' : 'none'} />
                    <span>{bookmarkedIds.has(previewItem.id) ? 'Archived in Personal Dossier' : 'Save Artifact to Archive'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
