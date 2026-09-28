import { useEffect } from 'react'
import './CardExperience.css'

// Enhances existing cards without wrappers, layout changes, or new click handlers.
const kinds = [
  ['.character-card', 'character'], ['.character-spotlight-card', 'spotlight'],
  ['.featured-story-card', 'feature'], ['.merchandise-card', 'product'],
  ['.event-card', 'event'], ['.release-card', 'release'],
  ['.bookmark-card, .bookmark-item-card', 'saved'], ['.media-card', 'media'],
  ['.rail-item-card', 'rail'], ['.concept-card', 'highlight'],
  ['.content-card', 'chronicle'], ['.feedback-choice-card', 'choice'],
  ['.admin-action-card', 'admin'], ['.admin-analytics-stat-card, .dash-stat-card', 'stat'],
  ['.srs-history-card', 'history'],
  ['.dash-section-card, .submission-form-card, .sidebar-card, .profile-identity-card, .profile-form-card, .sitemap-card', 'utility'],
] as const
const selector = kinds.map(([query]) => query).join(',')
const spatialKinds = new Set(['character', 'product', 'chronicle', 'highlight', 'media', 'rail', 'release', 'event', 'saved'])

export function CardExperience() {
  useEffect(() => {
    const root = document.getElementById('root')!
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = matchMedia('(hover: hover) and (pointer: fine)')
    const cards = new Set<HTMLElement>()
    let active: HTMLElement | null = null
    let frame = 0, x = 0, y = 0, currentX = 0, currentY = 0
    const enabled = () => pointer.matches && !motion.matches && !document.hidden
    function reset() {
      cancelAnimationFrame(frame); frame = 0
      if (active) {
        active.removeAttribute('data-card-active')
        for (const key of ['--card-x', '--card-y', '--card-light-x', '--card-light-y']) active.style.removeProperty(key)
      }
      active = null; x = y = currentX = currentY = 0
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const card = entry.target as HTMLElement
        card.dataset.cardInView = String(entry.isIntersecting)
        if (entry.isIntersecting) card.dataset.cardRevealed = 'true'
        else if (card === active) reset()
      }
    }, { threshold: 0.05 })
    function discover() {
      for (const card of cards) if (!card.isConnected) { observer.unobserve(card); cards.delete(card); if (card === active) reset() }
      root.querySelectorAll<HTMLElement>(selector).forEach(card => {
        if (cards.has(card)) return
        cards.add(card)
        const kind = kinds.find(([query]) => card.matches(query))![1]
        card.dataset.fhpCard = kind
        if (spatialKinds.has(kind)) card.dataset.cardSpatial = 'true'
        observer.observe(card)
      })
    }
    function render() {
      frame = 0
      if (!active || !enabled()) { reset(); return }
      currentX += (x - currentX) * .2
      currentY += (y - currentY) * .2
      active.style.setProperty('--card-x', currentX.toFixed(3))
      active.style.setProperty('--card-y', currentY.toFixed(3))
      active.style.setProperty('--card-light-x', `${50 + currentX * 40}%`)
      active.style.setProperty('--card-light-y', `${35 + currentY * 30}%`)
      if (Math.abs(x - currentX) + Math.abs(y - currentY) > .003) frame = requestAnimationFrame(render)
    }
    function move(event: PointerEvent) {
      if (!enabled() || event.pointerType === 'touch') return
      const card = (event.target as Element).closest<HTMLElement>('[data-fhp-card]')
      if (!card || card.matches('[data-fhp-card="utility"], [data-fhp-card="history"], [data-fhp-card="stat"]') || card.querySelector('iframe, video')) { reset(); return }
      if (card !== active) { reset(); active = card; card.dataset.cardActive = 'true' }
      const rect = card.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
      if (!frame) frame = requestAnimationFrame(render)
    }
    const mutation = new MutationObserver(discover)
    discover()
    mutation.observe(root, { childList: true, subtree: true })
    root.addEventListener('pointermove', move, { passive: true })
    root.addEventListener('pointerleave', reset)
    document.addEventListener('visibilitychange', reset)
    window.addEventListener('blur', reset)
    motion.addEventListener('change', reset)
    pointer.addEventListener('change', reset)
    return () => {
      reset(); observer.disconnect(); mutation.disconnect()
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset)
      document.removeEventListener('visibilitychange', reset); window.removeEventListener('blur', reset)
      motion.removeEventListener('change', reset); pointer.removeEventListener('change', reset)
    }
  }, [])
  return null
}
