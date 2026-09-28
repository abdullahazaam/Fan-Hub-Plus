import React, { useEffect, useState } from 'react'
import * as api from '../api'
import {
  AlertTriangleIcon,
  BarChartIcon,
  BookmarkIcon,
  BugIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  HelpCircleIcon,
  InboxIcon,
  LightbulbIcon,
  MessageSquareIcon,
  MusicIcon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  VideoIcon,
} from './Icons'
import type {
  AdminAnalytics,
  AdminUser,
  Category,
  Character,
  ContentItem,
  FanSubmission,
  FeedbackItem,
  MediaItem,
} from '../types'

interface AdminConsoleProps {
  onOpenCreateContent: () => void
  onOpenCreateCharacter: () => void
  onOpenCreateMedia: () => void
  totalContent: number
  totalCharacters: number
  totalMedia: number
  categories: Category[]
  onViewContent: (item: ContentItem) => void
  onEditContent: (item: ContentItem) => void
  onDeleteContent: (id: number) => Promise<void>
  onViewCharacter: (char: Character) => void
  onEditCharacter: (char: Character) => void
  onDeleteCharacter: (id: number) => Promise<void>
  onEditMedia: (media: MediaItem) => void
  onDeleteMedia: (id: number) => Promise<void>
  refreshTrigger?: number
}

