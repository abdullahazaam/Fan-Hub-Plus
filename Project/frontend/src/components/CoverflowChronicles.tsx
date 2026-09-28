import React, { useState, useRef } from 'react'
import type { ContentItem } from '../types'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from './Icons'
import './CoverflowChronicles.css'

// Inline speech bubble icon for comments/stats
const ChatIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

export interface CoverflowItem {
  id: string
  category: string
  title: string
  description: string
  image: string
  date: string
  stats: string
  commentsCount: number
  accentColor: string
  linkSlug?: string
}

const CHRONICLES_DATA: CoverflowItem[] = [
  {
    id: 'witcher-4',
    category: 'GAMING',
    title: 'The Witcher 4: A New Saga Begins',
    description: 'Upcoming releases, story details, and world analysis across the northern realms.',
    image: '/chronicles/witcher4.jpg',
    date: 'Sep 2026',
    stats: '1.2K',
    commentsCount: 1240,
    accentColor: '#e50914',
  },
  {
    id: 'demon-slayer',
    category: 'ANIME',
    title: 'Demon Slayer: The Final Arc',
    description: 'Complete storyline breakdown, key battles and character analysis of the Infinity Castle.',
    image: '/chronicles/demonslayer.jpg',
    date: 'Sep 2026',
    stats: '2.4K',
    commentsCount: 2410,
    accentColor: '#ff3344',
  },
  {
    id: 'aot-legacy',
    category: 'MOVIES',
    title: 'Attack on Titan: The Complete Legacy',
    description: 'From humanity\'s fight for survival to an ending that changed anime forever.',
    image: '/chronicles/aot_legacy.jpg',
    date: 'Aug 2026',
    stats: '3.8K',
    commentsCount: 3820,
    accentColor: '#e50914',
  },
  {
    id: 'blackpink-phenomenon',
    category: 'K-POP',
    title: 'BLACKPINK: Global Phenomenon',
    description: 'Their rise, impact, and the future of K-Pop\'s biggest record-breaking group.',
    image: '/chronicles/blackpink.jpg',
    date: 'Aug 2026',
    stats: '1.9K',
    commentsCount: 1950,
    accentColor: '#ec4899',
  },
  {
    id: 'marvel-secret-wars',
    category: 'COMICS',
    title: 'Marvel Multiverse: Secret Wars',
    description: 'Everything we know so far about the next dimensional collision multiverse event.',
    image: '/chronicles/secretwars.jpg',
    date: 'Jul 2026',
    stats: '1.1K',
    commentsCount: 1180,
    accentColor: '#f59e0b',
  },
]

interface CoverflowChroniclesProps {
  contentItems?: ContentItem[]
  onSelectChronicle: (item: ContentItem) => void
  onExploreAll: () => void
  isBookmarked?: (id: number) => boolean
  onToggleBookmark?: (item: ContentItem) => void
}

