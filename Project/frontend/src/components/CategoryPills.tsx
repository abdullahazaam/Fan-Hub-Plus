import React from 'react'
import type { Category } from '../types'

interface CategoryPillsProps {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
  totalCount: number
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalCount,
}) => {
  return (
    <div className="categories-strip-container">
      <div className="categories-strip">
        <button
          className={`pill-btn ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <span className="pill-name">All Universes</span>
          <span className="pill-badge">{totalCount}</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id
          return (
            <button
              key={cat.id}
              className={`pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="pill-name">{cat.name}</span>
              {cat.itemCount > 0 && <span className="pill-badge">{cat.itemCount}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
