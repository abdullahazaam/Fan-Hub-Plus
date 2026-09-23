// ─── Content Types ─────────────────────────────────────────────────────────
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

// ─── Auth & User Types ──────────────────────────────────────────────────────
export interface AuthUser {
  userId: number
  email: string
  username: string
  role: 'Admin' | 'User'
  displayName: string
  avatarUrl: string
}

export interface UserProfile {
  id: number
  email: string
  username: string
  role: 'Admin' | 'User'
  displayName: string
  bio: string
  avatarUrl: string
  favoriteCategory: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  role: 'Admin' | 'User'
  userId: number
  email: string
  username: string
  displayName: string
  avatarUrl: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  displayName: string
}

export interface ProfileUpdateForm {
  displayName: string
  bio: string
  avatarUrl: string
  favoriteCategory: string
}

export interface ForgotPasswordForm {
  email: string
}

export interface ResetPasswordForm {
  token: string
  newPassword: string
}

export interface ForgotPasswordResponse {
  message: string
  // Present only in Development environment:
  devNotice?: string
  devResetToken?: string
  devExpiresAt?: string
}
