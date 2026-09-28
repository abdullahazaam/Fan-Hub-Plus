import React, { useState, useRef, useEffect } from 'react'
import { getMediaCatalog } from '../api'
import type { MediaItem } from '../types'
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, StarIcon } from './Icons'
import './MediaRail.css'

export interface SpotlightMediaEntry {
  id: string
  mediaType: 'Audio' | 'Video'
  displayType: string
  title: string
  fandomUniverse: string
  rating: number
  ratingsCount: number
  duration: string
  durationSeconds: number
  thumbnailUrl: string
  ctaText: string
  mediaUrl: string
  description: string
  tags: string
  accentColor: string
}

const SPOTLIGHT_MEDIA: SpotlightMediaEntry[] = [
  {
    id: 'berserk-ost',
    mediaType: 'Audio',
    displayType: 'ANIME OST',
    title: 'Susumu Hirasawa — "Forces" (Berserk Original Soundtrack)',
    fandomUniverse: 'Midland / Berserk',
    rating: 5.0,
    ratingsCount: 2240,
    duration: '4:04',
    durationSeconds: 244,
    thumbnailUrl: '/media/anime_ost.jpg',
    ctaText: 'Play Score',
    mediaUrl: 'https://www.youtube.com/watch?v=LqUuF9Z1eNk',
    description: 'Susumu Hirasawa\'s legendary battle anthem featuring soaring choral vocalizations and industrial martial rhythms.',
    tags: 'Anime, OST, Berserk, Susumu Hirasawa, Midland',
    accentColor: '#e50914',
  },
  {
    id: 'nier-ost',
    mediaType: 'Audio',
    displayType: 'GAME SOUNDTRACK',
    title: 'Keiichi Okabe — "Weight of the World" (NieR: Automata)',
    fandomUniverse: 'Ruined Earth / NieR: Automata',
    rating: 5.0,
    ratingsCount: 3820,
    duration: '5:45',
    durationSeconds: 345,
    thumbnailUrl: '/media/game_ost.jpg',
    ctaText: 'Play Score',
    mediaUrl: 'https://www.youtube.com/watch?v=Egn_VNVKzI4',
    description: 'Keiichi Okabe\'s emotionally overwhelming ending theme concluding the androids\' struggle for existential purpose.',
    tags: 'Gaming, OST, NieR: Automata, Square Enix, Choral',
    accentColor: '#38bdf8',
  },
  {
    id: 'dune-trailer',
    mediaType: 'Video',
    displayType: 'MOVIE TRAILER',
    title: 'Dune: Part Two — Official Theatrical IMAX Trailer',
    fandomUniverse: 'Arrakis / Dune Universe',
    rating: 4.9,
    ratingsCount: 6450,
    duration: '2:48',
    durationSeconds: 168,
    thumbnailUrl: '/media/movie_trailer.jpg',
    ctaText: 'Watch Trailer',
    mediaUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    description: 'Warner Bros. & Legendary official theatrical trailer depicting Paul Atreides uniting the Fremen across Arrakis.',
    tags: 'Trailer, Movies, Dune, Sci-Fi, IMAX',
    accentColor: '#f59e0b',
  },
  {
    id: 'kda-video',
    mediaType: 'Video',
    displayType: 'K-POP VIDEO',
    title: 'K/DA — "POP/STARS" (feat. (G)I-DLE, Madison Beer)',
    fandomUniverse: 'Runeterra / K-Pop Universe',
    rating: 4.9,
    ratingsCount: 9810,
    duration: '3:24',
    durationSeconds: 204,
    thumbnailUrl: '/media/kpop_video.jpg',
    ctaText: 'Watch Video',
    mediaUrl: 'https://www.youtube.com/embed/UOxkGD8qRB4',
    description: 'Riot Games official music video featuring virtual K-Pop phenomenon K/DA in high-octane neon choreography.',
    tags: 'K-Pop, Music Video, K/DA, Riot Games, Dance',
    accentColor: '#ec4899',
  },
  {
    id: 'cyberpunk-trailer',
    mediaType: 'Video',
    displayType: 'GAMING TRAILER',
    title: 'Cyberpunk 2077: Phantom Liberty — Official Cinematic Trailer',
    fandomUniverse: 'Night City / Cyberpunk 2077',
    rating: 4.9,
    ratingsCount: 5120,
    duration: '2:56',
    durationSeconds: 176,
    thumbnailUrl: '/media/gaming_trailer.jpg',
    ctaText: 'Watch Trailer',
    mediaUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    description: 'CD PROJEKT RED official spy-thriller expansion trailer featuring Solomon Reed and Johnny Silverhand in Dogtown.',
    tags: 'Gaming, Trailer, Cyberpunk 2077, CDPR, Night City',
    accentColor: '#06b6d4',
  },
]

interface MediaRailProps {
  items?: MediaItem[]
  onSelectMedia: (item: MediaItem) => void
  onToggleBookmark?: (item: MediaItem) => void
  isBookmarked?: (id: number) => boolean
}

export function spotlightItem(entry:SpotlightMediaEntry,items:MediaItem[]):MediaItem|undefined {
  const needles:Record<string,string[]>={'berserk-ost':['berserk','forces'],'nier-ost':['nier','weight of the world'],'dune-trailer':['dune'],'kda-video':['pop/stars','k/da'],'cyberpunk-trailer':['cyberpunk','phantom liberty']}
  const match=items.find(item=>item.mediaType.toLowerCase()===entry.mediaType.toLowerCase()&&needles[entry.id].some(word=>item.title.toLowerCase().includes(word)))
  return match?{...match,thumbnailUrl:entry.thumbnailUrl}:undefined
}

