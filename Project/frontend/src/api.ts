import type {
  AdminAnalytics,
  AdminUser,
  AuthResponse,
  Bookmark,
  Category,
  Character,
  CharacterFormData,
  ContentFormData,
  ContentItem,
  EventItem,
  FanSubmission,
  FanSubmissionFormData,
  FeedbackFormData,
  FeedbackItem,
  ForgotPasswordForm,
  ForgotPasswordResponse,
  MediaFormData,
  MediaItem,
  MerchandiseItem,
  PagedResult,
  ProfileUpdateForm,
  RegisterForm,
  ResetPasswordForm,
  UpcomingRelease,
  UserActivityItem,
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

// ─── High-Performance Client-Side Caching & In-Flight Deduplication ─────────
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const apiCache = new Map<string, CacheEntry<unknown>>()
const inFlightRequests = new Map<string, Promise<unknown>>()

export interface CacheFetchOptions {
  ttlMs?: number
  forceRefresh?: boolean
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    apiCache.clear()
    return
  }
  for (const key of Array.from(apiCache.keys())) {
    if (key.startsWith(prefix) || key.includes(`:${prefix}`)) {
      apiCache.delete(key)
    }
  }
}

export async function cachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: CacheFetchOptions = {}
): Promise<T> {
  const { ttlMs = 180000, forceRefresh = false } = options
  const now = Date.now()

  if (!forceRefresh) {
    const entry = apiCache.get(cacheKey) as CacheEntry<T> | undefined
    if (entry && now - entry.timestamp < entry.ttl) {
      return entry.data
    }
  }

  // Deduplicate identical in-flight requests
  const inFlight = inFlightRequests.get(cacheKey) as Promise<T> | undefined
  if (inFlight) {
    return inFlight
  }

  const promise = fetcher()
    .then((result) => {
      apiCache.set(cacheKey, { data: result, timestamp: Date.now(), ttl: ttlMs })
      inFlightRequests.delete(cacheKey)
      return result
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey)
      throw err
    })

  inFlightRequests.set(cacheKey, promise as Promise<unknown>)
  return promise
}

// Prefetch catalogs for instant navigation
export function prefetchCatalog(): void {
  try {
    // Schedule prefetch on next idle frame to avoid blocking initial render
    const runPrefetch = () => {
      getCategories().catch(() => {})
      getContentList({ page: 1, pageSize: 12 }).catch(() => {})
      getCharacters({ page: 1, pageSize: 12 }).catch(() => {})
      getMediaList({ page: 1, pageSize: 12 }).catch(() => {})
      getEvents({ page: 1, pageSize: 12 }).catch(() => {})
      getUpcomingReleases({ page: 1, pageSize: 12 }).catch(() => {})
      getMerchandise({ page: 1, pageSize: 12 }).catch(() => {})
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => runPrefetch(), { timeout: 1500 })
    } else {
      setTimeout(runPrefetch, 250)
    }
  } catch {
    // ignore
  }
}


// ─── Public Content API ─────────────────────────────────────────────────────
export async function getHealth(): Promise<{ status: string; service: string; database?: string; version: string }> {
  const res = await fetch(`${BASE_URL}/api/health`)
  return handleResponse(res)
}

export async function getCategories(): Promise<Category[]> {
  return cachedFetch('categories', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`)
    return handleResponse<Category[]>(res)
  }, { ttlMs: 300000 })
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

  const cacheKey = `content:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/content?${query.toString()}`)
    return handleResponse<PagedResult<ContentItem>>(res)
  }, { ttlMs: 180000 })
}

export async function getContentById(id: number): Promise<ContentItem> {
  return cachedFetch(`content:id:${id}`, async () => {
    const res = await fetch(`${BASE_URL}/api/content/${id}`)
    return handleResponse<ContentItem>(res)
  }, { ttlMs: 300000 })
}

// ─── Admin Content API ───────────────────────────────────────────────────────
export async function createContent(data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const created = await handleResponse<ContentItem>(res)
  invalidateApiCache('content')
  invalidateApiCache('categories')
  invalidateApiCache('admin')
  return created
}

export async function updateContent(id: number, data: ContentFormData): Promise<ContentItem> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const updated = await handleResponse<ContentItem>(res)
  invalidateApiCache('content')
  invalidateApiCache('categories')
  invalidateApiCache('admin')
  return updated
}

export async function deleteContent(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/content/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Failed to delete item: ${res.status} ${res.statusText}`)
  }
  invalidateApiCache('content')
  invalidateApiCache('categories')
  invalidateApiCache('admin')
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

  const cacheKey = `characters:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/characters?${query.toString()}`)
    return handleResponse<PagedResult<Character>>(res)
  }, { ttlMs: 180000 })
}

export async function getCharacterById(id: number): Promise<Character> {
  return cachedFetch(`characters:id:${id}`, async () => {
    const res = await fetch(`${BASE_URL}/api/characters/${id}`)
    return handleResponse<Character>(res)
  }, { ttlMs: 300000 })
}

