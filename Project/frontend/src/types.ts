export interface Category {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  displayOrder: number
  itemCount: number
}

export interface ContentItem {
  id: number
  categoryId: number
  categoryName: string
  categorySlug: string
  title: string
  fandomUniverse: string
  contentType: 'Article' | 'Video' | 'Audio' | 'Image' | string
  description: string
  contentText: string
  thumbnailUrl: string
  mediaUrl: string
  author: string
  tags: string
  popularityScore: number
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface ContentFormData {
  categoryId: number
  title: string
  fandomUniverse: string
  contentType: string
  description: string
  contentText: string
  thumbnailUrl: string
  mediaUrl: string
  author: string
  tags: string
  popularityScore: number
  releaseDate: string
}
