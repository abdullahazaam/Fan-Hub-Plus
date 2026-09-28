import React, { useEffect, useState } from 'react'
import type { MerchandiseItem } from '../types'
import { getMerchandiseById } from '../api'
import { StarIcon } from './Icons'
import './MerchandiseDetailPage.css'

export const MERCH_IMAGE_MAP: Record<string, string> = {
  'arasaka': '/merchandise/arasaka_relic.jpg',
  'relic': '/merchandise/arasaka_relic.jpg',
  'kamado tanjiro': '/merchandise/tanjiro_sword.jpg',
  'nichirin': '/merchandise/tanjiro_sword.jpg',
  'malenia': '/merchandise/malenia_statue.jpg',
  'infinity gauntlet': '/merchandise/infinity_gauntlet.jpg',
  'nanotech': '/merchandise/infinity_gauntlet.jpg',
  'hellfire': '/merchandise/hellfire_bomber.jpg',
  'bunnies': '/merchandise/bunnies_lightstick.jpg',
  'lightstick': '/merchandise/bunnies_lightstick.jpg',
  'dark knight': '/merchandise/batman_cowl.jpg',
  'cowl': '/merchandise/batman_cowl.jpg',
  'dragon slayer': '/merchandise/dragon_slayer.jpg',
  'berserk': '/merchandise/dragon_slayer.jpg',
  'hud visor': '/merchandise/hud_visor.jpg',
  'visor': '/merchandise/hud_visor.jpg',
}

export function resolveMerchImage(item: { name: string; imageUrl?: string }): string {
  const key = item.name.toLowerCase()
  for (const [pattern, path] of Object.entries(MERCH_IMAGE_MAP)) {
    if (key.includes(pattern)) return path
  }
  return item.imageUrl || '/merchandise/arasaka_relic.jpg'
}

interface MerchandiseDetailPageProps {
  id: string
  initialItem: MerchandiseItem | null
  onBack: () => void
  isBookmarked: (id: number) => boolean
  onToggleBookmark: (item: MerchandiseItem) => void
  onOpenAuth: () => void
  isAuthenticated: boolean
}

export const MerchandiseDetailPage: React.FC<MerchandiseDetailPageProps> = ({
  id,
  initialItem,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onOpenAuth,
  isAuthenticated,
}) => {
  const [item, setItem] = useState<MerchandiseItem | null>(() => {
    if (initialItem && initialItem.id === Number(id)) {
      return { ...initialItem, imageUrl: resolveMerchImage(initialItem) }
    }
    const hist = window.history.state?.merchandise
    if (hist && hist.id === Number(id)) {
      return { ...hist, imageUrl: resolveMerchImage(hist) }
    }
    return null
  })
  const [loading, setLoading] = useState<boolean>(!item)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (initialItem && initialItem.id === Number(id)) {
      setItem({ ...initialItem, imageUrl: resolveMerchImage(initialItem) })
      setLoading(false)
    }
  }, [initialItem, id])

  useEffect(() => {
    let active = true
    const numId = Number(id)
    if (!numId || isNaN(numId)) {
      setError('Invalid merchandise artifact identifier.')
      setLoading(false)
      return
    }

    if (!item || item.id !== numId) {
      setLoading(true)
      setError('')
      getMerchandiseById(numId)
        .then((fetched) => {
          if (active) {
            setItem({ ...fetched, imageUrl: resolveMerchImage(fetched) })
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setError('This merchandise artifact could not be found. Please return to the Merchandise Vault and select an available item.')
            setLoading(false)
          }
        })
    }

    return () => {
      active = false
    }
  }, [id])

  const backBtn = (
    <button className="merch-page-back" onClick={onBack} type="button">
      ← Back to Merchandise
    </button>
  )

  if (loading && !item) {
    return (
      <main className="merchandise-detail-page">
        {backBtn}
        <section className="merch-detail-panel" role="status">
          <h1>Loading artifact…</h1>
          <p>Retrieving technical dossier from the Merchandise Vault.</p>
        </section>
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="merchandise-detail-page">
        {backBtn}
        <section className="merch-detail-panel" role="status">
          <h1>Artifact Unavailable</h1>
          <p>{error || 'This artifact could not be retrieved.'}</p>
        </section>
      </main>
    )
  }

  const bookmarked = isBookmarked(item.id)

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      onOpenAuth()
    } else {
      onToggleBookmark(item)
    }
  }

  return (
    <main className="merchandise-detail-page">
      {backBtn}

      <div className="merch-detail-grid">
        {/* Left Column: Visual Showcase */}
        <section className="merch-visual-showcase merch-detail-panel">
          <div className="merch-image-wrapper">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="merch-primary-image"
              onError={(e) => {
                const fallback = resolveMerchImage(item)
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback
                }
              }}
            />
            <div className="merch-image-badge-row">
              <span className="merch-tag-badge">{item.tag}</span>
              <span className={`merch-stock-badge stock-${item.stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.stockStatus}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Technical Dossier & Identity */}
        <section className="merch-dossier-column">
          <header className="merch-detail-panel merch-identity-panel">
            <div className="merch-category-crumbs">
              <span>{item.categoryName}</span>
              <span className="merch-sep">•</span>
              <span>{item.fandomUniverse}</span>
            </div>

            <h1 className="merch-detail-title">{item.name}</h1>

            <div className="merch-price-bar">
              <span className="merch-price-amount">
                ${item.price.toFixed(2)}
              </span>
              <span className="merch-price-currency">{item.currency}</span>
              <span className="merch-status-pill">{item.stockStatus}</span>
            </div>

            <div className="merch-actions-bar">
              <button
                type="button"
                className={`merch-save-btn ${bookmarked ? 'saved' : ''}`}
                onClick={handleBookmarkClick}
                aria-pressed={bookmarked}
              >
                <StarIcon size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                <span>{bookmarked ? 'Saved in Personal Archive' : 'Save Artifact to Archive'}</span>
              </button>
            </div>
          </header>

          <article className="merch-detail-panel merch-spec-panel">
            <h2>Artifact Specification</h2>
            <div className="merch-description-prose">
              <p>{item.description}</p>
            </div>

            <div className="merch-specs-table">
              <div className="merch-spec-row">
                <span className="merch-spec-label">Category</span>
                <span className="merch-spec-value">{item.categoryName}</span>
              </div>
              <div className="merch-spec-row">
                <span className="merch-spec-label">Fandom Universe</span>
                <span className="merch-spec-value">{item.fandomUniverse}</span>
              </div>
              <div className="merch-spec-row">
                <span className="merch-spec-label">Edition Tag</span>
                <span className="merch-spec-value">{item.tag}</span>
              </div>
              <div className="merch-spec-row">
                <span className="merch-spec-label">Availability</span>
                <span className="merch-spec-value">{item.stockStatus}</span>
              </div>
              <div className="merch-spec-row">
                <span className="merch-spec-label">Currency Unit</span>
                <span className="merch-spec-value">{item.currency}</span>
              </div>
            </div>

            <div className="merch-license-notice">
              <span className="merch-license-dot" />
              <span>Official Licensed Manufacturer Artifact • Exhibition Showcase</span>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
