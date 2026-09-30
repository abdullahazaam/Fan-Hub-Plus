import { useEffect, useRef, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Category, Character, ContentItem, MediaItem, MerchandiseItem } from '../types'
import { Breadcrumbs } from './Breadcrumbs'
import { QUESTIONS, REALMS, matchRealm } from './realmDiscoveryScoring'
import './RealmDiscovery.css'

interface Props {
  onHome: () => void
  onExplore: (category: Category) => void
  onChronicle: (item: ContentItem) => void
  onCharacter: (item: Character) => void
  onMedia: (item: MediaItem) => void
  onMerchandise: (item: MerchandiseItem) => void
  onEvents: () => void
  onSignIn: () => void
}

type Recommendation = {
  id: number
  title: string
  image: string
  detail: string
  open: () => void
}

type Group = {
  name: string
  items: Recommendation[]
  failed: boolean
}

const storageKey = 'fhp-discovery-v1'

function readAnswers(): number[] {
  try {
    const a = JSON.parse(sessionStorage.getItem(storageKey) || '[]')
    return Array.isArray(a) &&
      a.length <= 5 &&
      a.every((v, i) => Number.isInteger(v) && QUESTIONS[i]?.options[v])
      ? a
      : []
  } catch {
    return []
  }
}

export function RealmDiscovery(props: Props) {
  const { user, profile, updateProfile } = useAuth()
  const [answers, setAnswers] = useState<number[]>(readAnswers)
  const [step, setStep] = useState(() => Math.min(readAnswers().length, 4))
  const [phase, setPhase] = useState<'questions' | 'reveal' | 'result'>(() =>
    readAnswers().length === 5 ? 'result' : 'questions'
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const callbacks = useRef(props)
  callbacks.current = props

  const result = answers.length === 5 ? matchRealm(answers) : null
  const slug = result?.realm.slug

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(answers))
    } catch {}
  }, [answers])

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [step, phase])

  useEffect(() => {
    if (phase !== 'reveal') return
    const timer = window.setTimeout(
      () => setPhase('result'),
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500
    )
    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (!slug) return
    let active = true
    setLoading(true)
    setError('')
    setCategory(null)
    setGroups([])

    async function load() {
      try {
        const categories = await api.getCategories()
        const cat = categories.find(
          (c) =>
            c.slug === slug ||
            c.name.toLowerCase() ===
              REALMS.find((r) => r.slug === slug)?.name.toLowerCase()
        )
        if (!cat)
          throw new Error('This realm is not available in the archive yet. Try again shortly.')
        if (!active) return
        setCategory(cat)
        const params = { categoryId: cat.id, page: 1, pageSize: 3 }
        const tasks: [string, Promise<Recommendation[]>][] = [
          [
            'Chronicles',
            api
              .getContentList(params)
              .then((r) =>
                r.items
                  .filter((i) => i.categoryId === cat.id)
                  .map((i) => ({
                    id: i.id,
                    title: i.title,
                    image: i.thumbnailUrl,
                    detail: i.fandomUniverse || 'Chronicle',
                    open: () => callbacks.current.onChronicle(i),
                  }))
              ),
          ],
          [
            'Characters',
            api
              .getCharacters(params)
              .then((r) =>
                r.items
                  .filter((i) => i.categoryId === cat.id)
                  .map((i) => ({
                    id: i.id,
                    title: i.name,
                    image: i.avatarUrl || i.bannerUrl,
                    detail: i.roleTitle || 'Hero / Legend',
                    open: () => callbacks.current.onCharacter(i),
                  }))
              ),
          ],
          [
            'Media',
            api
              .getMediaList(params)
              .then((r) =>
                r.items
                  .filter((i) => i.categoryId === cat.id)
                  .map((i) => ({
                    id: i.id,
                    title: i.title,
                    image: i.thumbnailUrl,
                    detail: i.mediaType ? `${i.mediaType.toUpperCase()} Stream` : 'Media',
                    open: () => callbacks.current.onMedia(i),
                  }))
              ),
          ],
          [
            'Events',
            api
              .getEvents(params)
              .then((r) =>
                r.items
                  .filter((i) => i.categoryId === cat.id)
                  .map((i) => ({
                    id: i.id,
                    title: i.title,
                    image: i.thumbnailUrl,
                    detail: i.city ? `Live in ${i.city}` : 'Global Event',
                    open: () => callbacks.current.onEvents(),
                  }))
              ),
          ],
          [
            'Merchandise',
            api
              .getMerchandise(params)
              .then((r) =>
                r.items
                  .filter((i) => i.categoryId === cat.id)
                  .map((i) => ({
                    id: i.id,
                    title: i.name,
                    image: i.imageUrl,
                    detail: i.fandomUniverse || 'Artifact',
                    open: () => callbacks.current.onMerchandise(i),
                  }))
              ),
          ],
        ]
        const outcomes = await Promise.allSettled(tasks.map((t) => t[1]))
        if (active) {
          setGroups(
            outcomes.map((outcome, i) => ({
              name: tasks[i][0],
              items: outcome.status === 'fulfilled' ? outcome.value : [],
              failed: outcome.status === 'rejected',
            }))
          )
        }
      } catch (e) {
        if (active)
          setError('Could not load your realm archive. Please check your connection and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [slug, retry])

  const favorites =
    profile?.favoriteCategories ||
    profile?.favoriteCategory?.split(',').map((s) => s.trim()) ||
    []
  const isFavorite =
    !!category && favorites.some((f) => f.toLowerCase() === category.name.toLowerCase())

  async function saveFavorite() {
    if (!user) {
      props.onSignIn()
      return
    }
    if (!category || saving) return
    setSaving(true)
    setSaveMessage('')
    setSaveError('')
    try {
      const latest = await api.apiGetMe()
      const previous =
        latest.favoriteCategories ||
        latest.favoriteCategory?.split(',').map((s) => s.trim()).filter(Boolean) ||
        []
      const combined = [
        category.name,
        ...previous.filter((n) => n.toLowerCase() !== category.name.toLowerCase()),
      ]
      await updateProfile({
        displayName: latest.displayName,
        bio: latest.bio,
        avatarUrl: latest.avatarUrl,
        favoriteCategories: combined,
      })
      setSaveMessage(`${category.name} is now saved to your favorite realms.`)
    } catch {
      setSaveError('Your favorite realm could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function restart() {
    setAnswers([])
    setSelected(null)
    setStep(0)
    setPhase('questions')
    setSaveMessage('')
    setSaveError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function next() {
    if (selected === null) return
    const nextAnswers = [...answers.slice(0, step), selected]
    setAnswers(nextAnswers)
    setSelected(null)
    if (step === 4) setPhase('reveal')
    else setStep(step + 1)
  }

  const question = QUESTIONS[step]

  return (
    <main className="realm-discovery">
      {/* Standard Breadcrumbs Integration */}
      <Breadcrumbs
        items={[
          { label: 'Nexus Gate', onClick: props.onHome },
          {
            label:
              phase === 'result'
                ? `Realm Revealed: ${result?.realm.name || ''}`
                : 'Discover Your Realm',
            active: true,
          },
        ]}
      />

      <div className="discovery-header-strip">
        <div className="discovery-meta-left">
          <span className="discovery-pill-tag">
            <span className="discovery-pulse-dot" />
            NEXUS RESONANCE MATRIX
          </span>
          <span className="discovery-breadcrumb-meta">8 Realms &bull; 1 True Connection</span>
        </div>
        <button
          type="button"
          className="discovery-home-back-btn"
          onClick={props.onHome}
        >
          &larr; Back to Nexus Gate
        </button>
      </div>

      {phase === 'questions' && (
        <section className="discovery-question discovery-glass-panel glass-panel" aria-labelledby="discovery-title">
          {/* Step Progress Track */}
          <div className="discovery-progress" aria-label={`Question ${step + 1} of 5`}>
            {QUESTIONS.map((q, i) => (
              <span key={q.chapter} className={i <= step ? 'is-lit' : ''}>
                <span className="discovery-progress-bar">
                  <span className="discovery-progress-fill" />
                </span>
                <span className="discovery-step-num">{String(i + 1).padStart(2, '0')}</span>
                <b className="discovery-step-title">{q.chapter}</b>
              </span>
            ))}
          </div>

          <header className="discovery-question-header">
            <p className="discovery-kicker">
              PHASE {String(step + 1).padStart(2, '0')} OF 05 &bull; {question.chapter.toUpperCase()}
            </p>
            <h1 id="discovery-title" tabIndex={-1} ref={heading}>
              {question.title}
            </h1>
            <p className="discovery-subtitle">{question.subtitle}</p>
          </header>

          <div
            className="discovery-options"
            role="group"
            aria-label={question.title}
            key={step}
          >
            {question.options.map((option, i) => (
              <button
                key={option.title}
                type="button"
                className={`discovery-option glass-panel ${selected === i ? 'is-selected' : ''}`}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <img
                  src={`/realms/${option.art}.jpg`}
                  alt=""
                  decoding="async"
                  className="discovery-option-art"
                />
                <span className="discovery-option-shade" />
                <span className="discovery-option-specular" />

                <div className="discovery-option-top">
                  <span className="discovery-option-number glass-panel">0{i + 1}</span>
                  <span className="discovery-selection glass-panel" aria-hidden="true">
                    {selected === i ? '✓' : '+'}
                  </span>
                </div>

                <div className="discovery-option-copy">
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </div>
                <div className="discovery-card-rim" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="discovery-question-actions">
            <button
              type="button"
              className="discovery-text-button"
              disabled={step === 0}
              onClick={() => {
                setSelected(answers[step - 1] ?? null)
                setStep(step - 1)
              }}
            >
              &larr; Previous Step
            </button>
            <span className="discovery-hint">Select the resonant path that pulls you in.</span>
            <button
              type="button"
              className="discovery-primary-btn"
              disabled={selected === null}
              onClick={next}
            >
              <span>{step === 4 ? 'Harmonize & Reveal Realm' : 'Continue Sequence'}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </section>
      )}

      {phase === 'reveal' && (
        <section
          className="discovery-reveal discovery-glass-panel"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="discovery-portal" aria-hidden="true">
            <div className="discovery-portal-core" />
            <i className="portal-ring ring-1" />
            <i className="portal-ring ring-2" />
            <i className="portal-ring ring-3" />
            <span className="portal-badge">FH+</span>
          </div>
          <p className="discovery-kicker">ALIGNING MULTIVERSE SIGNATURES</p>
          <h1 ref={heading} tabIndex={-1}>
            Your realm is emerging from the Nexus...
          </h1>
          <p className="discovery-reveal-sub">Synthesizing affinities and calculating cosmic harmony</p>
        </section>
      )}

      {phase === 'result' && result && (
        <>
          <section
            className="discovery-result discovery-glass-panel glass-panel"
            aria-labelledby="discovery-result-title"
          >
            <div className="discovery-result-art">
              <img
                src={`/realms/${result.realm.slug}.jpg`}
                alt=""
                className="discovery-hero-bg"
              />
              <div className="discovery-result-vignette" />
              <div className="discovery-portal" aria-hidden="true">
                <i className="portal-ring ring-1" />
                <i className="portal-ring ring-2" />
                <i className="portal-ring ring-3" />
              </div>
              <div className="discovery-match">
                <span className="discovery-match-badge glass-panel">RESONANCE RATING</span>
                <strong>{result.percent}%</strong>
                <span>Direct Affinity Match</span>
              </div>
            </div>

            <div className="discovery-result-copy">
              <div className="discovery-kicker-row">
                <span className="discovery-kicker">YOUR SOVEREIGN REALM</span>
                <span className="discovery-tag-pill glass-panel">CONFIRMED ALLIANCE</span>
              </div>
              <h1 id="discovery-result-title" ref={heading} tabIndex={-1}>
                {result.realm.name}
              </h1>
              <h2 className="discovery-result-line">{result.realm.line}</h2>
              <p className="discovery-result-reason">{result.reason}</p>
              <small className="discovery-result-note">
                Calculated deterministically from your 5 core decisions. Represents your primary storytelling anchor.
              </small>

              <div className="discovery-result-actions">
                <button
                  type="button"
                  className="discovery-primary-btn"
                  disabled={!category}
                  onClick={() => category && props.onExplore(category)}
                >
                  <span>Explore {result.realm.name} Chronicles</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
                <button
                  type="button"
                  className={`discovery-secondary-btn glass-panel ${isFavorite ? 'is-active-fav' : ''}`}
                  disabled={!category || saving || isFavorite}
                  onClick={saveFavorite}
                >
                  <span>
                    {saving
                      ? 'Saving...'
                      : isFavorite
                      ? '★ Saved to Favorite Realms'
                      : user
                      ? '☆ Set as Favorite Realm'
                      : 'Sign in to save realm'}
                  </span>
                </button>
              </div>

              {saveMessage && (
                <p role="status" className="discovery-save-status success">
                  ✓ {saveMessage}
                </p>
              )}
              {saveError && (
                <p role="alert" className="discovery-save-status error">
                  ⚠ {saveError}
                </p>
              )}

              <div className="discovery-restart-row">
                <button
                  type="button"
                  className="discovery-text-button"
                  onClick={restart}
                >
                  &#x21bb; Retake Realm Discovery
                </button>
              </div>
            </div>
          </section>

          <section
            className="discovery-recommendations discovery-glass-panel glass-panel"
            aria-labelledby="discovery-recommendations-title"
          >
            <header className="discovery-recommendations-header">
              <p className="discovery-kicker">CURATED NEXUS ARCHIVE</p>
              <h2 id="discovery-recommendations-title">Step into {result.realm.name}</h2>
              <p className="discovery-rec-intro">
                High-affinity chronicles, legendary figures, audiovisual streams and authentic collectibles waiting in this realm.
              </p>
            </header>

            {loading && (
              <div className="discovery-load" role="status">
                <div className="discovery-load-indicator">
                  <span className="discovery-spinner" />
                  <span>Streaming curated records from {result.realm.name}...</span>
                </div>
                <div className="discovery-skeletons" aria-hidden="true">
                  <div className="skeleton-card glass-panel" />
                  <div className="skeleton-card glass-panel" />
                  <div className="skeleton-card glass-panel" />
                </div>
              </div>
            )}

            {error && (
              <div className="discovery-message error-box glass-panel" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  className="discovery-secondary-btn glass-panel"
                  onClick={() => setRetry((r) => r + 1)}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              groups.map((group) => (
                <section className="discovery-recommendation-group" key={group.name}>
                  <div className="discovery-group-header">
                    <h3>{group.name}</h3>
                    <span className="discovery-group-count glass-panel">
                      {group.items.length ? `${group.items.length} Curated` : 'Archiving'}
                    </span>
                  </div>

                  {group.failed ? (
                    <div className="discovery-message glass-panel">
                      <p>{group.name} stream could not be loaded.</p>
                      <button
                        type="button"
                        className="discovery-text-button"
                        onClick={() => setRetry((r) => r + 1)}
                      >
                        Try again
                      </button>
                    </div>
                  ) : group.items.length ? (
                    <div className="discovery-recommendation-grid">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="discovery-recommendation glass-panel"
                          onClick={item.open}
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="discovery-rec-bg"
                              onError={(e) => {
                                e.currentTarget.style.visibility = 'hidden'
                              }}
                            />
                          )}
                          <div className="discovery-rec-overlay" />
                          <div className="discovery-rec-specular" />

                          <div className="discovery-rec-content">
                            <span className="discovery-rec-tag glass-panel">{item.detail}</span>
                            <strong className="discovery-rec-title">{item.title}</strong>
                            <span className="discovery-rec-action">
                              <span>{group.name === 'Events' ? 'Explore Events' : 'Inspect Dossier'}</span>
                              <span aria-hidden="true">&rarr;</span>
                            </span>
                          </div>
                          <div className="discovery-card-rim" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="discovery-empty glass-panel">
                      No {group.name.toLowerCase()} cataloged for this realm yet. Check back soon.
                    </p>
                  )}
                </section>
              ))}
          </section>
        </>
      )}
    </main>
  )
}

