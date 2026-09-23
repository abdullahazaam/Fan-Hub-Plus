import React from 'react'

interface SearchBarProps {
  search: string
  onSearchChange: (val: string) => void
  contentType: string
  onContentTypeChange: (val: string) => void
  sortBy: string
  onSortByChange: (val: string) => void
  resultsCount: number
}

export const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  contentType,
  onContentTypeChange,
  sortBy,
  onSortByChange,
  resultsCount,
}) => {
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
          placeholder="Search by title, fandom universe (e.g. Cyberpunk, Jujutsu), or tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button className="clear-search-btn" onClick={() => onSearchChange('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      <div className="filter-dropdowns">
        <div className="select-wrapper">
          <label htmlFor="filter-type">Type:</label>
          <select
            id="filter-type"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Article">Articles</option>
            <option value="Video">Videos / Trailers</option>
            <option value="Audio">Audio / OST</option>
            <option value="Image">Cosplay / Images</option>
          </select>
        </div>

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

        <div className="results-badge">
          <span>{resultsCount} {resultsCount === 1 ? 'item' : 'items'} found</span>
        </div>
      </div>
    </div>
  )
}