const MEDIA_ARTWORK_LOOKUP: [RegExp, string][] = [
  [/berserk|forces/i, '/media/anime_ost.jpg'],
  [/nier|weight of the world/i, '/media/game_ost.jpg'],
  [/dune/i, '/media/movie_trailer.jpg'],
  [/cyberpunk|phantom liberty/i, '/media/gaming_trailer.jpg'],
  [/k\/da|pop\/stars/i, '/media/kpop_video.jpg'],
  [/jujutsu|shibuya|specialz/i, '/media/jjk_specialz.jpg'],
  [/interstellar|caution/i, '/media/interstellar.jpg'],
  [/arcane/i, '/media/arcane_trailer.jpg'],
  [/attack on titan|rumbling/i, '/media/aot_rumbling.jpg'],
  [/elden ring|erdtree|messmer/i, '/media/eldenring_erdtree.jpg'],
  [/newjeans|super shy/i, '/media/newjeans_supershy.jpg'],
  [/bts|blood sweat/i, '/media/bts_bst.jpg'],
  [/spider-man|spider-verse|across the spider/i, '/media/spiderverse_trailer.jpg'],
  [/blade runner|tears in rain/i, '/media/bladerunner_2049.jpg'],
  [/witcher|silver for monsters/i, '/media/witcher_monsters.jpg'],
  [/house of the dragon/i, '/media/hotd_teaser.jpg'],
  [/cosplay/i, '/media/cosplay_summit.jpg'],
]

export function resolveMediaThumbnail(item: MediaItem): string {
  const text = `${item.title || ''} ${item.fandomUniverse || ''}`
  const match = MEDIA_ARTWORK_LOOKUP.find(([reg]) => reg.test(text))
  if (match) return match[1]
  if (item.thumbnailUrl && !item.thumbnailUrl.includes('placeholder') && !item.thumbnailUrl.includes('youtube.com') && !item.thumbnailUrl.includes('ytimg.com')) {
    return item.thumbnailUrl
  }
  return '/media/gaming_trailer.jpg'
}

export function withSpotlightArtwork(item:MediaItem):MediaItem {
  const entry=SPOTLIGHT_MEDIA.find(entry=>spotlightItem(entry,[item])?.id===item.id)
  if (entry) return {...item, thumbnailUrl: entry.thumbnailUrl}
  return {...item, thumbnailUrl: resolveMediaThumbnail(item)}
}

export const MediaRail: React.FC<MediaRailProps> = ({items=[],onSelectMedia,onToggleBookmark,isBookmarked}) => {
  const [catalog,setCatalog]=useState(items)
  const rail=useRef<HTMLDivElement>(null)
  useEffect(()=>{let live=true;getMediaCatalog().then(data=>{if(live)setCatalog(data)}).catch(()=>{});return()=>{live=false}},[])
  const slide=(direction:number)=>{
    const node=rail.current
    if(!node)return
    const end=node.scrollWidth-node.clientWidth
    const target=direction>0&&node.scrollLeft>=end-4?0:direction<0&&node.scrollLeft<=4?end:node.scrollLeft+direction*(node.clientWidth+12)
    node.scrollTo({left:target,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
  }
  return <section className="media-cinema-section" aria-label="Trailers, Streams & Soundtracks">
    <div className="home-section-header home-section-header-split media-cinema-header">
      <div><div className="home-section-eyebrow"><span className="home-eyebrow-pip"/><span>AUDIOVISUAL MULTIVERSE</span></div>
        <h2 className="home-section-title">Trailers, Streams & Soundtracks</h2>
        <p className="home-section-desc">Original scores, visual broadcasts and cinematic previews.</p></div>
      <div className="cinema-controls"><button type="button" aria-label="Previous media" onClick={()=>slide(-1)}><ChevronLeftIcon size={18}/></button>
        <button type="button" aria-label="Next media" onClick={()=>slide(1)}><ChevronRightIcon size={18}/></button></div>
    </div>
    <div className="cinema-rail" ref={rail} role="region" aria-label="Media carousel" tabIndex={0}
      onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();slide(e.key==='ArrowRight'?1:-1)}}}>
      {SPOTLIGHT_MEDIA.map(entry=>{
        const item=spotlightItem(entry,catalog.length?catalog:items)
        if(!item)return null
        return <article key={entry.id} className="cinema-tile">
          <img src={entry.thumbnailUrl} alt="" className="cinema-art"/>
          <div className="cinema-shade"/>
          <div className="cinema-top"><span>{entry.displayType}</span><span>{entry.duration}</span></div>
          <a className="cinema-open" href={`/media/${item.id}`} aria-label={`Play ${entry.title}`} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onSelectMedia(item)}}}>
            <span className="cinema-play-icon"><PlayIcon size={22} fill="currentColor"/></span>
            <span className="cinema-cta">{entry.ctaText} ?</span>
          </a>
          <div className="cinema-caption"><h3>{entry.title}</h3><span className="cinema-rating"><StarIcon size={12} fill="currentColor"/>{item.averageRating.toFixed(1)} <small>({item.ratingsCount})</small></span></div>
          {item.id>0&&onToggleBookmark&&isBookmarked&&<button className="cinema-save" aria-label={`Bookmark ${entry.title}`} aria-pressed={isBookmarked(item.id)} onClick={()=>onToggleBookmark(item)}><BookmarkIcon size={14} fill={isBookmarked(item.id)?'currentColor':'none'}/></button>}
        </article>
      })}
    </div>
  </section>
}
