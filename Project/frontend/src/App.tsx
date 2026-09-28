import { RealmDiscovery } from './components/RealmDiscovery'
import { characterPageRoster } from './components/characterPageRoster'
import { ChroniclesEditorialGrid } from './components/ChroniclesEditorialGrid'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as api from './api'
import { AdminCharacterModal } from './components/AdminCharacterModal'
import { AdminConsole } from './components/AdminConsole'
import { AdminContentModal } from './components/AdminContentModal'
import { AdminMediaModal } from './components/AdminMediaModal'
import { AuthModal } from './components/AuthModal'
import { Breadcrumbs } from './components/Breadcrumbs'
import { CategoryPills } from './components/CategoryPills'
import { CharactersDossierGrid } from './components/CharactersDossierGrid'
import { CharacterDetailPage } from './components/CharacterDetailPage'
import { ExpandedLegendsCards } from './components/ExpandedLegendsCards'
import { ConceptHighlights } from './components/ConceptHighlights'
import { CoverflowChronicles } from './components/CoverflowChronicles'
import { ChronicleDetailPage } from './components/ChronicleDetailPage'
import { DashboardPage } from './components/DashboardPage'
import { EventsDirectory } from './components/EventsDirectory'
import { FanSubmissionPage } from './components/FanSubmissionPage'
import { FeaturedStory } from './components/FeaturedStory'
import { FeedbackPage } from './components/FeedbackPage'
import { HomepageExperience } from './components/HomepageExperience'
import { CheckIcon, CompassIcon, MusicIcon, PlayIcon, UserIcon, VideoIcon } from './components/Icons'
import { MediaCard } from './components/MediaCard'
import { MediaRail } from './components/MediaRail'
import { MediaDetailPage } from './components/MediaDetailPage'
import { MerchandiseShowcase } from './components/MerchandiseShowcase'
import { MerchandiseDetailPage } from './components/MerchandiseDetailPage'
import { Navbar } from './components/Navbar'
import { NexusGateHero } from './components/NexusGateHero'
import { ProfilePage } from './components/ProfilePage'
import { SearchBar } from './components/SearchBar'
import { SiteAtmosphere } from './components/SiteAtmosphere'
import { SitemapPage } from './components/SitemapPage'
import { UpcomingReleases } from './components/UpcomingReleases'
import { AuthProvider, useAuth } from './context/AuthContext'
import type {
  Bookmark,
  Category,
  Character,
  CharacterFormData,
  ContentFormData,
  ContentItem,
  EventItem,
  MediaFormData,
  MediaItem,
  MerchandiseItem,
  NavView,
  UpcomingRelease,
} from './types'
import './App.css'
import './components/GlobalPaginationStyles.css'
import './components/GlobalSurfaceConsistency.css'
import './components/GlobalGlassConsistency.css'

export const PROTOTYPE_CHARACTER: Character = {
  id: -1,
  categoryId: 2,
  categoryName: 'Astral Nexus',
  name: 'Vanguard Operative Valerius',
  fandomUniverse: 'Astral Nexus // Original Prototype',
  roleTitle: 'Nexus Gate Sentinel & Explorer',
  bio: 'Experimental deep-space vanguard operative wearing pressurized obsidian composite armor and astral-harmonic sensory optics. Developed as an original prototype specimen to demonstrate multi-layer spatial perspective and portrait pop-out interaction.',
  abilities: 'Dimensional breach navigation, inertial dampening, kinetic shield harmonic resonance, tactical telemetry scanning.',
  backstory: 'Forged within the Astral Gate Complex, Valerius charts unexplored multiverse corridors between interconnected fandom sectors.',
  avatarUrl: '/astral_vanguard_cutout.png',
  bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
  originUniverse: 'Astral Gate Complex (Original IP)',
  voiceActor: 'Original Audio Synthesis',
  popularityScore: 100,
  createdAt: '2026-09-23T00:00:00Z',
  updatedAt: '2026-09-23T00:00:00Z'
}

const VALID_VIEWS: readonly NavView[] = [
  'discover',
  'home',
  'explore',
  'characters',
  'media',
  'merchandise',
  'releases',
  'events',
  'sitemap',
  'feedback',
  'profile',
  'dashboard',
  'submissions',
  'admin',
]

function getInitialView(): NavView {
  try {
    // 1. Try URL pathname: e.g. "/events" -> "events"
    const path = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase()
    if (path && VALID_VIEWS.includes(path as NavView)) {
      return path as NavView
    }

    // 2. Try URL hash: e.g. "#/events" or "#events" -> "events"
    const hash = window.location.hash.replace(/^#[/]?/, '').split('/')[0].toLowerCase()
    if (hash && VALID_VIEWS.includes(hash as NavView)) {
      return hash as NavView
    }

    // 3. Fallback to localStorage stored view
    const stored = localStorage.getItem('fhp_current_view') as NavView | null
    if (stored && VALID_VIEWS.includes(stored)) {
      return stored
    }
  } catch {
    // ignore
  }

  return 'home'
}

function getChronicleRouteId(): string | null { return window.location.pathname.match(/^\/explore\/([^/]+)\/?$/)?.[1] || null }

function getCharacterRouteId():string|null { return window.location.pathname.match(/^\/characters\/([^/]+)\/?$/)?.[1]||null }

function getMediaRouteId(): string | null {
  return window.location.pathname.match(/^\/media\/([^/]+)\/?$/)?.[1] || null
}

function getMerchandiseRouteId(): string | null {
  return window.location.pathname.match(/^\/merchandise\/([^/]+)\/?$/)?.[1] || null
}

function getInitialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem('fhp_theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
  } catch {
    // ignore
  }
  return 'dark'
}

