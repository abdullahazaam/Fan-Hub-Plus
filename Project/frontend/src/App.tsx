import { useEffect, useState } from 'react'
import * as api from './api'
import { AdminContentModal } from './components/AdminContentModal'
import { CategoryPills } from './components/CategoryPills'
import { ContentCard } from './components/ContentCard'
import { ContentDetailModal } from './components/ContentDetailModal'
import { Navbar } from './components/Navbar'
import { SearchBar } from './components/SearchBar'
import type { Category, ContentFormData, ContentItem } from './types'
import './App.css'

export function App() {
  // System Health
  const [apiStatus, setApiStatus] = useState<string>('Connecting')
  const [dbStatus, setDbStatus] = useState<string>('SQL Server')

  // Categories & Content State
  const [categories, setCategories] = useState<Category[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [contentType, setContentType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('popular')

  // Modals
  const [selectedDetailItem, setSelectedDetailItem] = useState<ContentItem | null>(null)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Load Initial Health & Categories
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.getHealth()
        setApiStatus(health.status)
        if (health.database) setDbStatus(health.database)
      } catch {
        setApiStatus('Offline')
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

  // Load Content on filter changes
  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getContentList({
        search,
        categoryId: selectedCategoryId || undefined,
        contentType,
        sortBy,
        page: 1,
        pageSize: 24,
      })
      setContentItems(data.items)
      setTotalCount(data.totalCount)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error retrieving fandom catalog.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [search, selectedCategoryId, contentType, sortBy])

  // Admin Actions
  const handleOpenCreate = () => {
    setItemToEdit(null)
    setIsAdminModalOpen(true)
  }

  const handleOpenEdit = (item: ContentItem) => {
    setItemToEdit(item)
    setIsAdminModalOpen(true)
  }

  const handleSaveContent = async (formData: ContentFormData, id?: number) => {
    if (id) {
      const updated = await api.updateContent(id, formData)
      showToast(`Updated "${updated.title}" successfully in SQL Server!`)
      if (selectedDetailItem && selectedDetailItem.id === id) {
        setSelectedDetailItem(updated)
      }
    } else {
      const created = await api.createContent(formData)
      showToast(`Created "${created.title}" successfully in SQL Server!`)
    }

    // Refresh categories & listings
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

  return (
    <div className="portal-universe">
      <div className="astral-ambient-bg" aria-hidden="true" />

      {/* Top Navbar */}
      <Navbar
        apiStatus={apiStatus}
        dbStatus={dbStatus}
        onOpenCreate={handleOpenCreate}
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
            <span>Unifying 8 Fandom Universes Under One Roof</span>
          </div>
          <h1 className="hero-headline">
            Explore The <span className="gradient-text">Fandom Multiverse</span>
          </h1>
          <p className="hero-subtext">
            Immerse yourself in curated chronicles, character breakdowns, and multimedia archives
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
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          totalCount={totalCount}
        />

        {/* Search, Filter, & Sort Bar */}
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          contentType={contentType}
          onContentTypeChange={setContentType}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          resultsCount={totalCount}
        />

        {/* Catalog Section */}
        <section className="catalog-section">
          {loading && (
            <div className="loading-container">
              <div className="astral-spinner" />
              <p className="loading-text">Synchronizing with SQL Server Database...</p>
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
              <div className="empty-icon">🪐</div>
              <h3>No items discovered in this universe</h3>
              <p>Try broadening your search term or selecting "All Universes".</p>
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSearch('')
                  setSelectedCategoryId(null)
                  setContentType('All')
                }}
              >
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
                  onSelect={(selected) => setSelectedDetailItem(selected)}
                  onEdit={(editTarget) => handleOpenEdit(editTarget)}
                />
              ))}
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

      {/* Detail Modal */}
      <ContentDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(target) => handleOpenEdit(target)}
      />

      {/* Admin Create/Edit Modal */}
      <AdminContentModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        categories={categories}
        editItem={itemToEdit}
      />
    </div>
  )
}

export default App