export const CoverflowChronicles: React.FC<CoverflowChroniclesProps> = ({
  contentItems = [],
  onSelectChronicle,
  onExploreAll,
}) => {
  // Center card (index 2: Attack on Titan) is large & dominant by default
  const [activeIndex, setActiveIndex] = useState<number>(2)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const count = CHRONICLES_DATA.length

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % count)
  }

  // Touch and mouse drag handlers for fluid swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return
    const diff = dragStartX - e.changedTouches[0].clientX
    if (diff > 45) {
      handleNext()
    } else if (diff < -45) {
      handlePrev()
    }
    setDragStartX(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null) return
    const diff = dragStartX - e.clientX
    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
    setDragStartX(null)
  }

  const resolveAndOpenItem = (chronicle: CoverflowItem) => {
    // Find matching real item in DB contentItems if available
    const match = contentItems.find(
      (c) =>
        c.title.toLowerCase().includes(chronicle.title.toLowerCase()) ||
        chronicle.title.toLowerCase().includes(c.title.toLowerCase()) ||
        (chronicle.id === 'witcher-4' && c.title.toLowerCase().includes('witcher')) ||
        (chronicle.id === 'demon-slayer' && (c.title.toLowerCase().includes('demon') || c.categoryName.toLowerCase().includes('anime'))) ||
        (chronicle.id === 'aot-legacy' && (c.title.toLowerCase().includes('titan') || c.categoryName.toLowerCase().includes('movies'))) ||
        (chronicle.id === 'blackpink-phenomenon' && (c.title.toLowerCase().includes('blackpink') || c.categoryName.toLowerCase().includes('k-pop'))) ||
        (chronicle.id === 'marvel-secret-wars' && (c.title.toLowerCase().includes('secret wars') || c.categoryName.toLowerCase().includes('comics')))
    )

    if (match) {
      onSelectChronicle(match)
    } else {
      // Complete synthetic ContentItem
      const syntheticItem: ContentItem = {
        id: -300 - CHRONICLES_DATA.findIndex((c) => c.id === chronicle.id),
        categoryId: 1,
        categoryName: chronicle.category,
        categorySlug: chronicle.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: chronicle.title,
        fandomUniverse: chronicle.category,
        contentType: 'Article',
        description: chronicle.description,
        contentText: chronicle.description,
        thumbnailUrl: chronicle.image,
        mediaUrl: chronicle.image,
        author: 'Multiverse Editorial Archive',
        tags: `${chronicle.category}, Chronicles, Dossier`,
        popularityScore: 98,
        releaseDate: chronicle.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onSelectChronicle(syntheticItem)
    }
  }

  return (
    <section className="coverflow-chronicles-section" aria-label="More Multiverse Chronicles Coverflow">
      {/* Section Header with Split Explore Link & Breadcrumbs */}
      <div className="coverflow-header home-section-header home-section-header-split">
        <div>
          <div className="home-section-eyebrow">
            <span className="home-eyebrow-pip" />
            <span>DISPATCH ARCHIVE</span>
          </div>
          <h2 className="home-section-title">More Multiverse Chronicles</h2>
          <p className="home-section-desc">Comprehensive reports, field dispatches and community archives from across the fandom realms.</p>
        </div>
        <button
          type="button"
          className="coverflow-explore-btn"
          onClick={onExploreAll}
          aria-label="Explore All Chronicles"
        >
          <span>Explore All Chronicles</span>
          <ArrowRightIcon size={14} />
        </button>
      </div>

      {/* Main Coverflow Interactive Carousel Stage */}
      <div
        className="coverflow-stage"
        ref={trackRef}
        role="region"
        aria-label="Multiverse Chronicles Coverflow Carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            handlePrev()
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            handleNext()
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Left Circular Arrow Navigation Button */}
        <button
          type="button"
          className="coverflow-nav-btn nav-btn-left"
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
          aria-label="Previous chronicle"
        >
          <ChevronLeftIcon size={20} />
        </button>

        {/* 5-Card Coverflow Row */}
        <div className="coverflow-cards-track">
          {CHRONICLES_DATA.map((item, index) => {
            // Calculate distance relative to active index: -2, -1, 0, 1, 2
            let diff = index - activeIndex
            if (diff > count / 2) diff -= count
            if (diff < -count / 2) diff += count

            const isCenter = diff === 0
            const isMidLeft = diff === -1
            const isMidRight = diff === 1
            const isFarLeft = diff <= -2
            const isFarRight = diff >= 2

            let positionClass = 'is-center'
            if (isMidLeft) positionClass = 'is-mid-left'
            else if (isMidRight) positionClass = 'is-mid-right'
            else if (isFarLeft) positionClass = 'is-far-left'
            else if (isFarRight) positionClass = 'is-far-right'

            return (
              <article
                key={item.id}
                className={`coverflow-card ${positionClass} ${isCenter ? 'card-active' : 'card-side'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isCenter) {
                    setActiveIndex(index)
                  } else {
                    resolveAndOpenItem(item)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-selected={isCenter}
                aria-label={`${item.title} - ${item.category}. ${isCenter ? 'Selected. Click to read chronicle.' : 'Click to center.'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!isCenter) {
                      setActiveIndex(index)
                    } else {
                      resolveAndOpenItem(item)
                    }
                  }
                }}
              >
                {/* Full-bleed Key Artwork */}
                <div className="coverflow-media-stage">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="coverflow-bg-img"
                    loading="lazy"
                  />
                  <div className="coverflow-gradient-scrim" />
                </div>

                {/* Category Pill Tag (Top-Left) */}
                <div className="coverflow-category-tag">
                  <span>{item.category}</span>
                </div>

                {/* Bottom Content & Metadata */}
                <div className="coverflow-info-pane">
                  <h3 className="coverflow-card-title">{item.title}</h3>
                  <p className="coverflow-card-desc">{item.description}</p>

                  <div className="coverflow-meta-bar">
                    <div className="coverflow-meta-left">
                      <span className="meta-date">
                        <CalendarIcon size={12} />
                        <span>{item.date}</span>
                      </span>
                      <span className="meta-comments">
                        <ChatIcon size={12} />
                        <span>{item.stats}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`coverflow-arrow-cta ${isCenter ? 'cta-active' : 'cta-side'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isCenter) {
                          setActiveIndex(index)
                        } else {
                          resolveAndOpenItem(item)
                        }
                      }}
                      tabIndex={isCenter ? 0 : -1}
                      aria-label={`Open ${item.title}`}
                    >
                      <ArrowRightIcon size={isCenter ? 16 : 14} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Right Circular Arrow Navigation Button */}
        <button
          type="button"
          className="coverflow-nav-btn nav-btn-right"
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          aria-label="Next chronicle"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      {/* Pagination Indicator Pills (Bottom Center) */}
      <div className="coverflow-pagination" aria-label="Pagination indicators">
        {CHRONICLES_DATA.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`coverflow-indicator-pill ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}: ${item.title}`}
          />
        ))}
      </div>
    </section>
  )
}