export async function createCharacter(data: CharacterFormData): Promise<Character> {
  const res = await fetch(`${BASE_URL}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const created = await handleResponse<Character>(res)
  invalidateApiCache('characters')
  invalidateApiCache('admin')
  return created
}

export async function updateCharacter(id: number, data: CharacterFormData): Promise<Character> {
  const res = await fetch(`${BASE_URL}/api/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const updated = await handleResponse<Character>(res)
  invalidateApiCache('characters')
  invalidateApiCache('admin')
  return updated
}

export async function deleteCharacter(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/characters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete character: ${res.status}`)
  invalidateApiCache('characters')
  invalidateApiCache('admin')
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

  const token = getStoredToken() || 'anon'
  const cacheKey = `media:${token}:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/media?${query.toString()}`, {
      headers: authHeaders(),
    })
    return handleResponse<PagedResult<MediaItem>>(res)
  }, { ttlMs: 180000 })
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
  const rated = await handleResponse<{
    mediaItemId: number
    userRating: number
    averageRating: number
    ratingsCount: number
  }>(res)
  invalidateApiCache('media')
  return rated
}

export async function createMedia(data: MediaFormData): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const created = await handleResponse<MediaItem>(res)
  invalidateApiCache('media')
  invalidateApiCache('admin')
  return created
}

export async function updateMedia(id: number, data: MediaFormData): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/api/media/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const updated = await handleResponse<MediaItem>(res)
  invalidateApiCache('media')
  invalidateApiCache('admin')
  return updated
}

export async function deleteMedia(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/media/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete media item: ${res.status}`)
  invalidateApiCache('media')
  invalidateApiCache('admin')
}

// ─── Bookmarks API ──────────────────────────────────────────────────────────
export async function getBookmarks(): Promise<Bookmark[]> {
  const token = getStoredToken()
  if (!token) return []
  return cachedFetch(`bookmarks:${token}`, async () => {
    const res = await fetch(`${BASE_URL}/api/bookmarks`, {
      headers: authHeaders(),
    })
    return handleResponse<Bookmark[]>(res)
  }, { ttlMs: 60000 })
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
  const bmark = await handleResponse<Bookmark>(res)
  invalidateApiCache('bookmarks')
  invalidateApiCache('admin')
  return bmark
}

export async function removeBookmark(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/bookmarks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to remove bookmark: ${res.status}`)
  invalidateApiCache('bookmarks')
  invalidateApiCache('admin')
}

export async function removeBookmarkByItem(itemType: string, itemId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/bookmarks/item/${itemType}/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok && res.status !== 404) throw new Error(`Failed to remove bookmark: ${res.status}`)
  invalidateApiCache('bookmarks')
  invalidateApiCache('admin')
}

// ─── Auth API ───────────────────────────────────────────────────────────────
export async function apiRegister(form: RegisterForm): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  invalidateApiCache()
  return handleResponse(res)
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  invalidateApiCache()
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

// ─── Admin Fan Submissions API ──────────────────────────────────────────────
export async function getAdminSubmissions(params: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<FanSubmission>> {
  const query = new URLSearchParams()
  if (params.status && params.status !== 'All') query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  const cacheKey = `admin:submissions:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/submissions?${query.toString()}`, {
      headers: authHeaders(),
    })
    return handleResponse<PagedResult<FanSubmission>>(res)
  }, { ttlMs: 30000 })
}

export async function getAdminSubmissionById(id: number): Promise<FanSubmission> {
  const res = await fetch(`${BASE_URL}/api/admin/submissions/${id}`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function updateSubmissionStatus(id: number, data: {
  status: string
  adminNotes?: string
  publishToContent?: boolean
}): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/submissions/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const result = await handleResponse<{ message: string }>(res)
  invalidateApiCache('submissions')
  invalidateApiCache('user_submissions')
  invalidateApiCache('content')
  invalidateApiCache('admin')
  return result
}

export async function deleteSubmission(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/submissions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete submission: ${res.status}`)
  invalidateApiCache('submissions')
  invalidateApiCache('user_submissions')
  invalidateApiCache('admin')
}

// ─── Admin Feedback API ─────────────────────────────────────────────────────
export async function getAdminFeedback(params: {
  type?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<FeedbackItem>> {
  const query = new URLSearchParams()
  if (params.type && params.type !== 'All') query.set('type', params.type)
  if (params.status && params.status !== 'All') query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  const cacheKey = `admin:feedback:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/feedback?${query.toString()}`, {
      headers: authHeaders(),
    })
    return handleResponse<PagedResult<FeedbackItem>>(res)
  }, { ttlMs: 30000 })
}

export async function updateFeedbackStatus(id: number, status: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/feedback/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  const result = await handleResponse<{ message: string }>(res)
  invalidateApiCache('feedback')
  invalidateApiCache('admin')
  return result
}

