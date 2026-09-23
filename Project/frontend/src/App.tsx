import { useEffect, useState } from 'react'
import * as api from './api'
import { AdminCharacterModal } from './components/AdminCharacterModal'
import { AdminConsole } from './components/AdminConsole'
import { AdminContentModal } from './components/AdminContentModal'
import { AdminMediaModal } from './components/AdminMediaModal'
import { AuthModal } from './components/AuthModal'
import { CategoryPills } from './components/CategoryPills'
import { CharacterCard } from './components/CharacterCard'
import { CharacterDetailModal } from './components/CharacterDetailModal'
import { CharacterSpotlight } from './components/CharacterSpotlight'
import { ConceptHighlights } from './components/ConceptHighlights'
import { ContentCard } from './components/ContentCard'
import { ContentDetailModal } from './components/ContentDetailModal'
import { DashboardModal } from './components/DashboardModal'
import { FeaturedStory } from './components/FeaturedStory'
import { MediaCard } from './components/MediaCard'
import { MediaRail } from './components/MediaRail'
import { Navbar } from './components/Navbar'
import { NexusGateHero } from './components/NexusGateHero'
import { ProfileModal } from './components/ProfileModal'
import { SearchBar } from './components/SearchBar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CheckIcon, CompassIcon, MusicIcon, PlayIcon, UserIcon, VideoIcon } from './components/Icons'
import type {
  Bookmark,
  Category,
  Character,
  CharacterFormData,
  ContentFormData,
  ContentItem,
  MediaFormData,
  MediaItem,
} from './types'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Top navigation view: 'home' | 'explore' | 'characters' | 'media' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'characters' | 'media' | 'admin'>('home')

  // Global Categories
  const [categories, setCategories] = useState<Category[]>([])

  // Content (Chronicles & Articles) State
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const pageSize = 12

  // Characters State
  const [characters, setCharacters] = useState<Character[]>([])
  const [totalCharacters, setTotalCharacters] = useState<number>(0)
  const [charPage, setCharPage] = useState<number>(1)

  // Media Items State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [totalMedia, setTotalMedia] = useState<number>(0)
  const [mediaPage, setMediaPage] = useState<number>(1)
  const [mediaFormatFilter, setMediaFormatFilter] = useState<string>('All')

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // Status State
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [search, setSearch] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [contentType, setContentType] = useState<string>('All')
  const [genre, setGenre] = useState<string>('All')
  const [releaseYear, setReleaseYear] = useState<number | undefined>(undefined)
  const [minPopularity, setMinPopularity] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>('popular')

  // Modals State
  const [selectedDetailItem, setSelectedDetailItem] = useState<ContentItem | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [isAdminCharModalOpen, setIsAdminCharModalOpen] = useState<boolean>(false)
  const [isAdminMediaModalOpen, setIsAdminMediaModalOpen] = useState<boolean>(false)
  const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null)
  const [charToEdit, setCharToEdit] = useState<Character | null>(null)
  const [mediaToEdit, setMediaToEdit] = useState<MediaItem | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false)
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState<boolean>(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load Categories on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const cats = await api.getCategories()
        setCategories(cats)
      } catch (err: unknown) {
        console.error('Failed to load categories', err)
      }
    }
    initApp()
  }, [])

  // Load Bookmarks if authenticated
  const loadBookmarks = async () => {
    if (!user) {
      setBookmarks([])
      return
    }
    try {
      const bmarks = await api.getBookmarks()
      setBookmarks(bmarks)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [user])

  // Load Content
  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getContentList({
        search,
        categoryId: selectedCategoryId || undefined,
        contentType,
        genre,
        releaseYear,
        minPopularity,
        sortBy,
        page,
        pageSize,
      })
      setContentItems(data.items)
      setTotalCount(data.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error retrieving fandom catalog.')
    } finally {
      setLoading(false)
    }
  }

  // Load Characters
  const loadCharacters = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCharacters({
        search,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        page: charPage,
        pageSize,
      })
      setCharacters(data.items)
      setTotalCharacters(data.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error retrieving character dossiers.')
    } finally {
      setLoading(false)
    }
  }

  // Load Media
  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getMediaList({
        mediaType: mediaFormatFilter,
        categoryId: selectedCategoryId || undefined,
        search,
        page: mediaPage,
        pageSize,
      })
      setMediaItems(data.items)
      setTotalMedia(data.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error retrieving multimedia streams.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch relevant content based on active view
  useEffect(() => {
    if (currentView === 'home') {
      loadContent()
      loadCharacters()
      loadMedia()
    } else if (currentView === 'explore') {
      loadContent()
    } else if (currentView === 'characters') {
      loadCharacters()
    } else if (currentView === 'media') {
      loadMedia()
    }
  }, [currentView, search, selectedCategoryId, contentType, genre, releaseYear, minPopularity, sortBy, page, charPage, mediaPage, mediaFormatFilter])

  // Reset filters
  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategoryId(null)
    setContentType('All')
    setGenre('All')
    setReleaseYear(undefined)
    setMinPopularity(undefined)
    setSortBy('popular')
    setPage(1)
    setCharPage(1)
    setMediaPage(1)
  }

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Bookmarking helpers
  const isItemBookmarked = (type: string, id: number) => {
    return bookmarks.some((b) => b.itemType.toLowerCase() === type.toLowerCase() && b.itemId === id)
  }

  const handleToggleContentBookmark = async (item: ContentItem) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Content', item.id)
    if (already) {
      await api.removeBookmarkByItem('Content', item.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'content' && b.itemId === item.id)))
      showToast(`Removed "${item.title}" from saved items.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Content',
        itemId: item.id,
        itemTitle: item.title,
        itemSubtitle: item.fandomUniverse,
        itemImageUrl: item.thumbnailUrl,
      })
      setBookmarks((prev) => [added, ...prev])
      showToast(`Saved "${item.title}" to personal archive!`)
    }
  }

  const handleToggleCharacterBookmark = async (char: Character) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Character', char.id)
    if (already) {
      await api.removeBookmarkByItem('Character', char.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'character' && b.itemId === char.id)))
      showToast(`Removed "${char.name}" from saved items.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Character',
        itemId: char.id,
        itemTitle: char.name,
        itemSubtitle: char.roleTitle || char.fandomUniverse,
        itemImageUrl: char.avatarUrl,
      })
      setBookmarks((prev) => [added, ...prev])
      showToast(`Saved "${char.name}" to personal archive!`)
    }
  }

  const handleToggleMediaBookmark = async (m: MediaItem) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Media', m.id)
    if (already) {
      await api.removeBookmarkByItem('Media', m.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'media' && b.itemId === m.id)))
      showToast(`Removed "${m.title}" from saved items.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Media',
        itemId: m.id,
        itemTitle: m.title,
        itemSubtitle: `${m.mediaType} • ${m.fandomUniverse}`,
        itemImageUrl: m.thumbnailUrl,
      })
      setBookmarks((prev) => [added, ...prev])
      showToast(`Saved "${m.title}" to personal archive!`)
    }
  }

  const handleRemoveBookmark = async (id: number) => {
    await api.removeBookmark(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    showToast('Bookmark removed.')
  }

  const handleOpenBookmarkedItem = async (itemType: string, itemId: number) => {
    if (itemType.toLowerCase() === 'content') {
      try {
        const item = await api.getContentById(itemId)
        setSelectedDetailItem(item)
      } catch {
        showToast('Could not load saved item.')
      }
    } else if (itemType.toLowerCase() === 'character') {
      try {
        const char = await api.getCharacterById(itemId)
        setSelectedCharacter(char)
      } catch {
        showToast('Could not load character.')
      }
    } else {
      setCurrentView('media')
    }
  }

  // Admin Content Save & Delete
  const handleSaveContent = async (formData: ContentFormData, id?: number) => {
    if (id) {
      const updated = await api.updateContent(id, formData)
      showToast(`Updated "${updated.title}" successfully!`)
      if (selectedDetailItem && selectedDetailItem.id === id) {
        setSelectedDetailItem(updated)
      }
    } else {
      const created = await api.createContent(formData)
      showToast(`Published "${created.title}" successfully!`)
    }
    const cats = await api.getCategories()
    setCategories(cats)
    await loadContent()
  }

  const handleDeleteContent = async (id: number) => {
    await api.deleteContent(id)
    showToast(`Content item deleted from SQL Server.`)
    if (selectedDetailItem && selectedDetailItem.id === id) {
      setSelectedDetailItem(null)
    }
    const cats = await api.getCategories()
    setCategories(cats)
    await loadContent()
  }

  // Admin Character Save & Delete
  const handleSaveCharacter = async (formData: CharacterFormData, id?: number) => {
    if (id) {
      const updated = await api.updateCharacter(id, formData)
      showToast(`Updated "${updated.name}" character dossier!`)
      if (selectedCharacter && selectedCharacter.id === id) {
        setSelectedCharacter(updated)
      }
    } else {
      const created = await api.createCharacter(formData)
      showToast(`Published "${created.name}" dossier!`)
    }
    await loadCharacters()
  }

  const handleDeleteCharacter = async (id: number) => {
    await api.deleteCharacter(id)
    showToast(`Character deleted.`)
    if (selectedCharacter && selectedCharacter.id === id) {
      setSelectedCharacter(null)
    }
    await loadCharacters()
  }

  // Admin Media Save & Delete
  const handleSaveMedia = async (formData: MediaFormData, id?: number) => {
    if (id) {
      const updated = await api.updateMedia(id, formData)
      showToast(`Updated "${updated.title}" stream!`)
    } else {
      const created = await api.createMedia(formData)
      showToast(`Published "${created.title}" stream!`)
    }
    await loadMedia()
  }

  const handleDeleteMedia = async (id: number) => {
    await api.deleteMedia(id)
    showToast('Media stream deleted.')
    await loadMedia()
  }

  const handleRatingUpdated = (id: number, avg: number, count: number, userScore: number) => {
    setMediaItems((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, averageRating: avg, ratingsCount: count, userRating: userScore } : m
      )
    )
    showToast(`Rated ${userScore} stars! (Average: ${avg.toFixed(1)})`)
  }

  // Editorial Breakdown for Homepage:
  // 1 large featured story, 1 asymmetric character spotlight, horizontal media rail, compact remaining grid
  const featuredItem = contentItems.length > 0 ? contentItems[0] : null
  const spotlightCharacter = characters.length > 0 ? characters[0] : null
  const compactContentItems = contentItems.slice(1, 7)

  // Pagination for Explore section
  const totalExplorePages = Math.ceil(totalCount / pageSize)

  return (
    <div className={`portal-universe theme-${theme}`}>
      {/* Top Cinematic Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        bookmarkCount={bookmarks.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="nexus-toast">
          <span className="toast-icon"><CheckIcon size={14} /></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          1. HOMEPAGE VIEW: Concept Art Layout
          ===================================================================== */}
      {currentView === 'home' && (
        <main className="homepage-main">
          {/* Full-viewport Hero with Left Headline & Nexus Gate Visual Slot */}
          <NexusGateHero
            categories={categories}
            selectedCategorySlug={null}
            onSelectCategory={(slug) => {
              const cat = categories.find((c) => c.slug === slug)
              if (cat) setSelectedCategoryId(cat.id)
              setCurrentView('explore')
            }}
            onExploreClick={() => setCurrentView('explore')}
            onWatchPreviewClick={() => setCurrentView('media')}
            theme={theme}
          />

          {/* 3 Lower Highlights matching concept image */}
          <ConceptHighlights
            onExploreWorld={() => setCurrentView('explore')}
            onExploreCharacters={() => setCurrentView('characters')}
            onExploreMedia={() => setCurrentView('media')}
          />

          {/* Varied Editorial Layout Section */}
          <section className="editorial-showcase-section">
            <div className="section-divider-title">
              <h2>EDITORIAL SPOTLIGHTS</h2>
              <span className="divider-line" />
            </div>

            {/* 1. Large Featured Story */}
            {featuredItem && (
              <div className="editorial-story-container">
                <FeaturedStory
                  item={featuredItem}
                  onSelect={(item) => setSelectedDetailItem(item)}
                  onToggleBookmark={handleToggleContentBookmark}
                  isBookmarked={isItemBookmarked('Content', featuredItem.id)}
                />
              </div>
            )}

            {/* 2. Asymmetric Character Spotlight & Secondary Feature */}
            {spotlightCharacter && (
              <div className="editorial-spotlight-container">
                <CharacterSpotlight
                  character={spotlightCharacter}
                  onSelect={(char) => setSelectedCharacter(char)}
                  onToggleBookmark={handleToggleCharacterBookmark}
                  isBookmarked={isItemBookmarked('Character', spotlightCharacter.id)}
                />
              </div>
            )}

            {/* 3. Horizontal Media Rail */}
            {mediaItems.length > 0 && (
              <MediaRail
                items={mediaItems}
                onSelectMedia={() => setCurrentView('media')}
                onToggleBookmark={handleToggleMediaBookmark}
                isBookmarked={(id) => isItemBookmarked('Media', id)}
              />
            )}

            {/* 4. Compact Content Grid for remaining stories */}
            {compactContentItems.length > 0 && (
              <div className="compact-showcase-container">
                <div className="compact-header">
                  <h3>More Multiverse Chronicles</h3>
                  <button className="btn-view-all-explore" onClick={() => setCurrentView('explore')}>
                    Explore All Chronicles →
                  </button>
                </div>
                <div className="content-grid compact-grid">
                  {compactContentItems.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      onSelect={(sel) => setSelectedDetailItem(sel)}
                      onEdit={(edit) => {
                        setItemToEdit(edit)
                        setIsAdminModalOpen(true)
                      }}
                      isBookmarked={isItemBookmarked('Content', item.id)}
                      onToggleBookmark={handleToggleContentBookmark}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          2. DEDICATED EXPLORE VIEW (Moved filters and catalog)
          ===================================================================== */}
      {currentView === 'explore' && (
        <main className="explore-page-main">
          <div className="explore-hero-strip">
            <h1 className="explore-title">Multiverse Chronicle Explorer</h1>
            <p className="explore-subtitle">
              Filter by realm, genre, release timeline, and popularity rating.
            </p>
          </div>

          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id)
              setPage(1)
            }}
            totalCount={totalCount}
          />

          <SearchBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            contentType={contentType}
            onContentTypeChange={(t) => {
              setContentType(t)
              setPage(1)
            }}
            genre={genre}
            onGenreChange={(g) => {
              setGenre(g)
              setPage(1)
            }}
            releaseYear={releaseYear}
            onReleaseYearChange={(y) => {
              setReleaseYear(y)
              setPage(1)
            }}
            minPopularity={minPopularity}
            onMinPopularityChange={(p) => {
              setMinPopularity(p)
              setPage(1)
            }}
            sortBy={sortBy}
            onSortByChange={(s) => {
              setSortBy(s)
              setPage(1)
            }}
            resultsCount={totalCount}
            onResetFilters={handleResetFilters}
          />

          <section className="catalog-section">
            {loading && (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Synchronizing catalog entries...</p>
              </div>
            )}

            {error && !loading && (
              <div className="catalog-error-box">
                <div className="error-title">Database Query Interruption</div>
                <p className="error-desc">{error}</p>
                <button className="btn-retry" onClick={loadContent}>Retry Query</button>
              </div>
            )}

            {!loading && !error && contentItems.length === 0 && (
              <div className="empty-catalog-state">
                <div className="empty-icon"><CompassIcon size={36} /></div>
                <h3>No items discovered in this universe</h3>
                <p>Try broadening your query, adjusting the filters, or resetting to explore all items.</p>
                <button className="btn-reset-filters" onClick={handleResetFilters}>
                  Reset All Filters
                </button>
              </div>
            )}

            {!loading && !error && contentItems.length > 0 && (
              <div className="content-grid">
                {contentItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onSelect={(sel) => setSelectedDetailItem(sel)}
                    onEdit={(edit) => {
                      setItemToEdit(edit)
                      setIsAdminModalOpen(true)
                    }}
                    isBookmarked={isItemBookmarked('Content', item.id)}
                    onToggleBookmark={handleToggleContentBookmark}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalExplorePages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-page-nav"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>
                <div className="page-indicator">
                  Page <strong>{page}</strong> of <strong>{totalExplorePages}</strong>
                </div>
                <button
                  className="btn-page-nav"
                  disabled={page >= totalExplorePages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          3. CHARACTERS VIEW
          ===================================================================== */}
      {currentView === 'characters' && (
        <main className="characters-page-main">
          <div className="explore-hero-strip">
            <h1 className="explore-title">Character Dossiers & Archives</h1>
            <p className="explore-subtitle">
              Detailed records of legends, sorcerers, anti-heroes, and iconic figures across 8 universes.
            </p>
          </div>

          <section className="catalog-section">
            {loading ? (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Loading character profiles...</p>
              </div>
            ) : characters.length > 0 ? (
              <div className="characters-grid">
                {characters.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    onSelect={(sel) => setSelectedCharacter(sel)}
                    onEdit={(edit) => {
                      setCharToEdit(edit)
                      setIsAdminCharModalOpen(true)
                    }}
                    isBookmarked={isItemBookmarked('Character', char.id)}
                    onToggleBookmark={handleToggleCharacterBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-catalog-state">
                <div className="empty-icon"><UserIcon size={36} /></div>
                <h3>No character profiles found</h3>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          4. MULTIMEDIA VIEW
          ===================================================================== */}
      {currentView === 'media' && (
        <main className="media-page-main">
          <div className="explore-hero-strip">
            <h1 className="explore-title">Audiovisual Multiverse Streams</h1>
            <p className="explore-subtitle">
              Embedded cinema trailers, gameplay teasers, and original soundtrack streams.
            </p>
          </div>

          <div className="media-format-selector" style={{ maxWidth: '1280px', margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'All' ? 'active' : ''}`}
              onClick={() => setMediaFormatFilter('All')}
            >
              All Streams
            </button>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'Video' ? 'active' : ''}`}
              onClick={() => setMediaFormatFilter('Video')}
            >
              <PlayIcon size={12} fill="currentColor" />
              <span>Videos & Trailers</span>
            </button>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'Audio' ? 'active' : ''}`}
              onClick={() => setMediaFormatFilter('Audio')}
            >
              <MusicIcon size={13} />
              <span>Audio & Soundtracks</span>
            </button>
          </div>

          <section className="catalog-section">
            {loading ? (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Loading media streams...</p>
              </div>
            ) : mediaItems.length > 0 ? (
              <div className="media-grid">
                {mediaItems.map((m) => (
                  <MediaCard
                    key={m.id}
                    item={m}
                    onEdit={(edit) => {
                      setMediaToEdit(edit)
                      setIsAdminMediaModalOpen(true)
                    }}
                    onDelete={handleDeleteMedia}
                    isBookmarked={isItemBookmarked('Media', m.id)}
                    onToggleBookmark={handleToggleMediaBookmark}
                    onRatingUpdated={handleRatingUpdated}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-catalog-state">
                <div className="empty-icon"><VideoIcon size={36} /></div>
                <h3>No media streams available</h3>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          5. ADMIN CONSOLE VIEW (Dedicated Admin Center)
          ===================================================================== */}
      {currentView === 'admin' && isAdmin && (
        <main className="admin-page-main">
          <AdminConsole
            onOpenCreateContent={() => {
              setItemToEdit(null)
              setIsAdminModalOpen(true)
            }}
            onOpenCreateCharacter={() => {
              setCharToEdit(null)
              setIsAdminCharModalOpen(true)
            }}
            onOpenCreateMedia={() => {
              setMediaToEdit(null)
              setIsAdminMediaModalOpen(true)
            }}
            totalContent={totalCount}
            totalCharacters={totalCharacters}
            totalMedia={totalMedia}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-meta">
            <span className="footer-brand">FAN HUB PLUS /</span>
            <span className="footer-sub">Eight Worlds. One Universe.</span>
          </div>
          <div className="footer-links-row">
            <button onClick={() => setCurrentView('home')}>Home</button>
            <button onClick={() => setCurrentView('explore')}>Explore</button>
            <button onClick={() => setCurrentView('characters')}>Characters</button>
            <button onClick={() => setCurrentView('media')}>Media</button>
            {isAdmin && <button onClick={() => setCurrentView('admin')}>Admin Console</button>}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContentDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(target) => {
          setItemToEdit(target)
          setIsAdminModalOpen(true)
        }}
      />

      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onEdit={(target) => {
          setCharToEdit(target)
          setIsAdminCharModalOpen(true)
        }}
        isAdmin={isAdmin}
      />

      <AdminContentModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        categories={categories}
        editItem={itemToEdit}
      />

      <AdminCharacterModal
        isOpen={isAdminCharModalOpen}
        onClose={() => setIsAdminCharModalOpen(false)}
        onSave={handleSaveCharacter}
        onDelete={handleDeleteCharacter}
        categories={categories}
        editCharacter={charToEdit}
      />

      <AdminMediaModal
        isOpen={isAdminMediaModalOpen}
        onClose={() => setIsAdminMediaModalOpen(false)}
        onSave={handleSaveMedia}
        categories={categories}
        editItem={mediaToEdit}
      />

      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onOpenItem={handleOpenBookmarkedItem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