function AppContent() {
  const chronicleRail = useRef<HTMLDivElement>(null)
  const [mobileChronicle, setMobileChronicle] = useState(0)

  const { user, isLoading: authLoading } = useAuth()
  const isAdmin = user?.role === 'Admin'

  // Theme state: 'dark' or 'light' with persistent storage
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('fhp_theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  // Navigation view: NavView with route & refresh persistence
  const [currentView, _setCurrentView] = useState<NavView>(getInitialView)
  const [chronicleRouteId,setChronicleRouteId]=useState<string|null>(getChronicleRouteId)
  const [characterRouteId,setCharacterRouteId]=useState<string|null>(getCharacterRouteId)
  const [mediaRouteId, setMediaRouteId] = useState<string | null>(getMediaRouteId)
  const [merchandiseRouteId, setMerchandiseRouteId] = useState<string | null>(getMerchandiseRouteId)
  const [routeMedia, setRouteMedia] = useState<MediaItem | null>(null)
  const [selectedMerchandiseItem, setSelectedMerchandiseItem] = useState<MerchandiseItem | null>(null)

  const openMedia = useCallback((item: MediaItem) => {
    setRouteMedia(item)
    setMediaRouteId(String(item.id))
    _setCurrentView('media')
    const path = `/media/${item.id}`
    if (window.location.pathname !== path) window.history.pushState({view:'media',mediaId:item.id},'',path)
    window.scrollTo({top:0,behavior:'instant'})
  }, [])

  const openMerchandise = useCallback((item: MerchandiseItem) => {
    setSelectedMerchandiseItem(item)
    setMerchandiseRouteId(String(item.id))
    _setCurrentView('merchandise')
    const path = `/merchandise/${item.id}`
    if (window.location.pathname !== path) {
      window.history.pushState({ view: 'merchandise', merchandise: item }, '', path)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const setCurrentView = useCallback((view: NavView, replace = false) => {
    _setCurrentView(view)
    setMediaRouteId(null)
    setCharacterRouteId(null)
    setChronicleRouteId(null)
    setMerchandiseRouteId(null)
    setRouteMedia(null)
    try {
      localStorage.setItem('fhp_current_view', view)
      const expectedPath = view === 'home' ? '/' : `/${view}`
      if (window.location.pathname !== expectedPath) {
        if (replace) {
          window.history.replaceState({ view }, '', expectedPath)
        } else {
          window.history.pushState({ view }, '', expectedPath)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Handle browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const v = getInitialView()
      _setCurrentView(v)
      setMediaRouteId(getMediaRouteId())
      setCharacterRouteId(getCharacterRouteId())
      setChronicleRouteId(getChronicleRouteId())
      setMerchandiseRouteId(getMerchandiseRouteId())
      setRouteMedia(null)
      try {
        localStorage.setItem('fhp_current_view', v)
      } catch {
        // ignore
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Keep URL in sync on initial mount & whenever currentView updates
  useEffect(() => {
    const expectedPath = currentView === 'explore' && chronicleRouteId
      ? `/explore/${chronicleRouteId}`
      : currentView === 'characters' && characterRouteId
      ? `/characters/${characterRouteId}`
      : currentView === 'media' && mediaRouteId
      ? `/media/${mediaRouteId}`
      : currentView === 'merchandise' && merchandiseRouteId
      ? `/merchandise/${merchandiseRouteId}`
      : currentView === 'home'
      ? '/'
      : `/${currentView}`

    if (window.location.pathname !== expectedPath) {
      try {
        window.history.replaceState({ view: currentView }, '', expectedPath)
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem('fhp_current_view', currentView)
    } catch {
      // ignore
    }
  }, [currentView, mediaRouteId, characterRouteId, chronicleRouteId, merchandiseRouteId])

  // Redirect unauthenticated or non-admin access away from admin view
  useEffect(() => {
    if (!authLoading && currentView === 'admin' && !isAdmin) {
      setCurrentView('home', true)
    }
  }, [authLoading, currentView, isAdmin, setCurrentView])

  // Font scale accessibility state ('small' | 'normal' | 'large')
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>(() => {
    return (localStorage.getItem('fhp_font_size') as 'small' | 'normal' | 'large') || 'normal'
  })

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
    localStorage.setItem('fhp_font_size', fontSize)
  }, [fontSize])

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
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')

  // Debounce search by 250ms to keep input instant while avoiding network spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)
    return () => clearTimeout(handler)
  }, [search])

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [contentType, setContentType] = useState<string>('All')
  const [genre, setGenre] = useState<string>('All')
  const [releaseYear, setReleaseYear] = useState<number | undefined>(undefined)
  const [minPopularity, setMinPopularity] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>('popular')

  // Modals State
  const [selectedDetailItem, setSelectedDetailItem] = useState<ContentItem | null>(null)
  const openChronicle = useCallback((item: ContentItem) => {
    setSelectedDetailItem(item); setChronicleRouteId(String(item.id)); _setCurrentView('explore')
    const path = `/explore/${item.id}`
    if(window.location.pathname!==path) window.history.pushState({view:'explore',chronicle:item},'',path)
    window.scrollTo({top:0,behavior:'instant'})
  }, [])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const openCharacter=useCallback((character:Character)=>{
    setSelectedCharacter(character);setCharacterRouteId(String(character.id));setMediaRouteId(null);_setCurrentView('characters')
    const path=`/characters/${character.id}`
    if(window.location.pathname!==path)window.history.pushState({view:'characters',character},'',path)
    window.scrollTo({top:0,behavior:'instant'})
  },[])

  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false)
  const [isAdminCharModalOpen, setIsAdminCharModalOpen] = useState<boolean>(false)
  const [isAdminMediaModalOpen, setIsAdminMediaModalOpen] = useState<boolean>(false)
  const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null)
  const [charToEdit, setCharToEdit] = useState<Character | null>(null)
  const [mediaToEdit, setMediaToEdit] = useState<MediaItem | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => new URLSearchParams(window.location.hash.slice(1)).has('verify-email'))
  const [adminRefreshKey, setAdminRefreshKey] = useState<number>(0)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load Categories on mount and prefetch catalogs for instant navigation
  useEffect(() => {
    const initApp = async () => {
      try {
        const cats = await api.getCategories()
        setCategories(cats)
        api.prefetchCatalog()
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

  // Scroll to top automatically when navigating between views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [currentView])

  // Load Content (Stale-While-Revalidate: keep existing cards visible during background fetch)
  const loadContent = useCallback(async (force = false) => {
    try {
      setContentItems((prev) => {
        if (prev.length === 0 || force) setLoading(true)
        return prev
      })
      setError(null)
      const data = await api.getContentList({
        search: debouncedSearch,
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
      setContentItems((prev) => {
        if (prev.length === 0) {
          setError(err instanceof Error ? err.message : 'Error retrieving fandom catalog.')
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategoryId, contentType, genre, releaseYear, minPopularity, sortBy, page, pageSize])

  // Load Characters (Stale-While-Revalidate: keep existing cards visible)
  const loadCharacters = useCallback(async (force = false) => {
    try {
      setCharacters((prev) => {
        if (prev.length === 0 || force) setLoading(true)
        return prev
      })
      setError(null)
      if(currentView==='characters'){
        const first=await api.getCharacters({page:1,pageSize:12})
        const remaining=await Promise.all(Array.from({length:Math.max(0,Math.ceil(first.totalCount/12)-1)},(_,index)=>api.getCharacters({page:index+2,pageSize:12})))
        const roster=characterPageRoster([first,...remaining].flatMap(result=>result.items)).filter(character=>(!selectedCategoryId||character.categoryId===selectedCategoryId)&&(!debouncedSearch||`${character.name} ${character.fandomUniverse}`.toLowerCase().includes(debouncedSearch.toLowerCase())))
        setCharacters(roster.slice((charPage-1)*12,charPage*12));setTotalCharacters(roster.length)
        return
      }
      const data = await api.getCharacters({
        search: debouncedSearch,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        page: charPage,
        pageSize,
      })
      setCharacters(data.items)
      setTotalCharacters(data.totalCount)
    } catch (err: unknown) {
      setCharacters((prev) => {
        if (prev.length === 0) {
          setError(err instanceof Error ? err.message : 'Error retrieving character dossiers.')
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedCategoryId, sortBy, charPage, pageSize, currentView])

  // Load Media (Stale-While-Revalidate: keep existing cards visible)
  const loadMedia = useCallback(async (force = false) => {
    try {
      setMediaItems((prev) => {
        if (prev.length === 0 || force) setLoading(true)
        return prev
      })
      setError(null)
      const data = await api.getMediaList({
        mediaType: mediaFormatFilter,
        categoryId: selectedCategoryId || undefined,
        search: debouncedSearch,
        page: mediaPage,
        pageSize,
      })
      setMediaItems(data.items)
      setTotalMedia(data.totalCount)
    } catch (err: unknown) {
      setMediaItems((prev) => {
        if (prev.length === 0) {
          setError(err instanceof Error ? err.message : 'Error retrieving multimedia streams.')
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }, [mediaFormatFilter, selectedCategoryId, debouncedSearch, mediaPage, pageSize])

  // Fetch relevant content based on active view (parallelized for instant responses)
  useEffect(() => {
    if (currentView === 'home') {
      Promise.allSettled([loadContent(), loadCharacters(), loadMedia()])
    } else if (currentView === 'explore') {
      loadContent()
    } else if (currentView === 'characters') {
      loadCharacters()
    } else if (currentView === 'media') {
      loadMedia()
    } else if (currentView === 'admin') {
      Promise.allSettled([loadContent(), loadCharacters(), loadMedia()])
    }
  }, [currentView, debouncedSearch, selectedCategoryId, contentType, genre, releaseYear, minPopularity, sortBy, page, charPage, mediaPage, mediaFormatFilter])

  // Reset filters
  const handleResetFilters = useCallback(() => {
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
  }, [])

  // Reset open modals and transient edit states
  const resetAllModalsAndTransientState = useCallback(() => {
    setSelectedDetailItem(null)
    setSelectedCharacter(null)
    setItemToEdit(null)
    setCharToEdit(null)
    setMediaToEdit(null)
    setIsAdminModalOpen(false)
    setIsAdminCharModalOpen(false)
    setIsAdminMediaModalOpen(false)
  }, [])

  // Track user login/logout transitions: after logout, return to Home & clear state
  const prevUserRef = useRef(user)
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setCurrentView('home', true)
      handleResetFilters()
      resetAllModalsAndTransientState()
      setBookmarks([])
    }
    prevUserRef.current = user
  }, [user, setCurrentView, handleResetFilters, resetAllModalsAndTransientState])

  // After successful login: always navigate to Home with clean fresh state
  const handleLoginSuccess = useCallback(() => {
    setCurrentView('home', true)
    handleResetFilters()
    resetAllModalsAndTransientState()
    setIsAuthModalOpen(false)
  }, [setCurrentView, handleResetFilters, resetAllModalsAndTransientState])

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Bookmarking helpers
  const isItemBookmarked = (type: string, id: number) => {
    const t = type.toLowerCase()
    const isArticle = t === 'content' || t === 'article'
    return bookmarks.some((b) => {
      const bt = b.itemType.toLowerCase()
      if (isArticle && (bt === 'content' || bt === 'article')) {
        return b.itemId === id
      }
      return bt === t && b.itemId === id
    })
  }

  const handleToggleContentBookmark = async (item: ContentItem) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Content', item.id)
    if (already) {
      await api.removeBookmarkByItem('Content', item.id)
      setBookmarks((prev) => prev.filter((b) => {
        const bt = b.itemType.toLowerCase()
        return !((bt === 'content' || bt === 'article') && b.itemId === item.id)
      }))
      showToast(`Removed "${item.title}" from saved items.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Content',
        itemId: item.id,
        itemTitle: item.title,
        itemSubtitle: item.fandomUniverse,
        itemImageUrl: item.thumbnailUrl,
      })
      setBookmarks((prev) => [
        added,
        ...prev.filter((b) => {
          const bt = b.itemType.toLowerCase()
          return !(b.id === added.id || ((bt === 'content' || bt === 'article') && b.itemId === item.id))
        }),
      ])
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
      setBookmarks((prev) => [
        added,
        ...prev.filter((b) => !(b.id === added.id || (b.itemId === char.id && b.itemType.toLowerCase() === 'character'))),
      ])
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
      setBookmarks((prev) => [
        added,
        ...prev.filter((b) => !(b.id === added.id || (b.itemId === m.id && b.itemType.toLowerCase() === 'media'))),
      ])
      showToast(`Saved "${m.title}" to personal archive!`)
    }
  }

  const handleToggleMerchandiseBookmark = async (item: MerchandiseItem) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Merchandise', item.id)
    if (already) {
      await api.removeBookmarkByItem('Merchandise', item.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'merchandise' && b.itemId === item.id)))
      showToast(`Removed "${item.name}" from personal archive.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Merchandise',
        itemId: item.id,
        itemTitle: item.name,
        itemSubtitle: `${item.fandomUniverse} • ${item.tag}`,
        itemImageUrl: item.imageUrl,
      })
      setBookmarks((prev) => [
        added,
        ...prev.filter((b) => !(b.id === added.id || (b.itemId === item.id && b.itemType.toLowerCase() === 'merchandise'))),
      ])
      showToast(`Saved "${item.name}" to personal archive!`)
    }
  }

  const handleToggleReleaseBookmark = async (release: UpcomingRelease) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Release', release.id)
    if (already) {
      await api.removeBookmarkByItem('Release', release.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'release' && b.itemId === release.id)))
      showToast(`Removed "${release.title}" from premiere reminders.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Release',
        itemId: release.id,
        itemTitle: release.title,
        itemSubtitle: `${release.fandomUniverse} • ${release.platform}`,
        itemImageUrl: release.thumbnailUrl,
      })
      setBookmarks((prev) => [added, ...prev])
      showToast(`Added "${release.title}" to premiere reminders!`)
    }
  }

  const handleToggleEventBookmark = async (ev: EventItem) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const already = isItemBookmarked('Event', ev.id)
    if (already) {
      await api.removeBookmarkByItem('Event', ev.id)
      setBookmarks((prev) => prev.filter((b) => !(b.itemType.toLowerCase() === 'event' && b.itemId === ev.id)))
      showToast(`Removed "${ev.title}" from event itinerary.`)
    } else {
      const added = await api.addBookmark({
        itemType: 'Event',
        itemId: ev.id,
        itemTitle: ev.title,
        itemSubtitle: `${ev.city} • ${ev.venue}`,
        itemImageUrl: ev.thumbnailUrl,
      })
      setBookmarks((prev) => [added, ...prev])
      showToast(`Saved "${ev.title}" to event itinerary!`)
    }
  }

  const handleRemoveBookmark = async (id: number) => {
    await api.removeBookmark(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    showToast('Bookmark removed.')
  }

  const handleOpenBookmarkedItem = async (itemType: string, itemId: number) => {
    const t = itemType.toLowerCase()
    if (t === 'content' || t === 'article') {
      try {
        const item = await api.getContentById(itemId)
        openChronicle(item)
      } catch {
        showToast('Could not load saved item.')
      }
    } else if (t === 'character') {
      try {
        const char = await api.getCharacterById(itemId)
        openCharacter(char)
      } catch {
        showToast('Could not load character.')
      }
    } else if (t === 'merchandise') {
      try {
        const merch = await api.getMerchandiseById(itemId)
        openMerchandise(merch)
      } catch {
        setCurrentView('merchandise')
      }
    } else if (t === 'release') {
      setCurrentView('releases')
    } else if (t === 'event') {
      setCurrentView('events')
    } else {
      setCurrentView('media')
    }
  }

  // Admin Content Save & Delete
  const handleSaveContent = async (formData: ContentFormData, id?: number) => {
    if (id) {
      const updated = await api.updateContent(id, formData)
      showToast(`Updated "${updated.title}" successfully!`)
      if (selectedDetailItem?.id === id || chronicleRouteId === String(id)) {
        setSelectedDetailItem(updated)
      }
    } else {
      const created = await api.createContent(formData)
      showToast(`Published "${created.title}" successfully!`)
    }
    const cats = await api.getCategories()
    setCategories(cats)
    await loadContent()
    setAdminRefreshKey((k) => k + 1)
  }

  const handleDeleteContent = async (id: number) => {
    await api.deleteContent(id)
    showToast(`Content item deleted from SQL Server.`)
    if (selectedDetailItem?.id === id || chronicleRouteId === String(id)) {
      setSelectedDetailItem(null)
      if(chronicleRouteId===String(id))setCurrentView('explore')
    }
    const cats = await api.getCategories()
    setCategories(cats)
    await loadContent()
    setAdminRefreshKey((k) => k + 1)
  }

  // Admin Character Save & Delete
  const handleSaveCharacter = async (formData: CharacterFormData, id?: number) => {
    if (id) {
      const updated = await api.updateCharacter(id, formData)
      showToast(`Updated "${updated.name}" character dossier!`)
      if (selectedCharacter?.id === id || characterRouteId === String(id)) {
        setSelectedCharacter(updated)
      }
    } else {
      const created = await api.createCharacter(formData)
      showToast(`Published "${created.name}" dossier!`)
    }
    await loadCharacters()
    setAdminRefreshKey((k) => k + 1)
  }

  const handleDeleteCharacter = async (id: number) => {
    await api.deleteCharacter(id)
    showToast(`Character deleted.`)
    if (selectedCharacter?.id === id || characterRouteId === String(id)) {
      setSelectedCharacter(null)
      if(characterRouteId===String(id))setCurrentView('characters')
    }
    await loadCharacters()
    setAdminRefreshKey((k) => k + 1)
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
    setAdminRefreshKey((k) => k + 1)
  }

  const handleDeleteMedia = async (id: number) => {
    await api.deleteMedia(id)
    showToast('Media stream deleted.')
    await loadMedia()
    setAdminRefreshKey((k) => k + 1)
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
  // 1 large featured story, expanded legends row, horizontal media rail, compact remaining grid
  // Curate four different fandoms without changing the remaining Home collections.
  const editorialStories: ContentItem[] = []
  const editorialFandoms = new Set<string>()
  for (const item of contentItems) {
    const fandom = (item.fandomUniverse || item.categoryName || item.categorySlug).trim().toLowerCase()
    if (!editorialFandoms.has(fandom)) {
      editorialStories.push(item)
      editorialFandoms.add(fandom)
    }
    if (editorialStories.length === 4) break
  }
  for (const item of contentItems) {
    if (editorialStories.length === 4) break
    if (!editorialStories.some(story => story.id === item.id)) editorialStories.push(item)
  }

  // Pagination counts
  const totalExplorePages = Math.max(1, Math.ceil(totalCount / pageSize))
  const totalCharPages = Math.max(1, Math.ceil(totalCharacters / pageSize))
  const totalMediaPages = Math.max(1, Math.ceil(totalMedia / pageSize))

  // Bookmarked ID sets for specialized views
  const merchandiseBookmarkedIds = new Set(
    bookmarks.filter((b) => b.itemType.toLowerCase() === 'merchandise').map((b) => b.itemId)
  )
  const releaseBookmarkedIds = new Set(
    bookmarks.filter((b) => b.itemType.toLowerCase() === 'release').map((b) => b.itemId)
  )
  const eventBookmarkedIds = new Set(
    bookmarks.filter((b) => b.itemType.toLowerCase() === 'event').map((b) => b.itemId)
  )

  return (
    <div className={`portal-universe theme-${theme}`}>
      {/* Site-Wide Ambient Atmosphere */}
      <SiteAtmosphere theme={theme} />

      {/* Top Cinematic Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        bookmarkCount={bookmarks.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setCurrentView('profile')}
        onOpenDashboard={() => setCurrentView('dashboard')}
        searchQuery={search}
        onSearchChange={setSearch}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onOpenFeedback={() => setCurrentView('feedback')}
        onOpenSubmission={() => setCurrentView('submissions')}
        onOpenSitemap={() => setCurrentView('sitemap')}
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
      {currentView === 'discover' && <RealmDiscovery onHome={()=>setCurrentView('home')} onExplore={cat=>{setSelectedCategoryId(cat.id);setPage(1);setCurrentView('explore')}} onChronicle={openChronicle} onCharacter={openCharacter} onMedia={openMedia} onMerchandise={openMerchandise} onEvents={()=>setCurrentView('events')} onSignIn={()=>setIsAuthModalOpen(true)} />}
      {currentView === 'home' && (
        <HomepageExperience>
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

          <div className="home-section-boundary" aria-hidden="true" />

          <section className="discovery-home-invitation" aria-labelledby="discovery-invitation-title"><div><span>FIND YOUR CONNECTION</span><h2 id="discovery-invitation-title">Eight realms. Which one feels like you?</h2><p>Five choices. A world of stories waiting on the other side.</p></div><button onClick={()=>setCurrentView('discover')}>Discover Your Realm &rarr;</button></section>

          {/* Multiverse Navigation Gateways */}
          <ConceptHighlights
            theme={theme}
            onExploreWorld={() => setCurrentView('explore')}
            onExploreCharacters={() => setCurrentView('characters')}
            onExploreMedia={() => setCurrentView('media')}
            onExploreEvents={() => setCurrentView('events')}
            onExploreReleases={() => setCurrentView('releases')}
          />

          <div className="home-section-boundary" aria-hidden="true" />

          {/* Varied Editorial Layout Section */}
          <section className="editorial-showcase-section">
            <div className="home-section-header">
              <div className="home-section-eyebrow">
                <span className="home-eyebrow-pip" />
                <span>EDITORIAL SPOTLIGHTS</span>
              </div>
              <h2 className="home-section-title">Major Chronicles & Dossiers</h2>
              <p className="home-section-desc">Hand-picked investigative features and priority intelligence from across the fandom realms.</p>
            </div>

            {/* Four-story editorial edition; all story actions use existing content. */}
            {editorialStories.length > 0 && (
              <div ref={chronicleRail} className="editorial-story-container chronicle-edition" aria-label="Featured fandom chronicles" onScroll={e=>{if(window.innerWidth>768)return;const node=e.currentTarget;const width=node.firstElementChild?.getBoundingClientRect().width||1;setMobileChronicle(Math.round(node.scrollLeft/(width+12)))}}>
                {editorialStories.map((item, index) => (
                  <FeaturedStory
                    key={item.id}
                    item={item}
                    editorialIndex={index}
                    onSelect={(story) => openChronicle(story)}
                    onToggleBookmark={handleToggleContentBookmark}
                    isBookmarked={isItemBookmarked('Content', item.id)}
                  />
                ))}
              </div>
            )}

            <div className="chronicle-mobile-dots" aria-label="Choose chronicle">
              {editorialStories.map((item,index)=><button key={item.id} type="button" aria-label={`Show chronicle ${index+1}`} aria-current={mobileChronicle===index?'true':undefined} onClick={()=>{const node=chronicleRail.current;if(node){const width=node.firstElementChild?.getBoundingClientRect().width||0;node.scrollTo({left:index*(width+12),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}} />)}
            </div>

          <div className="home-section-boundary" aria-hidden="true" />

            {/* 2. Expanded Legends Cards Interaction: The People Behind the Legends */}
            <div className="editorial-spotlight-container">
              <div className="home-section-header home-sub-header">
                <div className="home-section-eyebrow">
                  <span className="home-eyebrow-pip" />
                  <span>CHARACTER DOSSIER</span>
                </div>
                <h2 className="home-section-title">The People Behind the Legends</h2>
                <p className="home-section-desc">Key figures, origins and tactical profiles defining modern canon.</p>
              </div>
              <ExpandedLegendsCards
                characters={characters}
                onSelectCharacter={(char) => openCharacter(char)}
                theme={theme}
              />
            </div>

          <div className="home-section-boundary" aria-hidden="true" />

            {/* 3. Horizontal Media Rail: Trailers, Streams & Soundtracks */}
            <MediaRail
              items={mediaItems}
              onSelectMedia={openMedia}
              onToggleBookmark={handleToggleMediaBookmark}
              isBookmarked={(id) => isItemBookmarked('Media', id)}
            />

          <div className="home-section-boundary" aria-hidden="true" />

            {/* 4. Coverflow Chronicles: More Multiverse Chronicles */}
            <CoverflowChronicles
              contentItems={contentItems}
              onSelectChronicle={(item) => openChronicle(item)}
              onExploreAll={() => setCurrentView('explore')}
              isBookmarked={(id) => isItemBookmarked('Content', id)}
              onToggleBookmark={handleToggleContentBookmark}
            />
          </section>
          <div className="home-section-boundary home-footer-boundary" aria-hidden="true" />
        </HomepageExperience>
      )}

      {/* =====================================================================
          2. DEDICATED EXPLORE VIEW (Moved filters and catalog)
          ===================================================================== */}
      {currentView === 'explore' && chronicleRouteId && <ChronicleDetailPage key={chronicleRouteId} id={chronicleRouteId} initialItem={selectedDetailItem} onBack={()=>setCurrentView('explore')} onEdit={item=>{setItemToEdit(item);setIsAdminModalOpen(true)}} isBookmarked={id=>isItemBookmarked('Content',id)} onToggleBookmark={handleToggleContentBookmark}/>}
      {currentView === 'explore' && !chronicleRouteId && (
        <main className="explore-page-main">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Fandom Chronicles', active: true },
            ]}
          />
          <div className="explore-hero-strip">
            <div className="page-eyebrow">
              <span className="page-eyebrow-pip" />
              <span>CHRONICLES & ARCHIVES // MULTIVERSE LORE</span>
            </div>
            <h1 className="explore-title">Multiverse Chronicle Explorer</h1>
            <div className="page-title-rule" />
            <p className="explore-subtitle">
              Filter by realm, genre, release timeline, and popularity rating across 8 connected universes.
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
            {loading && contentItems.length === 0 && (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Synchronizing catalog entries...</p>
              </div>
            )}

            {error && !loading && contentItems.length === 0 && (
              <div className="catalog-error-box">
                <div className="error-title">Database Query Interruption</div>
                <p className="error-desc">{error}</p>
                <button className="btn-retry" onClick={() => loadContent(true)}>Retry Query</button>
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

            {contentItems.length > 0 && (
              <ChroniclesEditorialGrid items={contentItems}
                onSelect={openChronicle}
                onEdit={item=>{setItemToEdit(item);setIsAdminModalOpen(true)}}
                isBookmarked={id=>isItemBookmarked('Content',id)}
                onToggleBookmark={handleToggleContentBookmark}
              />
            )}

            {/* Pagination */}
            {!loading && !error && totalExplorePages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-page-nav"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(page - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Previous
                </button>
                <div className="page-indicator">
                  Page <strong>{page}</strong> of <strong>{totalExplorePages}</strong>
                </div>
                <button
                  className="btn-page-nav"
                  disabled={page >= totalExplorePages}
                  onClick={() => {
                    setPage(page + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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
      {currentView === 'characters' && characterRouteId && <CharacterDetailPage key={characterRouteId} id={characterRouteId} initialCharacter={selectedCharacter} onBack={()=>setCurrentView('characters')} isAdmin={!!isAdmin} onEdit={character=>{setCharToEdit(character);setIsAdminCharModalOpen(true)}} />}
      {currentView === 'characters' && !characterRouteId && (
        <main className="characters-page-main">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Character Dossiers', active: true },
            ]}
          />
          <div className="explore-hero-strip">
            <div className="page-eyebrow">
              <span className="page-eyebrow-pip" />
              <span>CHARACTER ARCHIVE // CLASSIFIED DOSSIERS</span>
            </div>
            <h1 className="explore-title">Character Dossiers & Archives</h1>
            <div className="page-title-rule" />
            <p className="explore-subtitle">
              Detailed records of legends, sorcerers, anti-heroes, and iconic figures across 8 universes.
            </p>
          </div>

          <section className="catalog-section">
            {loading && characters.length === 0 ? (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Loading character profiles...</p>
              </div>
            ) : error && characters.length === 0 ? (
              <div className="catalog-error-box">
                <div className="error-title">Database Query Interruption</div>
                <p className="error-desc">{error}</p>
                <button className="btn-retry" onClick={() => loadCharacters(true)}>Retry Query</button>
              </div>
            ) : characters.length > 0 ? (
              <CharactersDossierGrid key={charPage} characters={characters}
                onSelect={openCharacter}
                onEdit={character=>{setCharToEdit(character);setIsAdminCharModalOpen(true)}}
                isBookmarked={id=>isItemBookmarked('Character',id)}
                onToggleBookmark={handleToggleCharacterBookmark}
              />
            ) : (
              <div className="empty-catalog-state">
                <div className="empty-icon"><UserIcon size={36} /></div>
                <h3>No character profiles found</h3>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalCharPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-page-nav"
                  disabled={charPage <= 1}
                  onClick={() => {
                    setCharPage(charPage - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Previous
                </button>
                <div className="page-indicator">
                  Page <strong>{charPage}</strong> of <strong>{totalCharPages}</strong>
                </div>
                <button
                  className="btn-page-nav"
                  disabled={charPage >= totalCharPages}
                  onClick={() => {
                    setCharPage(charPage + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          4. MULTIMEDIA VIEW
          ===================================================================== */}
      {currentView === 'media' && mediaRouteId && (
        <MediaDetailPage key={mediaRouteId} id={mediaRouteId} initialItem={routeMedia}
          onSelect={openMedia} onLibrary={() => setCurrentView('media')}
          isBookmarked={id=>isItemBookmarked('Media',id)} onToggleBookmark={handleToggleMediaBookmark}
          onSignIn={()=>setIsAuthModalOpen(true)} onRatingUpdated={handleRatingUpdated} />
      )}
      {currentView === 'media' && !mediaRouteId && (
        <main className="media-page-main">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Multimedia Matrix', active: true },
            ]}
          />
          <div className="explore-hero-strip">
            <div className="page-eyebrow">
              <span className="page-eyebrow-pip" />
              <span>AUDIOVISUAL ARCHIVES // MULTIVERSE FEEDS</span>
            </div>
            <h1 className="explore-title">Audiovisual Multiverse Streams</h1>
            <div className="page-title-rule" />
            <p className="explore-subtitle">
              Embedded cinema trailers, gameplay teasers, and original soundtrack streams from across the multiverse.
            </p>
          </div>

          <div className="media-format-selector" style={{ maxWidth: '1280px', margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'All' ? 'active' : ''}`}
              onClick={() => {
                setMediaFormatFilter('All')
                setMediaPage(1)
              }}
            >
              All Streams
            </button>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'Video' ? 'active' : ''}`}
              onClick={() => {
                setMediaFormatFilter('Video')
                setMediaPage(1)
              }}
            >
              <PlayIcon size={12} fill="currentColor" />
              <span>Videos & Trailers</span>
            </button>
            <button
              className={`btn-media-filter ${mediaFormatFilter === 'Audio' ? 'active' : ''}`}
              onClick={() => {
                setMediaFormatFilter('Audio')
                setMediaPage(1)
              }}
            >
              <MusicIcon size={13} />
              <span>Audio & Soundtracks</span>
            </button>
          </div>

          <section className="catalog-section">
            {loading && mediaItems.length === 0 ? (
              <div className="loading-container">
                <div className="astral-spinner" />
                <p className="loading-text">Loading media streams...</p>
              </div>
            ) : error && mediaItems.length === 0 ? (
              <div className="catalog-error-box">
                <div className="error-title">Database Query Interruption</div>
                <p className="error-desc">{error}</p>
                <button className="btn-retry" onClick={() => loadMedia(true)}>Retry Query</button>
              </div>
            ) : mediaItems.length > 0 ? (
              <div className="media-grid">
                {mediaItems.map((m) => (
                  <MediaCard
                    key={m.id}
                    item={m}
                    onSelect={openMedia}
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

            {/* Pagination */}
            {!loading && !error && totalMediaPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-page-nav"
                  disabled={mediaPage <= 1}
                  onClick={() => {
                    setMediaPage(mediaPage - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Previous
                </button>
                <div className="page-indicator">
                  Page <strong>{mediaPage}</strong> of <strong>{totalMediaPages}</strong>
                </div>
                <button
                  className="btn-page-nav"
                  disabled={mediaPage >= totalMediaPages}
                  onClick={() => {
                    setMediaPage(mediaPage + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* =====================================================================
          MERCHANDISE SHOWCASE / DETAIL VIEW
          ===================================================================== */}
      {currentView === 'merchandise' && (
        merchandiseRouteId ? (
          <MerchandiseDetailPage
            key={merchandiseRouteId}
            id={merchandiseRouteId}
            initialItem={selectedMerchandiseItem}
            onBack={() => {
              setMerchandiseRouteId(null)
              setSelectedMerchandiseItem(null)
              setCurrentView('merchandise')
            }}
            isBookmarked={(id) => isItemBookmarked('Merchandise', id)}
            onToggleBookmark={handleToggleMerchandiseBookmark}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isAuthenticated={!!user}
          />
        ) : (
          <main className="portal-content-page merchandise-page">
            <Breadcrumbs
              items={[
                { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
                { label: 'Artifact Vault', active: true },
              ]}
            />
            <MerchandiseShowcase
              categories={categories}
              onBookmark={handleToggleMerchandiseBookmark}
              bookmarkedIds={merchandiseBookmarkedIds}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              isAuthenticated={!!user}
              onInspect={openMerchandise}
            />
          </main>
        )
      )}

      {/* =====================================================================
          UPCOMING RELEASES VIEW
          ===================================================================== */}
      {currentView === 'releases' && (
        <main className="portal-content-page releases-page">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Temporal Chronometer', active: true },
            ]}
          />
          <UpcomingReleases
            categories={categories}
            onBookmark={handleToggleReleaseBookmark}
            bookmarkedIds={releaseBookmarkedIds}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isAuthenticated={!!user}
          />
        </main>
      )}

      {/* =====================================================================
          EVENTS REGISTRY VIEW
          ===================================================================== */}
      {currentView === 'events' && (
        <main className="portal-content-page events-page">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Cosmic Convergence Registry', active: true },
            ]}
          />
          <EventsDirectory
            categories={categories}
            onBookmark={handleToggleEventBookmark}
            bookmarkedIds={eventBookmarkedIds}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isAuthenticated={!!user}
            theme={theme}
          />
        </main>
      )}

      {/* =====================================================================
          5. ADMIN CONSOLE VIEW (Dedicated Admin Center)
          ===================================================================== */}
      {currentView === 'admin' && isAdmin && (
        <main className="admin-page-main">
          <Breadcrumbs
            items={[
              { label: 'Nexus Gate', onClick: () => setCurrentView('home') },
              { label: 'Admin Command Matrix', active: true },
            ]}
          />
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
            categories={categories}
            onViewContent={(item) => openChronicle(item)}
            onEditContent={(item) => {
              setItemToEdit(item)
              setIsAdminModalOpen(true)
            }}
            onDeleteContent={async (id) => {
              await handleDeleteContent(id)
            }}
            onViewCharacter={(char) => openCharacter(char)}
            onEditCharacter={(char) => {
              setCharToEdit(char)
              setIsAdminCharModalOpen(true)
            }}
            onDeleteCharacter={async (id) => {
              await handleDeleteCharacter(id)
            }}
            onEditMedia={(media) => {
              setMediaToEdit(media)
              setIsAdminMediaModalOpen(true)
            }}
            onDeleteMedia={async (id) => {
              await handleDeleteMedia(id)
            }}
            refreshTrigger={adminRefreshKey}
          />
        </main>
      )}

      {/* =====================================================================
          6. OPERATIVE PROFILE VIEW (Full Page)
          ===================================================================== */}
      {currentView === 'profile' && (
        <main className="portal-content-page profile-page-main">
          <ProfilePage
            categories={categories}
            onNavigate={setCurrentView}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            bookmarkCount={bookmarks.length}
          />
        </main>
      )}

      {/* =====================================================================
          7. COMMAND DASHBOARD / MY ARCHIVE VIEW (Full Page)
          ===================================================================== */}
      {currentView === 'dashboard' && (
        <main className="portal-content-page dashboard-page-main">
          <DashboardPage
            categories={categories}
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onOpenItem={handleOpenBookmarkedItem}
            onNavigate={setCurrentView}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        </main>
      )}

      {/* =====================================================================
          8. FAN CREATIVE FORGE / SUBMISSIONS VIEW (Full Page)
          ===================================================================== */}
      {currentView === 'submissions' && (
        <main className="portal-content-page submissions-page-main">
          <FanSubmissionPage
            categories={categories}
            onNavigate={setCurrentView}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSuccessToast={(msg) => showToast(msg)}
          />
        </main>
      )}

      {/* =====================================================================
          9. ARCHIVIST DISPATCH / FEEDBACK VIEW (Full Page)
          ===================================================================== */}
      {currentView === 'feedback' && (
        <main className="portal-content-page feedback-page-main">
          <FeedbackPage
            onNavigate={setCurrentView}
            onSuccessToast={(msg) => showToast(msg)}
          />
        </main>
      )}

      {/* =====================================================================
          10. ARCHITECTURE TOPOLOGY / SITEMAP VIEW (Full Page)
          ===================================================================== */}
      {currentView === 'sitemap' && (
        <main className="portal-content-page sitemap-page-main">
          <SitemapPage
            categories={categories}
            onNavigate={setCurrentView}
            isAdmin={isAdmin}
          />
        </main>
      )}

      {/* =====================================================================
          PREMIUM RESTORED FOOTER (4 COLUMNS, CLEAN 2-ROW/WRAPPED NAV LINKS)
          ===================================================================== */}
      <footer className="portal-footer" role="contentinfo">
        <div className="footer-top-accent-line" />
        <div className="footer-container">
          <div className="footer-columns-grid">
            {/* Col 1: Brand & Multiverse Mission */}
            <div className="footer-col col-brand">
              <div className="footer-brand-header">
                <div className="brand-mark-chip theme-logo-image" role="img" aria-label="Fan Hub Plus logo" />
                <div className="footer-brand-title">
                  <span className="brand-title">FAN HUB PLUS</span>
                </div>
              </div>
              <p className="footer-tagline">Eight Worlds. One Universe.</p>
              <p className="footer-mission-text">
                Discover the stories, characters and music you love. Explore new worlds, find collectibles and share what makes you a fan.
              </p>
              <div className="footer-status-indicator">
                <span className="status-ping-dot" />
                <span className="status-label">A HOME FOR EVERY FANDOM</span>
              </div>
            </div>

            {/* Col 2: Core Portals (Clean 2-row / wrapped grid) */}
            <div className="footer-col col-portals">
              <h4 className="footer-col-title">Explore</h4>
              <nav className="footer-nav-grid-2col" aria-label="Explore Fan Hub Plus">
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('home')}>Home</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('explore')}>Chronicles</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('characters')}>Characters</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('media')}>Media</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('merchandise')}>Merchandise</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('releases')}>Releases</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('events')}>Events</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('submissions')}>Submit Lore</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('feedback')}>Feedback</button>
                <button type="button" className="footer-link-btn" onClick={() => setCurrentView('sitemap')}>Sitemap</button>
                {isAdmin && (
                  <button type="button" className="footer-link-btn admin-link" onClick={() => setCurrentView('admin')}>Admin Tools</button>
                )}
              </nav>
            </div>

            {/* Col 3: Fandom Realms */}
            <div className="footer-col col-realms">
              <h4 className="footer-col-title">Fandom Realms</h4>
              <div className="universe-links-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="footer-link-btn"
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                      setPage(1)
                      setCurrentView('explore')
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Col 4: Platform Architecture */}
            <div className="footer-col col-architecture">
              <h4 className="footer-col-title">Your Community</h4>
              <ul className="footer-nav-list">
                <li><button type="button" className="footer-link-btn" onClick={() => setCurrentView('sitemap')}>Sitemap</button></li>
                <li><button type="button" className="footer-link-btn" onClick={() => setCurrentView('feedback')}>Feedback & Support</button></li>
                <li><button type="button" className="footer-link-btn" onClick={() => setCurrentView('profile')}>My Profile</button></li>
                <li><button type="button" className="footer-link-btn" onClick={() => setCurrentView('dashboard')}>My Archive</button></li>
              </ul>
              <div className="footer-specs-badge">
                <span className="specs-line">Made for fans.</span>
                <span className="specs-dim">Stories worth sharing. Worlds worth exploring.</span>
              </div>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="footer-bottom-strip">
            <div className="footer-copyright">
              <span>&copy; 2026 Fan Hub Plus. All rights reserved.</span>
            </div>
            <div className="footer-bottom-meta">
              <span className="footer-meta-pill">Every fandom. One universe.</span>
              <span className="footer-meta-sep">&bull;</span>
              <span className="footer-meta-pill">Eight fandoms</span>
              <span className="footer-meta-sep">&bull;</span>
              <button
                type="button"
                className="footer-meta-pill footer-meta-btn"
                onClick={() => setCurrentView('sitemap')}
                title="Explore all pages"
              >
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}



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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
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
