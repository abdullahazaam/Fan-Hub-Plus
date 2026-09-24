import { useEffect, useRef, type ReactNode } from 'react'
import './HomepageExperience.css'

/** Progressive enhancement: content is visible before JS and with reduced motion. */
export function HomepageExperience({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    const observed = new Set<HTMLElement>()
    const visible = new Set<HTMLElement>()
    const selector = '.concept-card, .editorial-story-container, .editorial-spotlight-container, .media-rail-section, .compact-showcase-container'
    let frame = 0, target: HTMLElement | null = null, x = 0, y = 0, currentX = 0, currentY = 0, scrollDirty = false
    const richMotion = () => !reduced.matches && fine.matches && innerWidth > 760
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement
        element.classList.toggle('is-in-view', entry.isIntersecting)
        if (entry.isIntersecting) {
          visible.add(element)
          element.dataset.reveal = 'visible'
        } else visible.delete(element)
      }
      scrollDirty = true
      invalidate()
    }, {threshold: .06})
    function discover() {
      root!.querySelectorAll<HTMLElement>(selector).forEach(element => {
        if (observed.has(element)) return
        observed.add(element)
        element.dataset.reveal = richMotion() && element.getBoundingClientRect().top > innerHeight ? 'pending' : 'visible'
        observer.observe(element)
      })
    }
    const mutation = new MutationObserver(discover)
    mutation.observe(root, {childList:true, subtree:true})
    discover()
    function render() {
      frame = 0
      if (document.hidden || !richMotion()) return
      if (scrollDirty) {
        visible.forEach(element => {
          const rect=element.getBoundingClientRect()
          element.style.setProperty('--section-travel', String(Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight))))
        })
        scrollDirty = false
      }
      if (target) {
        currentX += (x-currentX)*.18
        currentY += (y-currentY)*.18
        target.style.setProperty('--scene-x',String(currentX))
        target.style.setProperty('--scene-y',String(currentY))
        if (Math.abs(x-currentX)+Math.abs(y-currentY)>.003) invalidate()
      }
    }
    function invalidate() { if (!frame && richMotion() && !document.hidden) frame=requestAnimationFrame(render) }
    const move = (event: PointerEvent) => {
      if (!richMotion()) return
      const card=(event.target as Element).closest<HTMLElement>('.featured-story-card, .character-spotlight-card')
      if (!card) { x=y=0; invalidate(); return }
      if (target && target!==card) { target.style.removeProperty('--scene-x'); target.style.removeProperty('--scene-y') }
      target=card
      const rect=card.getBoundingClientRect()
      x=(event.clientX-rect.left)/rect.width*2-1
      y=(event.clientY-rect.top)/rect.height*2-1
      invalidate()
    }
    const leave = () => { x=y=0; invalidate() }
    const scroll = () => { scrollDirty=true; invalidate() }
    const focus = (event: FocusEvent) => {
      const section=(event.target as Element).closest<HTMLElement>(selector)
      if(section) section.dataset.reveal='visible'
    }
    const preference = () => {
      if (!richMotion()) {
        cancelAnimationFrame(frame);frame=0
        observed.forEach(element=>{element.dataset.reveal='visible';element.style.removeProperty('--section-travel')})
        target?.style.removeProperty('--scene-x');target?.style.removeProperty('--scene-y')
      }
    }
    root.addEventListener('pointermove',move,{passive:true})
    root.addEventListener('pointerleave',leave)
    root.addEventListener('focusin',focus)
    window.addEventListener('scroll',scroll,{passive:true})
    reduced.addEventListener('change',preference);fine.addEventListener('change',preference)
    return () => {
      cancelAnimationFrame(frame);observer.disconnect();mutation.disconnect()
      root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);root.removeEventListener('focusin',focus)
      window.removeEventListener('scroll',scroll);reduced.removeEventListener('change',preference);fine.removeEventListener('change',preference)
    }
  }, [])
  return <main ref={rootRef} className="homepage-main cinematic-home">{children}</main>
}
