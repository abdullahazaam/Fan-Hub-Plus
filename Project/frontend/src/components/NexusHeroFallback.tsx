import { useLayoutEffect, useRef } from 'react'
import { CARD, HERO_REALMS, OPERATIVE, OPERATIVE_CONTACTS, heroView, realmPoints, type HeroSceneProps } from './NexusHeroLayout'

export function HeroSceneFallback({theme,onSelect,selected}:HeroSceneProps) {
  const ref=useRef<SVGSVGElement>(null)
  useLayoutEffect(()=>{
    const svg=ref.current!
    const resize=()=>{const {width,height}=svg.getBoundingClientRect();if(!width||!height)return;const v=heroView(width,height);svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.width} ${v.height}`)}
    resize()
    const observer=new ResizeObserver(resize)
    observer.observe(svg);return()=>observer.disconnect()
  },[])
  return <svg ref={ref} className="fh-scene-fallback" viewBox="0 0 1875 839" aria-label="Eight fandom realms">
    <HeroFallbackArtwork theme={theme}/>
    {HERO_REALMS.map((realm,i)=><g key={realm.slug} role="button" tabIndex={0} aria-label={`Enter ${realm.name} Realm`} aria-pressed={selected===realm.slug} onClick={()=>onSelect(realm.slug)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(realm.slug)}}}><polygon className="fh-realm-hit" points={realmPoints(i)}/></g>)}
  </svg>
}
export function HeroFallbackArtwork({theme}:{theme:'dark'|'light'}) {
  return <g className="fh-fallback-art" aria-hidden="true">
    <image href={`/hero_${theme}.png`} width="1875" height="839"/>
    {HERO_REALMS.map(r=><g key={r.slug} transform={`translate(${r.x} ${r.y}) rotate(${r.angle}) scale(${CARD.width/254} ${CARD.height/132})`}>
      <rect x="-129" y="-68" width="258" height="136" rx="9" fill="#351219" stroke="#ff6464" strokeWidth="3"/>
      <svg x="-127" y="-66" width="254" height="97.3" viewBox="0 0 254 97.3" overflow="hidden"><image href={`/realms/${r.slug}.jpg`} width="254" height="162.2" preserveAspectRatio="none"/></svg>
      <rect x="-127" y="28" width="254" height="38" fill="#060608"/>
      <rect x="-118" y="38" width="4" height="18" fill="#ff3b44"/>
      <text x="-106" y="52" fill="white" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" letterSpacing="0.8">{r.name}</text>
    </g>)}
    <defs><radialGradient id={`fh-operative-contact-${theme}`}><stop stopColor="#080304" stopOpacity=".6"/><stop offset=".45" stopColor="#080304" stopOpacity=".333"/><stop offset="1" stopColor="#080304" stopOpacity="0"/></radialGradient></defs>
    {OPERATIVE_CONTACTS.map((p,i)=><ellipse key={i} cx={p.x} cy={p.y} rx={p.width/2} ry={p.height/2} fill={`url(#fh-operative-contact-${theme})`}/>)}
    <image href="/fh-operative.png" {...OPERATIVE}/>
  </g>
}