interface DeleteTarget {
  type: 'content' | 'character' | 'media' | 'submission' | 'feedback' | 'user'
  id: number
  title: string
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onOpenCreateContent,
  onOpenCreateCharacter,
  onOpenCreateMedia,
  totalContent,
  totalCharacters,
  totalMedia,
  categories,
  onViewContent,
  onEditContent,
  onDeleteContent,
  onViewCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onEditMedia,
  onDeleteMedia,
  refreshTrigger = 0,
}) => {
  // Navigation tabs: 'content' | 'characters' | 'media' | 'submissions' | 'feedback' | 'users' | 'analytics' | 'all'
  const [activeTab, setActiveTab] = useState<
    'content' | 'characters' | 'media' | 'submissions' | 'feedback' | 'users' | 'analytics' | 'all'
  >('content')

  // 1. Fandom Chronicles state
  const [contentList, setContentList] = useState<ContentItem[]>([])
  const [contentTotal, setContentTotal] = useState<number>(totalContent)
  const [contentPage, setContentPage] = useState<number>(1)
  const [contentSearch, setContentSearch] = useState<string>('')
  const [contentCategory, setContentCategory] = useState<number | undefined>(undefined)
  const [contentLoading, setContentLoading] = useState<boolean>(false)

  // 2. Character Dossiers state
  const [characterList, setCharacterList] = useState<Character[]>([])
  const [characterTotal, setCharacterTotal] = useState<number>(totalCharacters)
  const [charPage, setCharPage] = useState<number>(1)
  const [charSearch, setCharSearch] = useState<string>('')
  const [charCategory, setCharCategory] = useState<number | undefined>(undefined)
  const [charLoading, setCharLoading] = useState<boolean>(false)

  // 3. Multimedia Streams state
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [mediaTotalCount, setMediaTotalCount] = useState<number>(totalMedia)
  const [mediaPageNum, setMediaPageNum] = useState<number>(1)
  const [mediaSearch, setMediaSearch] = useState<string>('')
  const [mediaCategory, setMediaCategory] = useState<number | undefined>(undefined)
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('All')
  const [mediaLoading, setMediaLoading] = useState<boolean>(false)

  // 4. Fan Submissions state
  const [submissionList, setSubmissionList] = useState<FanSubmission[]>([])
  const [submissionTotal, setSubmissionTotal] = useState<number>(0)
  const [submissionPendingCount, setSubmissionPendingCount] = useState<number>(0)
  const [subPage, setSubPage] = useState<number>(1)
  const [subStatusFilter, setSubStatusFilter] = useState<string>('All')
  const [subSearch, setSubSearch] = useState<string>('')
  const [subLoading, setSubLoading] = useState<boolean>(false)
  const [previewSubmission, setPreviewSubmission] = useState<FanSubmission | null>(null)
  const [subEditorialNote, setSubEditorialNote] = useState<string>('')

  // 5. Feedback state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [feedbackTotal, setFeedbackTotal] = useState<number>(0)
  const [feedbackOpenCount, setFeedbackOpenCount] = useState<number>(0)
  const [feedbackPage, setFeedbackPage] = useState<number>(1)
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('All')
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('All')
  const [feedbackSearch, setFeedbackSearch] = useState<string>('')
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false)
  const [previewFeedback, setPreviewFeedback] = useState<FeedbackItem | null>(null)

  // 6. Users state
  const [userList, setUserList] = useState<AdminUser[]>([])
  const [userTotal, setUserTotal] = useState<number>(0)
  const [userPage, setUserPage] = useState<number>(1)
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All')
  const [userSearch, setUserSearch] = useState<string>('')
  const [userLoading, setUserLoading] = useState<boolean>(false)

  // 7. Analytics state
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false)

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Media preview modal state
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)

  const pageSize = 10

  // ── Fetch Functions ────────────────────────────────────────────────────────
  const fetchContent = async () => {
    setContentLoading(true)
    try {
      const res = await api.getContentList({
        search: contentSearch || undefined,
        categoryId: contentCategory || undefined,
        page: contentPage,
        pageSize,
        sortBy: 'latest',
      })
      setContentList(res.items)
      setContentTotal(res.totalCount)
    } catch (err) {
      console.error('Failed to load admin content:', err)
    } finally {
      setContentLoading(false)
    }
  }

  const fetchCharacters = async () => {
    setCharLoading(true)
    try {
      const res = await api.getCharacters({
        search: charSearch || undefined,
        categoryId: charCategory || undefined,
        page: charPage,
        pageSize,
        sortBy: 'latest',
      })
      setCharacterList(res.items)
      setCharacterTotal(res.totalCount)
    } catch (err) {
      console.error('Failed to load admin characters:', err)
    } finally {
      setCharLoading(false)
    }
  }

  const fetchMedia = async () => {
    setMediaLoading(true)
    try {
      const res = await api.getMediaList({
        search: mediaSearch || undefined,
        categoryId: mediaCategory || undefined,
        mediaType: mediaTypeFilter !== 'All' ? mediaTypeFilter : undefined,
        page: mediaPageNum,
        pageSize,
      })
      setMediaList(res.items)
      setMediaTotalCount(res.totalCount)
    } catch (err) {
      console.error('Failed to load admin media:', err)
    } finally {
      setMediaLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    setSubLoading(true)
    try {
      const res = await api.getAdminSubmissions({
        status: subStatusFilter !== 'All' ? subStatusFilter : undefined,
        search: subSearch || undefined,
        page: subPage,
        pageSize,
      })
      setSubmissionList(res.items)
      setSubmissionTotal(res.totalCount)
    } catch (err) {
      console.error('Failed to load submissions:', err)
    } finally {
      setSubLoading(false)
    }
  }

  const fetchFeedback = async () => {
    setFeedbackLoading(true)
    try {
      const res = await api.getAdminFeedback({
        type: feedbackTypeFilter !== 'All' ? feedbackTypeFilter : undefined,
        status: feedbackStatusFilter !== 'All' ? feedbackStatusFilter : undefined,
        search: feedbackSearch || undefined,
        page: feedbackPage,
        pageSize,
      })
      setFeedbackList(res.items)
      setFeedbackTotal(res.totalCount)
    } catch (err) {
      console.error('Failed to load feedback:', err)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUserLoading(true)
    try {
      const res = await api.getAdminUsers({
        search: userSearch || undefined,
        role: userRoleFilter !== 'All' ? userRoleFilter : undefined,
        page: userPage,
        pageSize,
      })
      setUserList(res.items)
      setUserTotal(res.totalCount)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const data = await api.getAdminAnalytics()
      setAnalytics(data)
      setSubmissionPendingCount(data.pendingSubmissions)
      setFeedbackOpenCount(data.openFeedback)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Initial and reactive effects
  useEffect(() => {
    fetchContent()
  }, [contentPage, contentSearch, contentCategory, refreshTrigger])

  useEffect(() => {
    fetchCharacters()
  }, [charPage, charSearch, charCategory, refreshTrigger])

  useEffect(() => {
    fetchMedia()
  }, [mediaPageNum, mediaSearch, mediaCategory, mediaTypeFilter, refreshTrigger])

  useEffect(() => {
    fetchSubmissions()
  }, [subPage, subStatusFilter, subSearch, refreshTrigger])

  useEffect(() => {
    fetchFeedback()
  }, [feedbackPage, feedbackTypeFilter, feedbackStatusFilter, feedbackSearch, refreshTrigger])

  useEffect(() => {
    fetchUsers()
  }, [userPage, userRoleFilter, userSearch, refreshTrigger])

  useEffect(() => {
    fetchAnalytics()
  }, [refreshTrigger])

  // ── Handlers for Submissions ───────────────────────────────────────────────
  const openSubmissionPreview = (sub: FanSubmission) => {
    setPreviewSubmission(sub)
    setSubEditorialNote(sub.adminNotes || '')
  }

  const handleUpdateSubmissionStatus = async (
    id: number,
    status: 'Approved' | 'Rejected',
    publishToContent = false,
    adminNotes?: string
  ) => {
    try {
      await api.updateSubmissionStatus(id, { status, publishToContent, adminNotes })
      await fetchSubmissions()
      await fetchAnalytics()
      if (publishToContent || status === 'Approved') {
        await fetchContent()
      }
      if (previewSubmission && previewSubmission.id === id) {
        setPreviewSubmission({
          ...previewSubmission,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : previewSubmission.adminNotes,
          reviewedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Failed to update submission status:', err)
    }
  }

  // ── Handlers for Feedback ──────────────────────────────────────────────────
  const handleUpdateFeedbackStatus = async (id: number, status: 'Open' | 'In Review' | 'Resolved') => {
    try {
      await api.updateFeedbackStatus(id, status)
      await fetchFeedback()
      await fetchAnalytics()
      if (previewFeedback && previewFeedback.id === id) {
        setPreviewFeedback({ ...previewFeedback, status })
      }
    } catch (err) {
      console.error('Failed to update feedback status:', err)
    }
  }

  // ── Handlers for Users ─────────────────────────────────────────────────────
  const handleToggleUserRole = async (user: AdminUser) => {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin'
    try {
      await api.updateUserRole(user.id, newRole)
      await fetchUsers()
      await fetchAnalytics()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user role.')
    }
  }

  // ── Handle Delete Confirmation Execution ───────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      if (deleteTarget.type === 'content') {
        await onDeleteContent(deleteTarget.id)
        await fetchContent()
      } else if (deleteTarget.type === 'character') {
        await onDeleteCharacter(deleteTarget.id)
        await fetchCharacters()
      } else if (deleteTarget.type === 'media') {
        await onDeleteMedia(deleteTarget.id)
        await fetchMedia()
      } else if (deleteTarget.type === 'submission') {
        await api.deleteSubmission(deleteTarget.id)
        await fetchSubmissions()
        if (previewSubmission && previewSubmission.id === deleteTarget.id) {
          setPreviewSubmission(null)
        }
      } else if (deleteTarget.type === 'feedback') {
        await api.deleteFeedback(deleteTarget.id)
        await fetchFeedback()
        if (previewFeedback && previewFeedback.id === deleteTarget.id) {
          setPreviewFeedback(null)
        }
      } else if (deleteTarget.type === 'user') {
        await api.deleteUser(deleteTarget.id)
        await fetchUsers()
      }
      await fetchAnalytics()
      setDeleteTarget(null)
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete record.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper for YouTube embed
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube-nocookie.com/embed/${vidId}`
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube-nocookie.com/embed/${vidId}`
    }
    return url
  }

  const contentPagesCount = Math.max(1, Math.ceil(contentTotal / pageSize))
  const charPagesCount = Math.max(1, Math.ceil(characterTotal / pageSize))
  const mediaPagesCount = Math.max(1, Math.ceil(mediaTotalCount / pageSize))
  const subPagesCount = Math.max(1, Math.ceil(submissionTotal / pageSize))
  const feedbackPagesCount = Math.max(1, Math.ceil(feedbackTotal / pageSize))
  const userPagesCount = Math.max(1, Math.ceil(userTotal / pageSize))

  return (
    <div className="admin-console-page">
      {/* ── Top Header (Preserved Exactly) ── */}
      <div className="admin-console-header">
        <div className="admin-badge">ADMINISTRATION CONSOLE</div>
        <h1 className="admin-title">Multiverse Content Management</h1>
        <p className="admin-desc">
          Create, curate, update, and manage fandom chronicles, character dossiers, audiovisual streams, community submissions, feedback, and operatives.
        </p>
      </div>

      {/* ── Top 3 Action Cards (Preserved Exactly) ── */}
      <div className="admin-action-grid">
        <div
          className="admin-action-card clickable"
          onClick={() => setActiveTab('content')}
          style={{ cursor: 'pointer' }}
          title="Click to view Fandom Chronicles table"
        >
          <div className="action-icon">
            <FileTextIcon size={32} />
          </div>
          <h3>Fandom Chronicles</h3>
          <p>Publish or modify universe articles, deep dives, and lore analysis.</p>
          <div className="action-stat">{contentTotal || totalContent} Published</div>
          <button
            className="btn-admin-action"
            onClick={(e) => {
              e.stopPropagation()
              onOpenCreateContent()
            }}
          >
            ＋ Publish New Article
          </button>
        </div>

        <div
          className="admin-action-card clickable"
          onClick={() => setActiveTab('characters')}
          style={{ cursor: 'pointer' }}
          title="Click to view Character Dossiers table"
        >
          <div className="action-icon">
            <UserIcon size={32} />
          </div>
          <h3>Character Dossiers</h3>
          <p>Author or update hero/villain profiles, combat powers, and origin backstories.</p>
          <div className="action-stat">{characterTotal || totalCharacters} Characters</div>
          <button
            className="btn-admin-action"
            onClick={(e) => {
              e.stopPropagation()
              onOpenCreateCharacter()
            }}
          >
            ＋ Add Character Profile
          </button>
        </div>

        <div
          className="admin-action-card clickable"
          onClick={() => setActiveTab('media')}
          style={{ cursor: 'pointer' }}
          title="Click to view Multimedia Streams table"
        >
          <div className="action-icon">
            <VideoIcon size={32} />
          </div>
          <h3>Multimedia Streams</h3>
          <p>Embed official trailers, YouTube previews, or SoundCloud soundtrack streams.</p>
          <div className="action-stat">{mediaTotalCount || totalMedia} Media Streams</div>
          <button
            className="btn-admin-action"
            onClick={(e) => {
              e.stopPropagation()
              onOpenCreateMedia()
            }}
          >
            ＋ Add Media Stream
          </button>
        </div>
      </div>

      {/* ── Section Tabs Switcher ── */}
      <div className="admin-tabs-nav" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileTextIcon size={16} />
          <span>Fandom Chronicles</span>
          <span className="admin-tab-badge">{contentTotal}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          <UserIcon size={16} />
          <span>Character Dossiers</span>
          <span className="admin-tab-badge">{characterTotal}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <VideoIcon size={16} />
          <span>Multimedia Streams</span>
          <span className="admin-tab-badge">{mediaTotalCount}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <InboxIcon size={16} />
          <span>Fan Submissions</span>
          {submissionPendingCount > 0 ? (
            <span className="admin-tab-badge pending" style={{ background: '#f59e0b', color: '#000' }}>
              {submissionPendingCount} pending
            </span>
          ) : (
            <span className="admin-tab-badge">{submissionTotal}</span>
          )}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquareIcon size={16} />
          <span>Feedback</span>
          {feedbackOpenCount > 0 ? (
            <span className="admin-tab-badge open" style={{ background: 'var(--accent-crimson)', color: '#fff' }}>
              {feedbackOpenCount} open
            </span>
          ) : (
            <span className="admin-tab-badge">{feedbackTotal}</span>
          )}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <ShieldIcon size={16} />
          <span>Operatives (Users)</span>
          <span className="admin-tab-badge">{userTotal}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChartIcon size={16} />
          <span>Analytics</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All Records (Stacked)</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          1. FANDOM CHRONICLES MANAGEMENT TABLE
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'content' || activeTab === 'all') && (
        <section className="admin-mgmt-section">
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <FileTextIcon size={14} />
                <span>ARCHIVES</span>
              </div>
              <h2 className="admin-mgmt-title">Fandom Chronicles</h2>
              <span className="admin-count-pill">{contentTotal} Total Records</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter chronicles by title or universe..."
                  value={contentSearch}
                  onChange={(e) => {
                    setContentSearch(e.target.value)
                    setContentPage(1)
                  }}
                  className="admin-search-input"
                />
                {contentSearch && (
                  <button className="admin-clear-search" onClick={() => setContentSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <select
                className="admin-select"
                value={contentCategory ?? ''}
                onChange={(e) => {
                  setContentCategory(e.target.value ? Number(e.target.value) : undefined)
                  setContentPage(1)
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button className="btn-mgmt-add" onClick={onOpenCreateContent}>
                ＋ Add Article
              </button>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Title & Lore Context</th>
                  <th style={{ width: '15%' }}>Category</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '10%' }}>Popularity</th>
                  <th style={{ width: '23%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading chronicles...</span>
                    </td>
                  </tr>
                ) : contentList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No chronicles found matching your filter.
                    </td>
                  </tr>
                ) : (
                  contentList.map((item) => (
                    <tr key={item.id} className="admin-table-row">
                      <td>
                        <div className="admin-table-item-cell">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="admin-table-thumb"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="admin-table-thumb-placeholder">
                              <FileTextIcon size={16} />
                            </div>
                          )}
                          <div className="admin-table-title-meta">
                            <span className="admin-table-title">{item.title}</span>
                            <span className="admin-table-sub">
                              {item.fandomUniverse || item.categoryName} • ID #{item.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-pill category">{item.categoryName || 'General'}</span>
                      </td>
                      <td>
                        <span className="admin-table-pill type">{item.contentType || 'Article'}</span>
                      </td>
                      <td>
                        <div className="admin-popularity-display">
                          <StarIcon size={13} fill="currentColor" color="var(--accent-crimson)" />
                          <span>{item.popularityScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action view"
                            title="View / Read Lore"
                            onClick={() => onViewContent(item)}
                          >
                            <EyeIcon size={14} />
                            <span>View</span>
                          </button>
                          <button
                            className="btn-mgmt-action edit"
                            title="Edit Chronicle"
                            onClick={() => onEditContent(item)}
                          >
                            <EditIcon size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Chronicle"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'content',
                                id: item.id,
                                title: item.title,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {contentPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{contentPage}</strong> of <strong>{contentPagesCount}</strong> ({contentTotal} records)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={contentPage <= 1}
                  onClick={() => setContentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={contentPage >= contentPagesCount}
                  onClick={() => setContentPage((p) => Math.min(contentPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          2. CHARACTER DOSSIERS MANAGEMENT TABLE
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'characters' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <UserIcon size={14} />
                <span>OPERATIVES</span>
              </div>
              <h2 className="admin-mgmt-title">Character Dossiers</h2>
              <span className="admin-count-pill">{characterTotal} Total Dossiers</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter characters by name or universe..."
                  value={charSearch}
                  onChange={(e) => {
                    setCharSearch(e.target.value)
                    setCharPage(1)
                  }}
                  className="admin-search-input"
                />
                {charSearch && (
                  <button className="admin-clear-search" onClick={() => setCharSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <select
                className="admin-select"
                value={charCategory ?? ''}
                onChange={(e) => {
                  setCharCategory(e.target.value ? Number(e.target.value) : undefined)
                  setCharPage(1)
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button className="btn-mgmt-add" onClick={onOpenCreateCharacter}>
                ＋ Add Character
              </button>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Character Profile</th>
                  <th style={{ width: '18%' }}>Universe</th>
                  <th style={{ width: '14%' }}>Role / Title</th>
                  <th style={{ width: '10%' }}>Popularity</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading character dossiers...</span>
                    </td>
                  </tr>
                ) : characterList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No character dossiers found matching your filter.
                    </td>
                  </tr>
                ) : (
                  characterList.map((char) => (
                    <tr key={char.id} className="admin-table-row">
                      <td>
                        <div className="admin-table-item-cell">
                          {char.avatarUrl ? (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              className="admin-table-avatar"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="admin-table-avatar-placeholder">
                              <UserIcon size={16} />
                            </div>
                          )}
                          <div className="admin-table-title-meta">
                            <span className="admin-table-title">{char.name}</span>
                            <span className="admin-table-sub">
                              {char.categoryName || 'Universal'} • ID #{char.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-pill universe">{char.fandomUniverse || 'Multiverse'}</span>
                      </td>
                      <td>
                        <span className="admin-table-pill role">{char.roleTitle || 'Hero'}</span>
                      </td>
                      <td>
                        <div className="admin-popularity-display">
                          <StarIcon size={13} fill="currentColor" color="var(--accent-crimson)" />
                          <span>{char.popularityScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action view"
                            title="View Dossier"
                            onClick={() => onViewCharacter(char)}
                          >
                            <EyeIcon size={14} />
                            <span>View</span>
                          </button>
                          <button
                            className="btn-mgmt-action edit"
                            title="Edit Dossier"
                            onClick={() => onEditCharacter(char)}
                          >
                            <EditIcon size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Dossier"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'character',
                                id: char.id,
                                title: char.name,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {charPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{charPage}</strong> of <strong>{charPagesCount}</strong> ({characterTotal} records)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={charPage <= 1}
                  onClick={() => setCharPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={charPage >= charPagesCount}
                  onClick={() => setCharPage((p) => Math.min(charPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          3. MULTIMEDIA STREAMS MANAGEMENT TABLE
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'media' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <VideoIcon size={14} />
                <span>FEEDS</span>
              </div>
              <h2 className="admin-mgmt-title">Multimedia Streams</h2>
              <span className="admin-count-pill">{mediaTotalCount} Total Streams</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter streams by title or universe..."
                  value={mediaSearch}
                  onChange={(e) => {
                    setMediaSearch(e.target.value)
                    setMediaPageNum(1)
                  }}
                  className="admin-search-input"
                />
                {mediaSearch && (
                  <button className="admin-clear-search" onClick={() => setMediaSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <select
                className="admin-select"
                value={mediaTypeFilter}
                onChange={(e) => {
                  setMediaTypeFilter(e.target.value)
                  setMediaPageNum(1)
                }}
              >
                <option value="All">All Formats</option>
                <option value="Video">Video / Trailer</option>
                <option value="Audio">Audio / OST</option>
              </select>

              <select
                className="admin-select"
                value={mediaCategory ?? ''}
                onChange={(e) => {
                  setMediaCategory(e.target.value ? Number(e.target.value) : undefined)
                  setMediaPageNum(1)
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button className="btn-mgmt-add" onClick={onOpenCreateMedia}>
                ＋ Add Stream
              </button>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Stream Title & Lore</th>
                  <th style={{ width: '16%' }}>Universe</th>
                  <th style={{ width: '12%' }}>Format</th>
                  <th style={{ width: '10%' }}>Rating</th>
                  <th style={{ width: '22%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading media streams...</span>
                    </td>
                  </tr>
                ) : mediaList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No media streams found matching your filter.
                    </td>
                  </tr>
                ) : (
                  mediaList.map((item) => (
                    <tr key={item.id} className="admin-table-row">
                      <td>
                        <div className="admin-table-item-cell">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="admin-table-thumb"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="admin-table-thumb-placeholder">
                              {item.mediaType === 'Audio' ? <MusicIcon size={16} /> : <VideoIcon size={16} />}
                            </div>
                          )}
                          <div className="admin-table-title-meta">
                            <span className="admin-table-title">{item.title}</span>
                            <span className="admin-table-sub">
                              {item.categoryName || 'Universal'} • ID #{item.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-pill universe">{item.fandomUniverse || 'Multiverse'}</span>
                      </td>
                      <td>
                        <span className={`admin-table-pill format ${item.mediaType.toLowerCase()}`}>
                          {item.mediaType === 'Audio' ? (
                            <>
                              <MusicIcon size={11} /> Audio OST
                            </>
                          ) : (
                            <>
                              <PlayIcon size={10} fill="currentColor" /> Video Feed
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="admin-popularity-display">
                          <StarIcon size={13} fill="currentColor" color="var(--accent-crimson)" />
                          <span>{item.averageRating ? item.averageRating.toFixed(1) : '—'}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ({item.ratingsCount || 0})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action view"
                            title="Preview / Play Stream"
                            onClick={() => setPreviewMedia(item)}
                          >
                            <PlayIcon size={13} fill="currentColor" />
                            <span>Preview</span>
                          </button>
                          <button
                            className="btn-mgmt-action edit"
                            title="Edit Media"
                            onClick={() => onEditMedia(item)}
                          >
                            <EditIcon size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Stream"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'media',
                                id: item.id,
                                title: item.title,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {mediaPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{mediaPageNum}</strong> of <strong>{mediaPagesCount}</strong> ({mediaTotalCount} records)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={mediaPageNum <= 1}
                  onClick={() => setMediaPageNum((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={mediaPageNum >= mediaPagesCount}
                  onClick={() => setMediaPageNum((p) => Math.min(mediaPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          4. FAN SUBMISSIONS MANAGEMENT TABLE
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'submissions' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <InboxIcon size={14} />
                <span>COMMUNITY</span>
              </div>
              <h2 className="admin-mgmt-title">Fan Submissions</h2>
              <span className="admin-count-pill">{submissionTotal} Submissions</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter by title, author, universe..."
                  value={subSearch}
                  onChange={(e) => {
                    setSubSearch(e.target.value)
                    setSubPage(1)
                  }}
                  className="admin-search-input"
                />
                {subSearch && (
                  <button className="admin-clear-search" onClick={() => setSubSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <select
                className="admin-select"
                value={subStatusFilter}
                onChange={(e) => {
                  setSubStatusFilter(e.target.value)
                  setSubPage(1)
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Submission Title & Author</th>
                  <th style={{ width: '15%' }}>Category & Universe</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '23%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading submissions...</span>
                    </td>
                  </tr>
                ) : submissionList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No submissions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  submissionList.map((sub) => (
                    <tr key={sub.id} className="admin-table-row">
                      <td>
                        <div className="admin-table-item-cell">
                          {sub.mediaUrl ? (
                            <img
                              src={sub.mediaUrl}
                              alt={sub.title}
                              className="admin-table-thumb"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="admin-table-thumb-placeholder">
                              <InboxIcon size={16} />
                            </div>
                          )}
                          <div className="admin-table-title-meta">
                            <span className="admin-table-title">{sub.title}</span>
                            <span className="admin-table-sub">
                              By <strong>{sub.authorName}</strong> • {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="admin-table-pill category">{sub.categoryName}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.fandomUniverse}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-pill type">{sub.submissionType}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${sub.status.toLowerCase()}`}
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background:
                              sub.status === 'Approved'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : sub.status === 'Rejected'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              sub.status === 'Approved'
                                ? '#22c55e'
                                : sub.status === 'Rejected'
                                ? '#ef4444'
                                : '#f59e0b',
                            border: `1px solid ${
                              sub.status === 'Approved'
                                ? 'rgba(34, 197, 94, 0.3)'
                                : sub.status === 'Rejected'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'rgba(245, 158, 11, 0.3)'
                            }`,
                          }}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action view"
                            title="Preview Submission"
                            onClick={() => openSubmissionPreview(sub)}
                          >
                            <EyeIcon size={14} />
                            <span>Preview</span>
                          </button>

                          {sub.status !== 'Approved' && (
                            <button
                              className="btn-mgmt-action"
                              style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                              title="Approve Submission"
                              onClick={() => handleUpdateSubmissionStatus(sub.id, 'Approved', true)}
                            >
                              <CheckIcon size={13} strokeWidth={3} />
                              <span>Approve</span>
                            </button>
                          )}

                          {sub.status !== 'Rejected' && (
                            <button
                              className="btn-mgmt-action"
                              style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                              title="Reject Submission"
                              onClick={() => handleUpdateSubmissionStatus(sub.id, 'Rejected')}
                            >
                              <CloseIcon size={13} strokeWidth={3} />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Submission"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'submission',
                                id: sub.id,
                                title: sub.title,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {subPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{subPage}</strong> of <strong>{subPagesCount}</strong> ({submissionTotal} submissions)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={subPage <= 1}
                  onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={subPage >= subPagesCount}
                  onClick={() => setSubPage((p) => Math.min(subPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          5. FEEDBACK MANAGEMENT TABLE (Bug, Suggestion, Query)
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'feedback' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <MessageSquareIcon size={14} />
                <span>INQUIRIES</span>
              </div>
              <h2 className="admin-mgmt-title">User Feedback & Bug Reports</h2>
              <span className="admin-count-pill">{feedbackTotal} Tickets</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter by subject or user..."
                  value={feedbackSearch}
                  onChange={(e) => {
                    setFeedbackSearch(e.target.value)
                    setFeedbackPage(1)
                  }}
                  className="admin-search-input"
                />
                {feedbackSearch && (
                  <button className="admin-clear-search" onClick={() => setFeedbackSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              {/* Feedback Type Filter: Bug / Suggestion / Query */}
              <select
                className="admin-select"
                value={feedbackTypeFilter}
                onChange={(e) => {
                  setFeedbackTypeFilter(e.target.value)
                  setFeedbackPage(1)
                }}
              >
                <option value="All">All Ticket Types</option>
                <option value="Bug">Bug Reports</option>
                <option value="Suggestion">Feature Suggestions</option>
                <option value="Query">Support Queries</option>
              </select>

              <select
                className="admin-select"
                value={feedbackStatusFilter}
                onChange={(e) => {
                  setFeedbackStatusFilter(e.target.value)
                  setFeedbackPage(1)
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Subject & Ticket Preview</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Operative / Contact</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbackLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading feedback tickets...</span>
                    </td>
                  </tr>
                ) : feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No feedback tickets found matching criteria.
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((item) => (
                    <tr key={item.id} className="admin-table-row">
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="admin-table-title" style={{ maxWidth: '340px' }}>
                            {item.subject}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '340px',
                            }}
                          >
                            {item.message}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-feedback-badge ${item.feedbackType.toLowerCase()}`}
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background:
                              item.feedbackType === 'Bug'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : item.feedbackType === 'Suggestion'
                                ? 'rgba(168, 85, 247, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                            color:
                              item.feedbackType === 'Bug'
                                ? '#ef4444'
                                : item.feedbackType === 'Suggestion'
                                ? '#c084fc'
                                : '#60a5fa',
                            border: `1px solid ${
                              item.feedbackType === 'Bug'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : item.feedbackType === 'Suggestion'
                                ? 'rgba(168, 85, 247, 0.3)'
                                : 'rgba(59, 130, 246, 0.3)'
                            }`,
                          }}
                        >
                          {item.feedbackType === 'Bug' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <BugIcon size={12} />
                              <span>Bug</span>
                            </span>
                          )}
                          {item.feedbackType === 'Suggestion' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <LightbulbIcon size={12} />
                              <span>Suggestion</span>
                            </span>
                          )}
                          {item.feedbackType === 'Query' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <HelpCircleIcon size={12} />
                              <span>Query</span>
                            </span>
                          )}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.userName || 'Anonymous'}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {item.userEmail || 'No email'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={item.status}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            height: '28px',
                            color:
                              item.status === 'Resolved'
                                ? '#22c55e'
                                : item.status === 'In Review'
                                ? '#f59e0b'
                                : 'var(--text-main)',
                          }}
                          onChange={(e) =>
                            handleUpdateFeedbackStatus(
                              item.id,
                              e.target.value as 'Open' | 'In Review' | 'Resolved'
                            )
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="In Review">In Review</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action view"
                            title="View Full Ticket"
                            onClick={() => setPreviewFeedback(item)}
                          >
                            <EyeIcon size={14} />
                            <span>View</span>
                          </button>
                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Ticket"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'feedback',
                                id: item.id,
                                title: item.subject,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {feedbackPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{feedbackPage}</strong> of <strong>{feedbackPagesCount}</strong> ({feedbackTotal} tickets)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={feedbackPage <= 1}
                  onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={feedbackPage >= feedbackPagesCount}
                  onClick={() => setFeedbackPage((p) => Math.min(feedbackPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          6. USERS MANAGEMENT TABLE
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'users' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <ShieldIcon size={14} />
                <span>MEMBERS</span>
              </div>
              <h2 className="admin-mgmt-title">Operatives (User Accounts)</h2>
              <span className="admin-count-pill">{userTotal} Registered</span>
            </div>

            <div className="admin-mgmt-controls">
              <div className="admin-search-wrapper">
                <SearchIcon size={15} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Filter by username or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setUserPage(1)
                  }}
                  className="admin-search-input"
                />
                {userSearch && (
                  <button className="admin-clear-search" onClick={() => setUserSearch('')}>
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <select
                className="admin-select"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value)
                  setUserPage(1)
                }}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>

          <div className="admin-mgmt-table-wrapper">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Operative Profile</th>
                  <th style={{ width: '25%' }}>Email Address</th>
                  <th style={{ width: '12%' }}>Role</th>
                  <th style={{ width: '10%' }}>Saved Items</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-table-loading">
                      <div className="astral-spinner" style={{ width: '24px', height: '24px', margin: '1rem auto' }} />
                      <span>Loading operatives...</span>
                    </td>
                  </tr>
                ) : userList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      No users found matching criteria.
                    </td>
                  </tr>
                ) : (
                  userList.map((u) => (
                    <tr key={u.id} className="admin-table-row">
                      <td>
                        <div className="admin-table-item-cell">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="admin-table-avatar" />
                          ) : (
                            <div className="admin-table-avatar-placeholder">
                              <UserIcon size={16} />
                            </div>
                          )}
                          <div className="admin-table-title-meta">
                            <span className="admin-table-title">{u.displayName || u.username}</span>
                            <span className="admin-table-sub">@{u.username} • ID #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{u.email}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-role-badge ${u.role.toLowerCase()}`}
                          style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background:
                              u.role === 'Admin' ? 'rgba(220, 20, 60, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            color: u.role === 'Admin' ? 'var(--accent-crimson)' : 'var(--text-muted)',
                            border: `1px solid ${
                              u.role === 'Admin' ? 'rgba(220, 20, 60, 0.3)' : 'var(--border-subtle)'
                            }`,
                          }}
                        >
                          {u.role === 'Admin' && <ShieldIcon size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{u.bookmarksCount} bookmarks</span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="btn-mgmt-action"
                            style={{
                              color: u.role === 'Admin' ? '#f59e0b' : 'var(--accent-crimson)',
                              borderColor:
                                u.role === 'Admin' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(220, 20, 60, 0.3)',
                            }}
                            title={u.role === 'Admin' ? 'Demote to User' : 'Promote to Admin'}
                            onClick={() => handleToggleUserRole(u)}
                          >
                            <ShieldIcon size={13} />
                            <span>{u.role === 'Admin' ? 'Demote' : 'Make Admin'}</span>
                          </button>

                          <button
                            className="btn-mgmt-action delete"
                            title="Delete Operative Account"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'user',
                                id: u.id,
                                title: `${u.displayName} (@${u.username})`,
                              })
                            }
                          >
                            <TrashIcon size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userPagesCount > 1 && (
            <div className="admin-table-pagination">
              <span className="admin-pagination-info">
                Showing page <strong>{userPage}</strong> of <strong>{userPagesCount}</strong> ({userTotal} operatives)
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="btn-admin-pager"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn-admin-pager"
                  disabled={userPage >= userPagesCount}
                  onClick={() => setUserPage((p) => Math.min(userPagesCount, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          7. ANALYTICS & TELEMETRY DASHBOARD
          ─────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'analytics' || activeTab === 'all') && (
        <section className="admin-mgmt-section" style={{ marginTop: activeTab === 'all' ? '2.5rem' : '0' }}>
          <div className="admin-mgmt-header">
            <div className="admin-mgmt-title-group">
              <div className="admin-mgmt-badge">
                <BarChartIcon size={14} />
                <span>TELEMETRY</span>
              </div>
              <h2 className="admin-mgmt-title">Platform Statistics & Analytics</h2>
            </div>
            <div className="admin-mgmt-controls">
              <button
                className="btn-admin-pager"
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCwIcon size={14} className={analyticsLoading ? 'spin-anim' : ''} />
                <span>{analyticsLoading ? 'Refreshing...' : 'Refresh Metrics'}</span>
              </button>
            </div>
          </div>

          {analyticsLoading && !analytics ? (
            <div className="admin-table-loading">
              <div className="astral-spinner" style={{ width: '28px', height: '28px', margin: '2rem auto' }} />
              <p>Gathering multiverse platform telemetry...</p>
            </div>
          ) : analytics ? (
            <div>
              {/* Telemetry Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Total Operatives</div>
                  <div className="analytics-stat-num">{analytics.totalUsers}</div>
                  <div className="analytics-stat-sub">Registered users</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">ACTIVE USERS</div>
                  <div className="analytics-stat-num">{analytics.activeUsers}</div>
                  <div className="analytics-stat-sub">Active in the last 30 days</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Published Chronicles</div>
                  <div className="analytics-stat-num">{analytics.totalContent}</div>
                  <div className="analytics-stat-sub">Across {analytics.categoryStats?.length || 0} categories</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Character Dossiers</div>
                  <div className="analytics-stat-num">{analytics.totalCharacters}</div>
                  <div className="analytics-stat-sub">Heroes & villains</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Audiovisual Feeds</div>
                  <div className="analytics-stat-num">{analytics.totalMedia}</div>
                  <div className="analytics-stat-sub">Trailers & OST tracks</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Fan Submissions</div>
                  <div className="analytics-stat-num">{analytics.totalSubmissions}</div>
                  <div className="analytics-stat-sub">
                    <span style={{ color: analytics.pendingSubmissions > 0 ? '#f59e0b' : 'inherit' }}>
                      {analytics.pendingSubmissions} pending review
                    </span>
                  </div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">Archive Engagement</div>
                  <div className="analytics-stat-num">{analytics.totalBookmarks}</div>
                  <div className="analytics-stat-sub">Saved relics by operatives</div>
                </div>

                <div className="admin-analytics-stat-card">
                  <div className="analytics-stat-title">User Inquiries</div>
                  <div className="analytics-stat-num">{analytics.totalFeedback}</div>
                  <div className="analytics-stat-sub">
                    <span style={{ color: analytics.openFeedback > 0 ? 'var(--accent-crimson)' : 'inherit' }}>
                      {analytics.openFeedback} open tickets
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                  Fandom Categories Distribution
                </h3>
                <div className="admin-mgmt-table-wrapper">
                  <table className="admin-mgmt-table">
                    <thead>
                      <tr>
                        <th>Universe Category</th>
                        <th>Chronicles</th>
                        <th>Characters</th>
                        <th>Streams</th>
                        <th>Total Archive Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.categoryStats?.map((cat) => (
                        <tr key={cat.categoryId} className="admin-table-row">
                          <td>
                            <strong style={{ color: 'var(--text-main)' }}>{cat.categoryName}</strong>
                          </td>
                          <td>{cat.contentCount}</td>
                          <td>{cat.characterCount}</td>
                          <td>{cat.mediaCount}</td>
                          <td>
                            <span className="admin-count-pill">
                              {cat.totalItems} items
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Popular Fandom Universes */}
              {analytics.popularFandoms && analytics.popularFandoms.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    Popular Fandom Universes
                  </h3>
                  <div className="admin-mgmt-table-wrapper">
                    <table className="admin-mgmt-table">
                      <thead>
                        <tr>
                          <th>Universe Name</th>
                          <th>Primary Category</th>
                          <th>Chronicles & Lore Items</th>
                          <th>Avg. Popularity Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.popularFandoms.map((fandom) => (
                          <tr key={fandom.fandomUniverse} className="admin-table-row">
                            <td>
                              <strong style={{ color: 'var(--text-main)' }}>{fandom.fandomUniverse}</strong>
                            </td>
                            <td>
                              <span className="admin-table-pill category">{fandom.primaryCategory}</span>
                            </td>
                            <td>
                              <span className="admin-count-pill">{fandom.itemCount} items</span>
                            </td>
                            <td>
                              <div className="admin-popularity-display">
                                <StarIcon size={13} fill="currentColor" color="var(--accent-crimson)" />
                                <span>{fandom.averagePopularity}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bookmark & Engagement Breakdown */}
              {analytics.bookmarkTypeBreakdown && Object.keys(analytics.bookmarkTypeBreakdown).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    Operative Archive Engagement by Type
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {Object.entries(analytics.bookmarkTypeBreakdown).map(([type, count]) => (
                      <div key={type} className="admin-analytics-stat-card" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span className="admin-table-pill type">{type}</span>
                          <BookmarkIcon size={16} color="var(--accent-crimson)" fill="currentColor" />
                        </div>
                        <div className="analytics-stat-num" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{count}</div>
                        <div className="analytics-stat-sub">Saved by users</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Lore Articles */}
              {analytics.topPopularItems && analytics.topPopularItems.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    Top Viewed Multiverse Chronicles
                  </h3>
                  <div className="admin-mgmt-table-wrapper">
                    <table className="admin-mgmt-table">
                      <thead>
                        <tr>
                          <th>Rank & Article Title</th>
                          <th>Universe</th>
                          <th>Content Type</th>
                          <th>Popularity Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topPopularItems.map((item, idx) => (
                          <tr key={item.id} className="admin-table-row">
                            <td>
                              <span style={{ color: 'var(--accent-crimson)', fontWeight: 800, marginRight: '0.5rem' }}>
                                #{idx + 1}
                              </span>
                              <strong style={{ color: 'var(--text-main)' }}>{item.title}</strong>
                            </td>
                            <td>{item.categoryName}</td>
                            <td>
                              <span className="admin-table-pill type">{item.type}</span>
                            </td>
                            <td>
                              <div className="admin-popularity-display">
                                <StarIcon size={13} fill="currentColor" color="var(--accent-crimson)" />
                                <span>{item.popularity}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-table-empty">No telemetry data recorded yet.</div>
          )}
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL (For all record types)
          ─────────────────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isDeleting) setDeleteTarget(null)
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-crimson)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(220, 20, 60, 0.25)',
              maxWidth: '480px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(220, 20, 60, 0.15)',
                color: 'var(--accent-crimson)',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangleIcon size={24} />
            </div>

            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: '0 0 0.5rem',
              }}
            >
              Confirm Permanent Deletion
            </h3>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: '0 0 1.5rem',
              }}
            >
              Are you sure you want to permanently delete this{' '}
              <strong style={{ color: 'var(--text-main)' }}>
                {deleteTarget.type === 'content'
                  ? 'Fandom Chronicle'
                  : deleteTarget.type === 'character'
                  ? 'Character Dossier'
                  : deleteTarget.type === 'media'
                  ? 'Multimedia Stream'
                  : deleteTarget.type === 'submission'
                  ? 'Fan Submission'
                  : deleteTarget.type === 'feedback'
                  ? 'Feedback Ticket'
                  : 'Operative User Account'}
              </strong>
              :{' '}
              <span style={{ color: 'var(--accent-crimson)', fontWeight: 600 }}>
                "{deleteTarget.title}"
              </span>
              ? This action will remove the record directly from the database and cannot be undone.
            </p>

            {deleteError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                {deleteError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn-admin-pager"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  background: 'var(--accent-crimson)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1.4rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px var(--accent-crimson-glow)',
                }}
              >
                {isDeleting ? (
                  <>
                    <div
                      className="astral-spinner"
                      style={{ width: '14px', height: '14px', borderWidth: '2px' }}
                    />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          PREVIEW SUBMISSION MODAL
          ─────────────────────────────────────────────────────────────────────── */}
      {previewSubmission && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewSubmission(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setPreviewSubmission(null)}
              aria-label="Close Preview"
            >
              <CloseIcon size={16} />
            </button>

            <div className="modal-badge">
              COMMUNITY FAN SUBMISSION // {previewSubmission.submissionType.toUpperCase()}
            </div>
            <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>
              {previewSubmission.title}
            </h2>
            <p className="modal-subtitle" style={{ marginBottom: '1.25rem' }}>
              By <strong>{previewSubmission.authorName}</strong> ({previewSubmission.authorEmail || 'No email'}) •{' '}
              {previewSubmission.fandomUniverse} ({previewSubmission.categoryName})
            </p>

            {previewSubmission.mediaUrl && (
              <div style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img
                  src={previewSubmission.mediaUrl}
                  alt={previewSubmission.title}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: 'var(--text-main)',
                marginBottom: '1.5rem',
                maxHeight: '240px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {previewSubmission.contentText}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Archivist Review / Editorial Notes
              </label>
              <textarea
                className="srs-textarea"
                rows={2}
                placeholder="Add reviewer feedback, canon verification notes, or revision instructions (visible to the submitting operative)..."
                value={subEditorialNote}
                onChange={(e) => setSubEditorialNote(e.target.value)}
                style={{ width: '100%', fontSize: '0.86rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {previewSubmission.status !== 'Approved' && (
                  <>
                    <button
                      className="btn-mgmt-add"
                      style={{ background: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => handleUpdateSubmissionStatus(previewSubmission.id, 'Approved', true, subEditorialNote)}
                      title="Approves submission and publishes to Fandom Chronicles"
                    >
                      <CheckIcon size={14} />
                      <span>Approve & Publish</span>
                    </button>
                  </>
                )}
                {previewSubmission.status !== 'Rejected' && (
                  <button
                    className="btn-admin-pager"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => handleUpdateSubmissionStatus(previewSubmission.id, 'Rejected', false, subEditorialNote)}
                    title="Rejects submission and provides review feedback to operative"
                  >
                    <CloseIcon size={14} />
                    <span>Reject with Notes</span>
                  </button>
                )}
              </div>

              <button className="btn-admin-pager" onClick={() => setPreviewSubmission(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          PREVIEW FEEDBACK MODAL
          ─────────────────────────────────────────────────────────────────────── */}
      {previewFeedback && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewFeedback(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setPreviewFeedback(null)}
              aria-label="Close Preview"
            >
              <CloseIcon size={16} />
            </button>

            <div className="modal-badge">
              FEEDBACK TICKET // {previewFeedback.feedbackType.toUpperCase()}
            </div>
            <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>
              {previewFeedback.subject}
            </h2>
            <p className="modal-subtitle" style={{ marginBottom: '1.25rem' }}>
              From <strong>{previewFeedback.userName || 'Anonymous Operative'}</strong> (
              {previewFeedback.userEmail || 'No email provided'}) • {new Date(previewFeedback.createdAt).toLocaleString()}
            </p>

            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                color: 'var(--text-main)',
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {previewFeedback.message}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  className="admin-select"
                  value={previewFeedback.status}
                  onChange={(e) =>
                    handleUpdateFeedbackStatus(
                      previewFeedback.id,
                      e.target.value as 'Open' | 'In Review' | 'Resolved'
                    )
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <button className="btn-admin-pager" onClick={() => setPreviewFeedback(null)}>
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          MEDIA PREVIEW MODAL
          ─────────────────────────────────────────────────────────────────────── */}
      {previewMedia && (
        <div className="modal-backdrop" onClick={() => setPreviewMedia(null)} role="dialog" aria-modal="true">
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setPreviewMedia(null)}
              aria-label="Close Preview"
            >
              <CloseIcon size={16} />
            </button>

            <div className="modal-badge">
              {previewMedia.mediaType === 'Audio' ? 'AUDIO OST STREAM PREVIEW' : 'VIDEO STREAM PREVIEW'}
            </div>
            <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>
              {previewMedia.title}
            </h2>
            <p className="modal-subtitle" style={{ marginBottom: '1.25rem' }}>
              {previewMedia.fandomUniverse} • {previewMedia.categoryName}
            </p>

            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#000000',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              {previewMedia.mediaType === 'Audio' ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <img
                    src={previewMedia.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'}
                    alt={previewMedia.title}
                    style={{
                      width: '160px',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      margin: '0 auto 1.5rem',
                      display: 'block',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  />
                  <audio
                    controls
                    autoPlay
                    src={previewMedia.mediaUrl}
                    style={{ width: '100%', maxWidth: '500px' }}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : previewMedia.mediaUrl.includes('youtube.com') || previewMedia.mediaUrl.includes('youtu.be') ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={getEmbedUrl(previewMedia.mediaUrl)}
                    title={previewMedia.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  src={previewMedia.mediaUrl}
                  poster={previewMedia.thumbnailUrl}
                  style={{ width: '100%', display: 'block', maxHeight: '420px' }}
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>

            {previewMedia.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {previewMedia.description}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn-mgmt-action edit"
                onClick={() => {
                  const target = previewMedia
                  setPreviewMedia(null)
                  onEditMedia(target)
                }}
              >
                <EditIcon size={14} />
                <span>Edit This Stream</span>
              </button>
              <button
                className="btn-admin-pager"
                onClick={() => setPreviewMedia(null)}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