export async function deleteFeedback(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/feedback/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete feedback: ${res.status}`)
  invalidateApiCache('feedback')
  invalidateApiCache('admin')
}

export async function submitFeedback(data: FeedbackFormData): Promise<FeedbackItem> {
  const res = await fetch(`${BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await handleResponse<FeedbackItem>(res)
  invalidateApiCache('feedback')
  invalidateApiCache('admin')
  return result
}

// ─── Admin Users API ────────────────────────────────────────────────────────
export async function getAdminUsers(params: {
  search?: string
  role?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<AdminUser>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.role && params.role !== 'All') query.set('roleFilter', params.role)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  const cacheKey = `admin:users:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users?${query.toString()}`, {
      headers: authHeaders(),
    })
    return handleResponse<PagedResult<AdminUser>>(res)
  }, { ttlMs: 30000 })
}

export async function updateUserRole(id: number, role: 'Admin' | 'User'): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  })
  const result = await handleResponse<{ message: string }>(res)
  invalidateApiCache('users')
  invalidateApiCache('admin')
  return result
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null)
    throw new Error(errorJson?.message || `Failed to delete user: ${res.status}`)
  }
  invalidateApiCache('users')
  invalidateApiCache('admin')
}

// ─── Admin Analytics API ────────────────────────────────────────────────────
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const token = getStoredToken() || 'anon'
  return cachedFetch(`admin:analytics:${token}`, async () => {
    const res = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: authHeaders(),
    })
    return handleResponse<AdminAnalytics>(res)
  }, { ttlMs: 15000 })
}

// ─── User Fan Submissions API ───────────────────────────────────────────────
export async function submitFanContent(data: FanSubmissionFormData): Promise<FanSubmission> {
  const res = await fetch(`${BASE_URL}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const result = await handleResponse<FanSubmission>(res)
  invalidateApiCache('submissions')
  invalidateApiCache('user_submissions')
  invalidateApiCache('admin')
  return result
}

export async function getUserSubmissions(): Promise<FanSubmission[]> {
  const token = getStoredToken()
  if (!token) return []
  return cachedFetch(`user_submissions:${token}`, async () => {
    const res = await fetch(`${BASE_URL}/api/user/submissions`, {
      headers: authHeaders(),
    })
    return handleResponse<FanSubmission[]>(res)
  }, { ttlMs: 30000 })
}

export async function getUserActivity(): Promise<UserActivityItem[]> {
  const token = getStoredToken()
  if (!token) return []
  const res = await fetch(`${BASE_URL}/api/user/activity`, {
    headers: authHeaders(),
  })
  return handleResponse<UserActivityItem[]>(res)
}


// ─── Merchandise API ────────────────────────────────────────────────────────
export async function getMerchandise(params: {
  categoryId?: number
  tag?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<MerchandiseItem>> {
  const query = new URLSearchParams()
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.tag && params.tag !== 'All') query.set('tag', params.tag)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())

  const cacheKey = `merchandise:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/merchandise?${query.toString()}`)
    return handleResponse<PagedResult<MerchandiseItem>>(res)
  }, { ttlMs: 180000 })
}

export async function getMerchandiseById(id: number): Promise<MerchandiseItem> {
  return cachedFetch(`merchandise:id:${id}`, async () => {
    const res = await getMerchandise({ page: 1, pageSize: 48 })
    const found = res.items.find(item => item.id === id)
    if (!found) {
      throw new Error(`Merchandise artifact #${id} could not be found.`)
    }
    return found
  }, { ttlMs: 180000 })
}

// ─── Upcoming Releases API ──────────────────────────────────────────────────
export async function getUpcomingReleases(params: {
  categoryId?: number
  mediaType?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<UpcomingRelease>> {
  const query = new URLSearchParams()
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.mediaType && params.mediaType !== 'All') query.set('mediaType', params.mediaType)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())

  const cacheKey = `releases:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/releases?${query.toString()}`)
    return handleResponse<PagedResult<UpcomingRelease>>(res)
  }, { ttlMs: 180000 })
}

// ─── Events API ─────────────────────────────────────────────────────────────
export async function getEvents(params: {
  city?: string
  categoryId?: number
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<EventItem>> {
  const query = new URLSearchParams()
  if (params.city && params.city !== 'All') query.set('city', params.city)
  if (params.categoryId && params.categoryId > 0) query.set('categoryId', params.categoryId.toString())
  if (params.search) query.set('search', params.search)
  if (params.dateFrom) query.set('dateFrom', params.dateFrom)
  if (params.dateTo) query.set('dateTo', params.dateTo)
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())

  const cacheKey = `events:${query.toString()}`
  return cachedFetch(cacheKey, async () => {
    const res = await fetch(`${BASE_URL}/api/events?${query.toString()}`)
    return handleResponse<PagedResult<EventItem>>(res)
  }, { ttlMs: 180000 })
}

// Re-export profile update alias for convenience
export const updateProfile = apiUpdateProfile

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


// Detail routes resolve against the existing paginated multimedia API.
export async function getMediaCatalog(): Promise<MediaItem[]> {
  const first = await getMediaList({page:1,pageSize:12})
  const pages = Math.ceil(first.totalCount / (first.pageSize || 12))
  const rest = await Promise.all(Array.from({length:Math.max(0,pages-1)},(_,index)=>getMediaList({page:index+2,pageSize:12})))
  return [first,...rest].flatMap(page=>page.items)
}
