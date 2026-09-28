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

// ─── Character Types ────────────────────────────────────────────────────────
export interface Character {
  id: number
  categoryId: number
  categoryName: string
  name: string
  fandomUniverse: string
  roleTitle: string
  bio: string
  abilities: string
  backstory: string
  avatarUrl: string
  bannerUrl: string
  originUniverse: string
  voiceActor: string
  popularityScore: number
  createdAt: string
  updatedAt: string
}

export interface CharacterFormData {
  categoryId: number
  name: string
  fandomUniverse: string
  roleTitle: string
  bio: string
  abilities: string
  backstory: string
  avatarUrl: string
  bannerUrl: string
  originUniverse: string
  voiceActor: string
  popularityScore: number
}

// ─── Media Types ────────────────────────────────────────────────────────────
export interface MediaItem {
  id: number
  categoryId: number
  categoryName: string
  title: string
  fandomUniverse: string
  mediaType: 'Video' | 'Audio' | string
  mediaUrl: string
  thumbnailUrl: string
  description: string
  tags: string
  durationSeconds: number
  averageRating: number
  ratingsCount: number
  userRating?: number | null
  createdAt: string
}

export interface MediaFormData {
  categoryId: number
  title: string
  fandomUniverse: string
  mediaType: string
  mediaUrl: string
  thumbnailUrl: string
  description: string
  tags: string
  durationSeconds: number
}

// ─── Bookmark Types ─────────────────────────────────────────────────────────
export interface Bookmark {
  id: number
  itemType: 'Content' | 'Character' | 'Media' | string
  itemId: number
  itemTitle: string
  itemSubtitle: string
  itemImageUrl: string
  createdAt: string
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
  favoriteCategories?: string[]
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
  displayName?: string
  bio?: string
  avatarUrl?: string
  favoriteCategory?: string
  favoriteCategories?: string[]
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

// ─── Admin Feature Types ───────────────────────────────────────────────────
export interface FanSubmission {
  id: number
  title: string
  authorName: string
  authorEmail?: string | null
  userId?: number | null
  categoryId: number
  categoryName: string
  fandomUniverse: string
  submissionType: string
  contentText: string
  mediaUrl?: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | string
  adminNotes?: string | null
  submittedAt: string
  reviewedAt?: string | null
}

export interface FeedbackItem {
  id: number
  feedbackType: 'Bug' | 'Suggestion' | 'Query' | string
  subject: string
  message: string
  userEmail?: string | null
  userName?: string | null
  status: 'Open' | 'In Review' | 'Resolved' | string
  createdAt: string
}

export interface AdminUser {
  id: number
  username: string
  email: string
  displayName: string
  role: 'Admin' | 'User'
  avatarUrl?: string | null
  favoriteCategory?: string | null
  bookmarksCount: number
  createdAt: string
}

export interface CategoryAnalytics {
  categoryId: number
  categoryName: string
  slug: string
  contentCount: number
  characterCount: number
  mediaCount: number
  totalItems: number
}

export interface PopularItemAnalytics {
  id: number
  title: string
  categoryName: string
  type: string
  popularity: number
}

export interface FandomPopularity {
  fandomUniverse: string
  itemCount: number
  averagePopularity: number
  primaryCategory: string
}

export interface AdminAnalytics {
  totalUsers: number
  activeUsers: number
  totalContent: number
  totalCharacters: number
  totalMedia: number
  totalSubmissions: number
  pendingSubmissions: number
  totalFeedback: number
  openFeedback: number
  totalBookmarks: number
  categoryStats: CategoryAnalytics[]
  contentTypeBreakdown: Record<string, number>
  feedbackTypeBreakdown: Record<string, number>
  topPopularItems: PopularItemAnalytics[]
  bookmarkTypeBreakdown?: Record<string, number>
  popularFandoms?: FandomPopularity[]
}

// ─── Merchandise Types ──────────────────────────────────────────────────────
export interface MerchandiseItem {
  id: number
  name: string
  fandomUniverse: string
  categoryId: number
  categoryName: string
  price: number
  currency: string
  imageUrl: string
  tag: string // Limited Edition, Pre-Order, Collectible, Official Artifact
  description: string
  stockStatus: string // In Stock, Pre-Order, Limited Stock
  createdAt: string
}

// ─── Upcoming Release Types ─────────────────────────────────────────────────
export interface UpcomingRelease {
  id: number
  title: string
  fandomUniverse: string
  categoryId: number
  categoryName: string
  mediaType: string // Anime, Gaming, Movies, TV Shows, Comics, Merchandise
  releaseDate: string
  releaseWindow: string
  platform: string
  thumbnailUrl: string
  synopsis: string
  hypeScore: number
}

// ─── Event Types ────────────────────────────────────────────────────────────
export interface EventItem {
  id: number
  title: string
  fandomUniverse: string
  categoryId: number
  categoryName: string
  city: string // Tokyo, Los Angeles, Seoul, London, Paris, New York, Online
  venue: string
  coordinates: string
  eventDate: string
  endDate?: string | null
  thumbnailUrl: string
  description: string
  ticketUrl: string
  status: string // Tickets Available, Selling Fast, Free Entry, Virtual Stream
}

export interface FanSubmissionFormData {
  title: string
  authorName?: string
  authorEmail?: string
  categoryId: number
  fandomUniverse: string
  submissionType: string
  contentText: string
  mediaUrl?: string
}

export interface FeedbackFormData {
  feedbackType: 'Bug' | 'Suggestion' | 'Query' | string
  subject: string
  message: string
  userEmail?: string
  userName?: string
}

export type NavView =
  | 'discover'
  | 'home'
  | 'explore'
  | 'characters'
  | 'media'
  | 'merchandise'
  | 'releases'
  | 'events'
  | 'sitemap'
  | 'feedback'
  | 'profile'
  | 'dashboard'
  | 'submissions'
  | 'admin'

export interface UserActivityItem {
  id: string
  activityType: 'Bookmark' | 'Rating' | 'Submission' | string
  actionText: string
  itemType: string
  targetId: number
  targetTitle: string
  targetSubtitle?: string | null
  imageUrl?: string | null
  details?: string | null
  timestamp: string
}



