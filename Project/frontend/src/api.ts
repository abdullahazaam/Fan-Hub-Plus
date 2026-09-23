import type {
  AuthResponse,
  Bookmark,
  Category,
  Character,
  CharacterFormData,
  ContentFormData,
  ContentItem,
  ForgotPasswordForm,
  ForgotPasswordResponse,
  MediaFormData,
  MediaItem,
  PagedResult,
  ProfileUpdateForm,
  RegisterForm,
  ResetPasswordForm,
  UserProfile,
} from './types'

const BASE_URL = ''

// Token storage key
const TOKEN_KEY = 'fhp_auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────
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

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Public Content API ─────────────────────────────────────────────────────
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
  genre?: string
  releaseYear?: number
  minPopularity?: number
  sortBy?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<ContentItem>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.contentType && params.contentType !== 'All') query.set('contentType', params.contentType)
  if (params.genre && params.genre !== 'All') query.set('genre', params.genre)
  if (params.releaseYear && params.releaseYear > 0) query.set('releaseYear', params.releaseYear.toString())
  if (params.minPopularity && params.minPopularity > 0) query.set('minPopularity', params.minPopularity.toString())
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

// ─── Admin Content API ───────────────────────────────────────────────────────
export async function createContent(data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateContent(id: number, data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteContent(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to delete item: ${res.status} ${res.statusText}`)
  }
}

// ─── Characters API ──────────────────────────────────────────────────────────
export async function getCharacters(params: {
  search?: string
  categoryId?: number
  sortBy?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<Character>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  const res = await fetch(`${BASE_URL}/api/characters?${query.toString()}`)
  return handleResponse(res)
}

export async function getCharacterById(id: number): Promise<Character> {
  const res = await fetch(`${BASE_URL}/api/characters/${id}`)
  return handleResponse(res)
}

export async function createCharacter(data: CharacterFormData): Promise<Character> {
  const res = await fetch(`${BASE_URL}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateCharacter(id: number, data: CharacterFormData): Promise<Character> {
  const res = await fetch(`${BASE_URL}/api/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteCharacter(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/characters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete character: ${res.status}`)
}

// ─── Multimedia API ─────────────────────────────────────────────────────────
export async function getMediaList(params: {
  mediaType?: string
  categoryId?: number
  search?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<MediaItem>> {
  const query = new URLSearchParams()
  if (params.mediaType && params.mediaType !== 'All') query.set('mediaType', params.mediaType)
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  const res = await fetch(`${BASE_URL}/api/media?${query.toString()}`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function rateMedia(id: number, score: number): Promise<{
  mediaItemId: number
  userRating: number
  averageRating: number
  ratingsCount: number
}> {
  const res = await fetch(`${BASE_URL}/api/media/${id}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ score }),
  })
  return handleResponse(res)
}

export async function createMedia(data: MediaFormData): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateMedia(id: number, data: MediaFormData): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/api/media/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteMedia(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/media/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete media item: ${res.status}`)
}

// ─── Bookmarks API ──────────────────────────────────────────────────────────
export async function getBookmarks(): Promise<Bookmark[]> {
  const res = await fetch(`${BASE_URL}/api/bookmarks`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function addBookmark(dto: {
  itemType: string
  itemId: number
  itemTitle: string
  itemSubtitle: string
  itemImageUrl: string
}): Promise<Bookmark> {
  const res = await fetch(`${BASE_URL}/api/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(dto),
  })
  return handleResponse(res)
}

export async function removeBookmark(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/bookmarks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to remove bookmark: ${res.status}`)
}

export async function removeBookmarkByItem(itemType: string, itemId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/bookmarks/item/${itemType}/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok && res.status !== 404) throw new Error(`Failed to remove bookmark: ${res.status}`)
}

// ─── Auth API ───────────────────────────────────────────────────────────────
export async function apiRegister(form: RegisterForm): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  return handleResponse(res)
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function apiGetMe(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function apiForgotPassword(form: ForgotPasswordForm): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  return handleResponse(res)
}

export async function apiResetPassword(form: ResetPasswordForm): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  return handleResponse(res)
}

// ─── Profile API ─────────────────────────────────────────────────────────────
export async function apiGetProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function apiUpdateProfile(form: ProfileUpdateForm): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(form),
  })
  return handleResponse(res)
}

// Legacy object alias
export const api = {
  getHealth,
  getCategories,
  getContentList,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
}
