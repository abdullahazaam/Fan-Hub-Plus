import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as api from '../api'
import type { Category, EventItem } from '../types'
import {
  CalendarIcon,
  CloseIcon,
  CompassIcon,
  CrosshairIcon,
  MapPinIcon,
  SearchIcon,
  StarIcon,
} from './Icons'

interface EventsDirectoryProps {
  categories: Category[]
  onBookmark: (event: EventItem) => void
  bookmarkedIds: Set<number>
  onOpenAuth: () => void
  isAuthenticated: boolean
}

// City coordinates mapping for map navigation
const CITY_COORDINATES: Record<string, [number, number]> = {
  Tokyo: [35.6300, 139.7963],
  'Los Angeles': [32.7072, -117.1633],
  London: [51.5078, 0.0305],
  Seoul: [37.4982, 126.8671],
  Paris: [48.8315, 2.2858],
  'New York': [40.7577, -74.0022],
}

// Haversine formula to calculate distance between two coordinates in kilometers
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function parseCoordinates(coordStr?: string): [number, number] | null {
  if (!coordStr) return null
  const parts = coordStr.split(',').map((p) => parseFloat(p.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]]
  }
  return null
}

export const EventsDirectory: React.FC<EventsDirectoryProps> = ({
  categories,
  onBookmark,
  bookmarkedIds,
  onOpenAuth,
  isAuthenticated,
}) => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [cityFilter, setCityFilter] = useState<string>('All')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [search, setSearch] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('all') // 'all', 'month', '30days', '2026', '2027', 'custom'
  const [customDate, setCustomDate] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 12

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'active' | 'denied' | 'error'>('idle')
  const [geoNotice, setGeoNotice] = useState<{ text: string; type: 'info' | 'warning' | 'success' } | null>(null)

  // Card highlight state
  const [highlightedCardId, setHighlightedCardId] = useState<number | null>(null)

  // Map DOM and Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  const cities = ['All', 'Tokyo', 'Los Angeles', 'Seoul', 'London', 'Paris', 'New York', 'Online']

  const EVENT_IMAGE_MAP: Record<string, string> = {
    'animejapan': '/events/animejapan.jpg',
    'comic-con': '/events/sdcc.jpg',
    'san diego': '/events/sdcc.jpg',
    'gamescom': '/events/gamescom.jpg',
    'k-wave': '/events/kwave_festival.jpg',
    'music festival': '/events/kwave_festival.jpg',
    'star wars': '/events/starwars_celebration.jpg',
    'celebration': '/events/starwars_celebration.jpg',
    'new york': '/events/nycc.jpg',
    'nycc': '/events/nycc.jpg',
    'paris': '/events/paris_manga.jpg',
    'manga & sci-fi': '/events/paris_manga.jpg',
    'astral nexus': '/events/astral_nexus_summit.jpg',
    'metaverse': '/events/astral_nexus_summit.jpg',
  }

  const resolveEventImage = (item: EventItem): string => {
    const key = item.title.toLowerCase()
    for (const [pattern, path] of Object.entries(EVENT_IMAGE_MAP)) {
      if (key.includes(pattern)) return path
    }
    return item.thumbnailUrl
  }

  // ─── Fetch Events from API ────────────────────────────────────────────────
  const fetchEvents = async () => {
    try {
      if (events.length === 0) {
        setLoading(true)
      }
      setError(null)

      let dateFrom: string | undefined
      let dateTo: string | undefined

      const now = new Date()
      if (dateFilter === '30days') {
        dateFrom = now.toISOString()
        const future30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        dateTo = future30.toISOString()
      } else if (dateFilter === '2026') {
        dateFrom = '2026-01-01T00:00:00Z'
        dateTo = '2026-12-31T23:59:59Z'
      } else if (dateFilter === '2027') {
        dateFrom = '2027-01-01T00:00:00Z'
        dateTo = '2027-12-31T23:59:59Z'
      } else if (dateFilter === 'custom' && customDate) {
        dateFrom = `${customDate}T00:00:00Z`
        dateTo = `${customDate}T23:59:59Z`
      }

      const res = await api.getEvents({
        city: cityFilter !== 'All' ? cityFilter : undefined,
        categoryId: selectedCategoryId || undefined,
        search: search.trim() || undefined,
        dateFrom,
        dateTo,
        page,
        pageSize,
      })

      // If userLocation is active, sort items by distance
      let items = res.items
      if (userLocation) {
        items = [...items].sort((a, b) => {
          const coordsA = parseCoordinates(a.coordinates)
          const coordsB = parseCoordinates(b.coordinates)
          if (!coordsA && !coordsB) return 0
          if (!coordsA) return 1
          if (!coordsB) return -1
          const distA = getHaversineDistanceKm(userLocation.lat, userLocation.lng, coordsA[0], coordsA[1])
          const distB = getHaversineDistanceKm(userLocation.lat, userLocation.lng, coordsB[0], coordsB[1])
          return distA - distB
        })
      }

      const mapped = items.map((item) => ({
        ...item,
        thumbnailUrl: resolveEventImage(item),
      }))

      setEvents(mapped)
      setTotalCount(res.totalCount)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve event radar data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [cityFilter, selectedCategoryId, dateFilter, customDate, page, userLocation])

  // ─── Initialize Leaflet Map ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid duplicate initialization
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25, 10],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        scrollWheelZoom: true,
        attributionControl: false,
      })

      // ESRI World Dark Gray Canvas (clean, dark, high performance, no API key required)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors',
      }).addTo(map)

      const markersGroup = L.layerGroup().addTo(map)
      markersLayerRef.current = markersGroup
      leafletMapRef.current = map

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      // Cleanup on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        markersLayerRef.current = null
        userMarkerRef.current = null
      }
    }
  }, [])

  // ─── Focus Event Card Action ─────────────────────────────────────────────
  const focusEventCard = (eventId: number) => {
    setHighlightedCardId(eventId)
    const cardEl = document.getElementById(`event-card-${eventId}`)
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      setHighlightedCardId(null)
    }, 2500)
  }

  // ─── Expose global helper for popup button clicks ────────────────────────
  useEffect(() => {
    ;(window as unknown as { focusFanHubEvent?: (id: number) => void }).focusFanHubEvent = (id: number) => {
      focusEventCard(id)
    }
    return () => {
      delete (window as unknown as { focusFanHubEvent?: (id: number) => void }).focusFanHubEvent
    }
  }, [])

  // ─── Update Map Markers when Events, City, or UserLocation changes ────────
  useEffect(() => {
    const map = leafletMapRef.current
    const markersGroup = markersLayerRef.current
    if (!map || !markersGroup) return

    markersGroup.clearLayers()

    const validMarkers: L.Marker[] = []

    events.forEach((item) => {
      const coords = parseCoordinates(item.coordinates)
      // Skip invalid or virtual events (0, 0)
      if (!coords || (coords[0] === 0 && coords[1] === 0)) return

      const [lat, lng] = coords

      // Calculate distance if GPS active
      let distText = ''
      if (userLocation) {
        const dist = getHaversineDistanceKm(userLocation.lat, userLocation.lng, lat, lng)
        distText = `<div class="map-popup-distance">📍 ${dist.toLocaleString()} km away from your sector</div>`
      }

      const evDate = new Date(item.eventDate)
      const dateStr = evDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      // Custom Crimson Pulse Pin
      const pinIcon = L.divIcon({
        className: 'custom-event-pin',
        html: `
          <div class="leaflet-crimson-pin" title="${item.title}">
            <div class="pin-ring"></div>
            <div class="pin-core"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      })

      const popupHtml = `
        <div class="map-popup-card">
          <img src="${item.thumbnailUrl}" alt="${item.title}" class="map-popup-img" />
          <div class="map-popup-body">
            <div class="map-popup-meta">
              <span>${item.categoryName}</span>
              <span>${dateStr}</span>
            </div>
            <h4 class="map-popup-title">${item.title}</h4>
            <div class="map-popup-venue">${item.city} // ${item.venue}</div>
            ${distText}
            <div class="map-popup-actions">
              ${
                item.ticketUrl
                  ? `<a href="${item.ticketUrl}" target="_blank" rel="noopener noreferrer" class="map-popup-btn map-popup-btn-ticket">Tickets ↗</a>`
                  : ''
              }
              <button type="button" onclick="window.focusFanHubEvent && window.focusFanHubEvent(${item.id})" class="map-popup-btn map-popup-btn-focus">Focus Card ↓</button>
            </div>
          </div>
        </div>
      `

      const marker = L.marker([lat, lng], { icon: pinIcon })
        .bindPopup(popupHtml, { maxWidth: 260, minWidth: 220 })
        .addTo(markersGroup)

      marker.on('click', () => {
        focusEventCard(item.id)
      })

      validMarkers.push(marker)
    })

    // If a specific city is selected and has known coordinates, fly there
    if (cityFilter !== 'All' && CITY_COORDINATES[cityFilter]) {
      const cityCoords = CITY_COORDINATES[cityFilter]
      map.flyTo(cityCoords, 10, { duration: 1.2 })
    } else if (validMarkers.length > 0 && !userLocation && cityFilter === 'All') {
      // Keep global perspective or fit visible bounds
      map.setView([25, 10], 2)
    }
  }, [events, cityFilter, userLocation])

  // ─── Handle Geolocation GPS Request ──────────────────────────────────────
  const handleRequestLocation = () => {
    if (geoStatus === 'active') {
      // Toggle off / reset GPS
      setUserLocation(null)
      setGeoStatus('idle')
      setGeoNotice({
        text: 'GPS Radar disabled. Returned to global multiverse order.',
        type: 'info',
      })
      if (userMarkerRef.current && leafletMapRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      return
    }

    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoNotice({
        text: 'Geolocation is not supported by your browser.',
        type: 'warning',
      })
      return
    }

    setGeoStatus('locating')
    setGeoNotice({
      text: 'Acquiring satellite lock & browser location permissions...',
      type: 'info',
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation({ lat, lng })
        setGeoStatus('active')
        setGeoNotice({
          text: `GPS Locked: Sector [${lat.toFixed(3)}, ${lng.toFixed(3)}]. Events sorted by proximity to you.`,
          type: 'success',
        })

        // Add user marker to map
        const map = leafletMapRef.current
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove()
          }

          const userIcon = L.divIcon({
            className: 'custom-event-pin',
            html: `
              <div class="leaflet-user-pin" title="Your Sector Position">
                <div class="user-pin-ring"></div>
                <div class="user-pin-core"></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })

          const marker = L.marker([lat, lng], { icon: userIcon })
            .bindPopup(
              `<div style="padding: 0.5rem; text-align: center; font-weight: 800; font-size: 0.8rem; color: #38bdf8;">
                🛰️ YOUR CURRENT SECTOR<br/>
                <span style="font-size: 0.7rem; color: #94a3b8;">[${lat.toFixed(4)}, ${lng.toFixed(4)}]</span>
              </div>`,
              { minWidth: 160 }
            )
            .addTo(map)

          userMarkerRef.current = marker
          map.flyTo([lat, lng], 5, { duration: 1.5 })
        }
      },
      (geoErr) => {
        // Handle denied/unavailable gracefully
        setGeoStatus('denied')
        let msg = 'Location request failed. Showing all global events.'
        if (geoErr.code === 1 || geoErr.code === (window.GeolocationPositionError?.PERMISSION_DENIED ?? 1)) {
          msg = 'Location permission was denied. Defaulting to all global events.'
        } else if (geoErr.code === 2 || geoErr.code === (window.GeolocationPositionError?.POSITION_UNAVAILABLE ?? 2)) {
          msg = 'Location position is currently unavailable. Displaying global sectors.'
        } else if (geoErr.code === 3 || geoErr.code === (window.GeolocationPositionError?.TIMEOUT ?? 3)) {
          msg = 'Location telemetry timed out. Displaying all global events.'
        }

        setGeoNotice({
          text: msg,
          type: 'warning',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  // ─── Reset Map to Global Overview ─────────────────────────────────────────
  const handleResetMapView = () => {
    setCityFilter('All')
    setPage(1)
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([25, 10], 2)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchEvents()
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <section className="srs-section-container events-directory-view" aria-label="Global Events Registry">
      {/* Header Banner */}
      <div className="srs-header-banner">
        <div className="srs-badge-pill">
          <span className="srs-badge-dot" />
          <span>GLOBAL MULTIVERSE CONVENTIONS & EXPOS</span>
        </div>
        <h1 className="srs-main-heading">Fandom Events, Expos & Ticket Registry</h1>
        <p className="srs-main-subtext">
          Locate landmark anime conventions, gaming expos, K-Pop arena tours, comic-cons, and virtual summits around the globe.
        </p>
      </div>

      {/* Visual Interactive Map / Location Coordinates Banner */}
      <div className="events-radar-map-panel glass-panel">
        <div className="radar-grid-bg" />
        <div className="radar-sweep-scanner" />
        <div className="radar-content">
          <div className="radar-header">
            <span className="radar-ping-icon"><CompassIcon size={16} /></span>
            <span className="radar-title">GEOSPATIAL EVENT TELEMETRY // REAL INTERACTIVE RADAR</span>
            <span className="radar-status">
              {geoStatus === 'active' ? 'GPS PROXIMITY ENGAGED' : 'SATELLITE SYNC ACTIVE'}
            </span>
          </div>

          {/* City Quick Navigation Radar Beacons */}
          <div className="radar-beacons-row">
            {cities.filter((c) => c !== 'All').map((city) => (
              <button
                key={city}
                type="button"
                className={`radar-city-beacon ${cityFilter === city ? 'active' : ''}`}
                onClick={() => {
                  setCityFilter(city)
                  setPage(1)
                }}
                title={`Focus radar on ${city}`}
              >
                <span className="beacon-ring" />
                <span className="beacon-dot" />
                <span className="beacon-name">{city}</span>
              </button>
            ))}
          </div>

          {/* Real Interactive Leaflet Map Container */}
          <div className="events-map-wrapper">
            <div ref={mapContainerRef} className="events-interactive-map" />
          </div>

          {/* Radar Telemetry Action Strip */}
          <div className="radar-controls-strip">
            <div className="radar-actions-left">
              <button
                type="button"
                className={`btn-radar-gps ${geoStatus === 'active' ? 'active' : ''}`}
                onClick={handleRequestLocation}
                disabled={geoStatus === 'locating'}
                title={geoStatus === 'active' ? 'Disable GPS Proximity Sorting' : 'Find events near your physical coordinates'}
              >
                <CrosshairIcon size={14} />
                <span>
                  {geoStatus === 'locating'
                    ? 'Triangulating GPS...'
                    : geoStatus === 'active'
                    ? 'GPS Radar Active (Disable)'
                    : 'Locate Near Me (GPS)'}
                </span>
              </button>

              <button
                type="button"
                className="btn-radar-reset-view"
                onClick={handleResetMapView}
                title="Reset map view to global world perspective"
              >
                <CompassIcon size={14} />
                <span>Global Overview</span>
              </button>
            </div>

            <div className="radar-sector-coords">
              <MapPinIcon size={14} />
              <span>
                {userLocation
                  ? `USER SECTOR: ${userLocation.lat.toFixed(3)}°, ${userLocation.lng.toFixed(3)}°`
                  : cityFilter !== 'All' && CITY_COORDINATES[cityFilter]
                  ? `${cityFilter.toUpperCase()}: ${CITY_COORDINATES[cityFilter][0]}°, ${CITY_COORDINATES[cityFilter][1]}°`
                  : 'GLOBAL RADAR: LAT 25.000° N, LON 10.000° E'}
              </span>
            </div>
          </div>

          {/* Geo Notification Alert (Non-blocking, graceful) */}
          {geoNotice && (
            <div className={`events-geo-notice notice-${geoNotice.type}`} role="status">
              <span>{geoNotice.text}</span>
              <button
                type="button"
                className="notice-close-btn"
                onClick={() => setGeoNotice(null)}
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Cities & Search */}
      <div className="srs-filter-bar glass-panel">
        <div className="srs-filter-row">
          {/* City Pills */}
          <div className="srs-category-pills" role="tablist" aria-label="Filter by City">
            {cities.map((c) => (
              <button
                key={c}
                className={`srs-pill ${cityFilter === c ? 'active' : ''}`}
                onClick={() => {
                  setCityFilter(c)
                  setPage(1)
                }}
              >
                {c === 'All' ? 'All Locations' : c}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form className="srs-search-form" onSubmit={handleSearchSubmit}>
            <div className="srs-search-input-wrapper">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search events, venues..."
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
            {totalCount} global summits on radar
          </span>
        </div>

        {/* Working Event Calendar / Date Browsing Row */}
        <div className="events-calendar-row">
          <span className="events-cal-label">
            <CalendarIcon size={14} />
            <span>Event Calendar:</span>
          </span>

          <button
            type="button"
            className={`events-cal-pill ${dateFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setDateFilter('all')
              setCustomDate('')
              setPage(1)
            }}
          >
            All Dates
          </button>

          <button
            type="button"
            className={`events-cal-pill ${dateFilter === '30days' ? 'active' : ''}`}
            onClick={() => {
              setDateFilter('30days')
              setCustomDate('')
              setPage(1)
            }}
          >
            Next 30 Days
          </button>

          <button
            type="button"
            className={`events-cal-pill ${dateFilter === '2026' ? 'active' : ''}`}
            onClick={() => {
              setDateFilter('2026')
              setCustomDate('')
              setPage(1)
            }}
          >
            2026 Season
          </button>

          <button
            type="button"
            className={`events-cal-pill ${dateFilter === '2027' ? 'active' : ''}`}
            onClick={() => {
              setDateFilter('2027')
              setCustomDate('')
              setPage(1)
            }}
          >
            2027 Season
          </button>

          {/* Date Picker Input */}
          <div className="events-date-picker-wrap">
            <input
              type="date"
              className="events-date-input"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value)
                if (e.target.value) {
                  setDateFilter('custom')
                } else {
                  setDateFilter('all')
                }
                setPage(1)
              }}
              title="Filter by specific date"
            />
            {customDate && (
              <button
                type="button"
                className="srs-search-clear"
                onClick={() => {
                  setCustomDate('')
                  setDateFilter('all')
                  setPage(1)
                }}
                title="Clear date filter"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading && events.length === 0 ? (
        <div className="srs-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="srs-skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="srs-empty-box glass-panel">
          <p className="srs-error-text">{error}</p>
          <button className="srs-btn-action" onClick={fetchEvents}>Retry Connection</button>
        </div>
      ) : events.length === 0 ? (
        <div className="srs-empty-box glass-panel">
          <div className="srs-empty-icon"><CompassIcon size={40} /></div>
          <h3>No Gatherings Located in this Sector</h3>
          <p>Try switching to another city, adjusting the date calendar, or resetting filters.</p>
          <button
            className="srs-btn-action"
            onClick={() => {
              setCityFilter('All')
              setSelectedCategoryId(null)
              setDateFilter('all')
              setCustomDate('')
              setSearch('')
              setPage(1)
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="srs-cards-grid events-grid">
            {events.map((item) => {
              const isSaved = bookmarkedIds.has(item.id)
              const evDate = new Date(item.eventDate)
              const monthName = evDate.toLocaleString('default', { month: 'short' }).toUpperCase()
              const dayNum = evDate.getDate()
              const yearNum = evDate.getFullYear()
              const isHighlighted = highlightedCardId === item.id

              // Distance calculation if userLocation active
              let distanceKm: number | null = null
              const coords = parseCoordinates(item.coordinates)
              if (userLocation && coords && !(coords[0] === 0 && coords[1] === 0)) {
                distanceKm = getHaversineDistanceKm(userLocation.lat, userLocation.lng, coords[0], coords[1])
              }

              return (
                <article
                  key={item.id}
                  id={`event-card-${item.id}`}
                  className={`srs-card event-card content-card ${isHighlighted ? 'highlighted-card' : ''}`}
                >
                  {/* Media Wrap with Date Chip Overlay */}
                  <div className="srs-card-media-wrap">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="srs-card-img"
                      loading="lazy"
                    />

                    {/* Date Calendar Badge - Clickable to filter by year */}
                    <button
                      type="button"
                      className="event-calendar-badge"
                      title={`Filter by ${yearNum} Season`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setDateFilter(yearNum.toString())
                        setPage(1)
                      }}
                    >
                      <span className="cal-month">{monthName}</span>
                      <span className="cal-day">{dayNum}</span>
                      <span className="cal-year">{yearNum}</span>
                    </button>

                    <div className="srs-card-badge-group">
                      <span className={`srs-tag-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="srs-card-body">
                    <div className="srs-card-meta-line">
                      <span className="srs-meta-category">{item.categoryName}</span>
                      <span className="srs-meta-universe">{item.fandomUniverse}</span>
                    </div>

                    <h3 className="srs-card-title">{item.title}</h3>

                    {/* Venue & Geolocation Coordinates */}
                    <div className="event-venue-block">
                      <div className="event-location-row">
                        <span className="event-city-tag">{item.city}</span>
                        <span className="event-venue-name">{item.venue}</span>
                      </div>
                      <div className="event-coords-line">
                        <CompassIcon size={12} />
                        <span>GPS: {item.coordinates}</span>
                        {distanceKm !== null && (
                          <span className="event-distance-badge" title="Distance from your current GPS location">
                            📍 {distanceKm.toLocaleString()} km away
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="srs-card-description">{item.description}</p>

                    {/* Card Actions */}
                    <div className="srs-card-footer">
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
                        title={isSaved ? 'Event Saved' : 'Save Event'}
                        aria-label={isSaved ? 'Event Saved' : 'Save Event'}
                      >
                        <StarIcon size={14} fill={isSaved ? 'currentColor' : 'none'} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      {item.ticketUrl && (
                        <a
                          href={item.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-external-ticket btn-ticket-external"
                          title="Open official event pass ticket portal in new tab"
                        >
                          <span>Get Passes & Tickets</span>
                          <span className="external-arrow">↗</span>
                        </a>
                      )}
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
