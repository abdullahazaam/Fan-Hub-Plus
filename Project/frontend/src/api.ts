import type {
  AuthResponse,
  Category,
  ContentFormData,
  ContentItem,
  ForgotPasswordForm,
  ForgotPasswordResponse,
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

// ─── Admin Content API (requires Admin JWT) ─────────────────────────────────
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

// Re-export legacy alias used by older components
export const api = {
  getHealth,
  getCategories,
  getContentList,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
}
