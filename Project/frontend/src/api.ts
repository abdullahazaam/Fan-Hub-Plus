import type { Category, ContentFormData, ContentItem, PagedResult } from './types'

const BASE_URL = ''

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`
    try {
      const errorJson = await res.json()
      if (errorJson?.message) errorMsg = errorJson.message
    } catch {
      // ignore
    }
    throw new Error(errorMsg)
  }
  return res.json()
}

export async function getHealth(): Promise<{ status: string; service: string; database?: string; version: string }> {
  const res = await fetch(`${BASE_URL}/api/health`)
  return handleResponse(res)
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories`)
  return handleResponse(res)
}

export async function getContentList(params: {
  search?: string
  categoryId?: number
  contentType?: string
  sortBy?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<ContentItem>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.contentType && params.contentType !== 'All') query.set('contentType', params.contentType)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())

  const res = await fetch(`${BASE_URL}/api/content?${query.toString()}`)
  return handleResponse(res)
}

export async function getContentById(id: number): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`)
  return handleResponse(res)
}

export async function createContent(data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateContent(id: number, data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteContent(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error(`Failed to delete item: ${res.statusText}`)
  }
}
