import React from 'react'
import { CloseIcon } from './Icons'

interface SearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  contentType: string
  onContentTypeChange: (val: string) => void
  genre: string
  onGenreChange: (val: string) => void
  releaseYear: number | undefined
  onReleaseYearChange: (val: number | undefined) => void
  minPopularity: number | undefined
  onMinPopularityChange: (val: number | undefined) => void
  sortBy: string
  onSortByChange: (val: string) => void
  resultsCount: number
  onResetFilters: () => void
}

const POPULAR_GENRES = [
  'All',
  'Sci-Fi',
  'Cyberpunk',
  'Shonen',
  'Animation',
  'RPG',
  'Worldbuilding',
  'Sorcery',
  'Soundtrack',
  'Comics',
  'Cosplay',
]

const YEARS = [2026, 2025, 2024, 2023, 2022, 2020]

export const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  contentType,
  onContentTypeChange,
  genre,
  onGenreChange,
  releaseYear,
  onReleaseYearChange,
  minPopularity,
  onMinPopularityChange,
  sortBy,
  onSortByChange,
  resultsCount,
  onResetFilters,
}) => {
  const hasActiveFilters =
    search.trim().length > 0 ||
    contentType !== 'All' ||
    genre !== 'All' ||
    releaseYear !== undefined ||
    minPopularity !== undefined ||
    sortBy !== 'popular'

  return (
    <div className="search-control-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, universe (Cyberpunk, Jujutsu...), or lore tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button className="clear-search-btn" onClick={() => onSearchChange('')} aria-label="Clear search">
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      <div className="filter-dropdowns">
        {/* Content Type */}
        <div className="select-wrapper">
          <label htmlFor="filter-type">Type:</label>
          <select
            id="filter-type"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Article">Articles</option>
            <option value="Video">Videos</option>
            <option value="Audio">Audio</option>
            <option value="Image">Cosplay / Images</option>
          </select>
        </div>

        {/* Genre / Tag */}
        <div className="select-wrapper">
          <label htmlFor="filter-genre">Genre:</label>
          <select
            id="filter-genre"
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            {POPULAR_GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Release Year */}
        <div className="select-wrapper">
          <label htmlFor="filter-year">Year:</label>
          <select
            id="filter-year"
            value={releaseYear ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : undefined
              onReleaseYearChange(val)
            }}
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Min Popularity */}
        <div className="select-wrapper">
          <label htmlFor="filter-pop">Min Rating:</label>
          <select
            id="filter-pop"
            value={minPopularity ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : undefined
              onMinPopularityChange(val)
            }}
          >
            <option value="">Any Score</option>
            <option value="90">90%+ Score</option>
            <option value="95">95%+ Score</option>
          </select>
        </div>

        {/* Sort */}
        <div className="select-wrapper">
          <label htmlFor="filter-sort">Sort:</label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="latest">Newest First</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="btn-filter-reset" onClick={onResetFilters} title="Reset all search filters">
            Reset
          </button>
        )}

        <div className="results-badge">
          <span>{resultsCount} {resultsCount === 1 ? 'item' : 'items'}</span>
        </div>
      </div>
    </div>
  )
}
