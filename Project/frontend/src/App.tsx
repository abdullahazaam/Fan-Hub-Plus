import { useEffect, useState } from 'react'
import * as api from './api'
import { AdminCharacterModal } from './components/AdminCharacterModal'
import { AdminContentModal } from './components/AdminContentModal'
import { AdminMediaModal } from './components/AdminMediaModal'
import { AuthModal } from './components/AuthModal'
import { CategoryPills } from './components/CategoryPills'
import { CharacterCard } from './components/CharacterCard'
import { CharacterDetailModal } from './components/CharacterDetailModal'
import { ContentCard } from './components/ContentCard'
import { ContentDetailModal } from './components/ContentDetailModal'
import { DashboardModal } from './components/DashboardModal'
import { MediaCard } from './components/MediaCard'
import { Navbar } from './components/Navbar'
import { ProfileModal } from './components/ProfileModal'
import { SearchBar } from './components/SearchBar'
import { AuthProvider, useAuth } from './context/AuthContext'
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

  // System Health
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'loading'>('loading')
  const [dbStatus, setDbStatus] = useState<string>('SQL Server')

  // Top Section Navigation Tab: 'catalog' | 'characters' | 'media'
  const [activeTab, setActiveTab] = useState<'catalog' | 'characters' | 'media'>('catalog')

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

  // Shared Filters
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

  // Load Initial Health & Categories
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.getHealth()
        setApiStatus(health.status.toLowerCase() === 'healthy' ? 'online' : 'offline')
        if (health.database) setDbStatus(health.database)
      } catch {
        setApiStatus('offline')
      }

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

  // Load Content (Articles / Chronicles)
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

  // Load Media Items
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

  // Switch between tabs triggers respective load
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadContent()
    } else if (activeTab === 'characters') {
      loadCharacters()
    } else if (activeTab === 'media') {
      loadMedia()
    }
  }, [activeTab, search, selectedCategoryId, contentType, genre, releaseYear, minPopularity, sortBy, page, charPage, mediaPage, mediaFormatFilter])

  // Reset all filters
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
      showToast(`Removed "${item.title}" from saved archive.`)
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
      showToast(`Removed "${char.name}" from saved archive.`)
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
      showToast(`Removed "${m.title}" from saved archive.`)
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
      setActiveTab('media')
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

  // Active items count for search bar
  const currentCount =
    activeTab === 'catalog' ? totalCount : activeTab === 'characters' ? totalCharacters : totalMedia

  // Pagination helper
  const totalPages = Math.ceil(
    (activeTab === 'catalog'
      ? totalCount
      : activeTab === 'characters'
      ? totalCharacters
      : totalMedia) / pageSize
  )
  const currentPage = activeTab === 'catalog' ? page : activeTab === 'characters' ? charPage : mediaPage
  const setCurrentPage = (p: number) => {
    if (activeTab === 'catalog') setPage(p)
    else if (activeTab === 'characters') setCharPage(p)
    else setMediaPage(p)
  }

  return (
    <div className="portal-universe">
      <div className="astral-ambient-bg" aria-hidden="true" />

      {/* Top Navbar */}
      <Navbar
        apiStatus={apiStatus}
        dbStatus={dbStatus}
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t)
          setPage(1)
          setCharPage(1)
          setMediaPage(1)
        }}
        bookmarkCount={bookmarks.length}
        onOpenCreate={() => {
          if (activeTab === 'catalog') {
            setItemToEdit(null)
            setIsAdminModalOpen(true)
          } else if (activeTab === 'characters') {
            setCharToEdit(null)
            setIsAdminCharModalOpen(true)
          } else {
            setMediaToEdit(null)
            setIsAdminMediaModalOpen(true)
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="nexus-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="portal-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-spark">✦</span>
            <span>Obsidian & Crimson Nexus • 8 Fandom Universes</span>
          </div>
          <h1 className="hero-headline">
            Explore The <span className="gradient-text">Fandom Multiverse</span>
          </h1>
          <p className="hero-subtext">
            Curated chronicles, character dossiers, high-definition trailers, and original soundtrack streams
            spanning Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga, and Cosplay.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="portal-main-container">
        {/* Category Navigation Strip */}
        <CategoryPills
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id)
            setPage(1)
            setCharPage(1)
            setMediaPage(1)
          }}
          totalCount={currentCount}
        />

        {/* Search, Filter, & Sort Bar */}
        <SearchBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
            setCharPage(1)
            setMediaPage(1)
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
            setCharPage(1)
          }}
          resultsCount={currentCount}
          onResetFilters={handleResetFilters}
        />

        {/* Section View Router */}
        <section className="catalog-section">
          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="astral-spinner" />
              <p className="loading-text">Synchronizing with SQL Server Database...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="catalog-error-box">
              <div className="error-title">Database Query Interruption</div>
              <p className="error-desc">{error}</p>
              <button
                className="btn-retry"
                onClick={() => {
                  if (activeTab === 'catalog') loadContent()
                  else if (activeTab === 'characters') loadCharacters()
                  else loadMedia()
                }}
              >
                Retry Query
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && currentCount === 0 && (
            <div className="empty-catalog-state">
              <div className="empty-icon">🪐</div>
              <h3>No items discovered in this universe</h3>
              <p>Try broadening your query, adjusting the filters, or resetting to explore all items.</p>
              <button className="btn-reset-filters" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          )}

          {/* 1. ARTICLES & CHRONICLES VIEW */}
          {!loading && !error && activeTab === 'catalog' && contentItems.length > 0 && (
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

          {/* 2. CHARACTER DOSSIERS VIEW */}
          {!loading && !error && activeTab === 'characters' && characters.length > 0 && (
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
          )}

          {/* 3. MULTIMEDIA & STREAMS VIEW */}
          {!loading && !error && activeTab === 'media' && (
            <div className="media-section-container">
              <div className="media-format-selector">
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
                  ▶ Videos & Trailers
                </button>
                <button
                  className={`btn-media-filter ${mediaFormatFilter === 'Audio' ? 'active' : ''}`}
                  onClick={() => setMediaFormatFilter('Audio')}
                >
                  ♫ Audio & Soundtracks
                </button>
              </div>

              {mediaItems.length > 0 ? (
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
                  <div className="empty-icon">🎬</div>
                  <h3>No media streams found</h3>
                  <p>Try switching the media filter or selecting another category.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="btn-page-nav"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>
              <div className="page-indicator">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>
              <button
                className="btn-page-nav"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-meta">
            <span className="footer-brand">Fan Hub Plus</span>
            <span className="footer-sub">NN-Zynex End-to-End Web Solutions</span>
          </div>
          <div className="footer-status">
            <span>Powered by ASP.NET Core Web API, EF Core & SQL Server</span>
          </div>
        </div>
      </footer>

      {/* Content Detail Modal */}
      <ContentDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(target) => {
          setItemToEdit(target)
          setIsAdminModalOpen(true)
        }}
      />

      {/* Character Detail Modal */}
      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onEdit={(target) => {
          setCharToEdit(target)
          setIsAdminCharModalOpen(true)
        }}
        isAdmin={isAdmin}
      />

      {/* Admin Content Modal */}
      <AdminContentModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        categories={categories}
        editItem={itemToEdit}
      />

      {/* Admin Character Modal */}
      <AdminCharacterModal
        isOpen={isAdminCharModalOpen}
        onClose={() => setIsAdminCharModalOpen(false)}
        onSave={handleSaveCharacter}
        onDelete={handleDeleteCharacter}
        categories={categories}
        editCharacter={charToEdit}
      />

      {/* Admin Media Modal */}
      <AdminMediaModal
        isOpen={isAdminMediaModalOpen}
        onClose={() => setIsAdminMediaModalOpen(false)}
        onSave={handleSaveMedia}
        categories={categories}
        editItem={mediaToEdit}
      />

      {/* Personal Dashboard Modal */}
      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onOpenItem={handleOpenBookmarkedItem}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Profile Modal */}
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
