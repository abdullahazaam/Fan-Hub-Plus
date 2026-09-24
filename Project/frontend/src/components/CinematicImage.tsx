import { useId, useState, type ImgHTMLAttributes } from 'react'
import './CinematicImage.css'
import cityArt from '../assets/nexus-city.webp'
import galleryArt from '../assets/nexus-gallery.webp'

type Props = ImgHTMLAttributes<HTMLImageElement> & { universe?: string }

/** Original decorative scenery, never presented as a character or franchise likeness. */
function ArchiveIllustration({ universe = '' }: { universe?: string }) {
  const id = useId().replace(/:/g,'')
  const label=universe.toLowerCase()
  const kind=label.includes('anime')?'anime':label.includes('manga')?'manga':label.includes('comic')?'comics':label.includes('cosplay')?'cosplay':label.includes('pop')||label.includes('audio')?'music':label.includes('movie')||label.includes('video')?'cinema':label.includes('tv')?'tv':label.includes('event')?'events':label.includes('character')?'character':'gaming'
  return <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-sky`} x2=".3" y2="1"><stop stopColor="var(--art-sky)"/><stop offset="1" stopColor="var(--art-night)"/></linearGradient>
      <linearGradient id={`${id}-stone`}><stop stopColor="var(--art-edge)"/><stop offset=".06" stopColor="var(--art-front)"/><stop offset=".7" stopColor="var(--art-mid)"/><stop offset="1" stopColor="var(--art-night)"/></linearGradient>
      <radialGradient id={`${id}-light`}><stop stopColor="#ba4b36" stopOpacity=".32"/><stop offset="1" stopColor="#ba4b36" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="var(--art-mid)"/><stop offset="1" stopColor="var(--art-night)"/></linearGradient>
    </defs>
    <path d="M0 0h1000v600H0Z" fill={`url(#${id}-sky)`}/>
    <ellipse cx="600" cy="280" rx="410" ry="320" fill={`url(#${id}-light)`}/>
    <path d="M0 428 90 291 146 367 226 249 294 389 410 308 465 424 608 314 689 405 760 276 874 389 952 302 1000 359V600H0Z" fill="var(--art-mid)" opacity=".24"/>
    <path d="M0 445H1000V600H0Z" fill={`url(#${id}-floor)`}/>
    <path d="M465 445h135l178 155H259Z" fill="var(--art-edge)" opacity=".12"/>
    {kind==='gaming'&&<g fill={`url(#${id}-stone)`}>
      {[0,1,2,3,4,5,6].map(i=><g key={i} transform={`translate(${80+i*137},${i%2?210:285})`}><path d="M0 215V20L27 0h52l22 20v195Z"/><path d="M27 5v209" stroke="#c65a40" strokeWidth="2"/>{[0,1,2,3,4].map(j=><path key={j} d={`M41 ${44+j*27}h30`} stroke="var(--art-edge)" strokeWidth="2" opacity=".35"/>)}</g>)}
      <path d="M455 447V184L494 118h43l36 66v263Z"/><path d="M495 126v320" stroke="#ba4434" strokeWidth="4"/>
    </g>}
    {kind==='anime'&&<g fill={`url(#${id}-stone)`} stroke="var(--art-edge)" strokeWidth="1.5"><path d="M385 445V236h230v209Z"/><path d="M310 262 415 221 500 150 585 221 690 262 584 252H416Z"/><path d="M330 350 419 301 500 261 581 301 670 350 571 337H429Z"/><path d="M280 430 407 365 500 327 593 365 720 430 590 411H410Z"/><path d="M500 145V97"/><path d="M447 445v-67h106v67" fill="#9f3228" stroke="none"/></g>}
    {(kind==='manga'||kind==='comics')&&<g fill={`url(#${id}-stone)`} stroke="var(--art-edge)" strokeWidth="2">
      <path d="M258 214Q362 185 500 259Q638 185 742 214L770 430Q640 398 500 465Q360 398 230 430Z"/>
      <path d="M500 259V465" stroke="#b83c2e" strokeWidth="5"/>
      {[0,1,2,3,4,5].map(i=><path key={i} d={`M${280-i*3} ${251+i*26}Q380 ${235+i*26} 467 ${279+i*26}M533 ${279+i*26}Q620 ${235+i*26} ${720+i*3} ${251+i*26}`} opacity=".28" fill="none"/>)}</g>}
    {(kind==='cinema'||kind==='tv')&&<g><path d="M204 136h592v284H204Z" fill={`url(#${id}-stone)`} stroke="var(--art-edge)" strokeWidth="2"/><path d="M228 158h544v229H228Z" fill="var(--art-night)"/><path d="m515 188 90 104-166 54Z" fill="#b74132" opacity=".5"/><path d="m226 382 150-127 104 69 80-53 210 112Z" fill="var(--art-mid)"/><path d="m500 425-130 160h260Z" fill="#bc9a7422"/>{[0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${115+i*91} 488v-22q32-20 64 0v22Z`} fill={`url(#${id}-stone)`}/>)}</g>}
    {kind==='music'&&<g><ellipse cx="506" cy="442" rx="210" ry="34" fill="#0004"/><circle cx="510" cy="298" r="172" fill="var(--art-night)" stroke="var(--art-edge)" strokeWidth="2"/>{[80,96,115,137,157].map(r=><circle key={r} cx="510" cy="298" r={r} fill="none" stroke="var(--art-edge)" opacity=".17"/>)}<circle cx="510" cy="298" r="60" fill="#94372b"/><circle cx="510" cy="298" r="12" fill="var(--art-night)"/><path d="M738 173v223l-30 33" fill="none" stroke="var(--art-edge)" strokeWidth="9"/></g>}
    {kind==='cosplay'&&<g fill={`url(#${id}-stone)`} stroke="var(--art-edge)" strokeWidth="2"><path d="M353 203 419 137 500 176 581 137 647 203 609 369 500 449 391 369Z"/><path d="m393 240 74 26-58 31Zm214 0-74 26 58 31Z" fill="var(--art-night)"/><path d="M500 208v155l-32-14M467 390h66" fill="none" stroke="#ba4634"/></g>}
    {(kind==='events'||kind==='character')&&<g fill={`url(#${id}-stone)`} stroke="var(--art-edge)" strokeWidth="1">
      {[0,1,2].map(i=><path key={i} d={`M${130+i*95} 445V${95+i*42}H${870-i*95}V445h-28V${123+i*42}H${158+i*95}V445Z`} opacity={.4+i*.2}/>)}
      <path d="M430 445V219h140v226Z" fill="var(--art-night)"/><path d="M429 221h142" stroke="#b74132" strokeWidth="4"/>
      {kind==='events'&&[0,1,2,3,4,5,6,7].map(i=><g key={i} transform={`translate(${242+i*74},${465+(i%3)*18})`} stroke="none"><circle cy="-27" r="7"/><path d="M-7-18h14l6 35h-26Z"/></g>)}
    </g>}
    <path d="M0 535Q450 560 1000 503V600H0Z" fill="var(--art-night)" opacity=".35"/>
  </svg>
}

function ImageWithFallback({ universe, className='', alt='', src, ...props }: Props) {
  const [status,setStatus]=useState<'loading'|'loaded'|'failed'>('loading')
  const localArt = /gaming|cyberpunk/i.test(universe || '') ? cityArt : /events|character/i.test(universe || '') ? galleryArt : null
  return <span className={`${className} cinematic-image`} data-image-state={status}>
    <ArchiveIllustration universe={universe}/>
    {localArt && status!=='loaded' && <img className="local-universe-art" src={localArt} alt="" loading="lazy" aria-hidden="true"/>}
    {status!=='failed'&&<img {...props} src={src} alt={alt} onLoad={()=>setStatus('loaded')} onError={()=>setStatus('failed')}/>}
    {status==='failed'&&<span className="artwork-availability" role="img" aria-label={`${alt || 'Artwork'} unavailable; decorative universe illustration`}>Universe illustration</span>}
  </span>
}
export function CinematicImage(props: Props) { return <ImageWithFallback key={props.src} {...props}/> }
