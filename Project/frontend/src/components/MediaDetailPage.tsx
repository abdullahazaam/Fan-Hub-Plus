import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BookmarkIcon, StarIcon } from './Icons'
import { getMediaCatalog, rateMedia } from '../api'
import type { MediaItem } from '../types'
import { withSpotlightArtwork } from './MediaRail'
import './MediaDetailPage.css'

interface Props { id:string; initialItem:MediaItem|null; onSelect:(item:MediaItem)=>void; onLibrary:()=>void; isBookmarked:(id:number)=>boolean; onToggleBookmark:(item:MediaItem)=>void; onSignIn:()=>void; onRatingUpdated:(id:number,avg:number,count:number,score:number)=>void }
function youtubeEmbed(source:string) {
  try {
    const url=new URL(source.trim()), host=url.hostname.replace(/^www\./,'')
    if(!['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','youtu.be'].includes(host))return null
    const segments=url.pathname.split('/').filter(Boolean)
    const id=host==='youtu.be'?segments[0]:url.searchParams.get('v')||(['embed','shorts','live'].includes(segments[0])?segments[1]:null)
    return id&&/^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`:null
  }catch{return null}
}
function playableSource(source:string) {
  try {const url=new URL(source,window.location.origin);return ['https:','http:'].includes(url.protocol)&&/\.(mp4|webm|ogg|mp3|wav|m4a|aac|oga)(?:$)/i.test(url.pathname)?url.href:null}catch{return null}
}
export const MediaDetailPage:React.FC<Props>=({id,initialItem,onSelect,onLibrary,isBookmarked,onToggleBookmark,onSignIn,onRatingUpdated})=>{
  const [item,setItem]=useState<MediaItem|null>(initialItem?.id===Number(id)?initialItem:null)
  const {user}=useAuth()
  const [ratingBusy,setRatingBusy]=useState(false)
  const [playerFailed,setPlayerFailed]=useState(false)
  const [catalog,setCatalog]=useState<MediaItem[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    let live=true
    setLoading(true);setError('');setPlayerFailed(false)
    const timeout=window.setTimeout(()=>{if(live){setError('Media is taking too long to load. Please retry.');setLoading(false);live=false}},15000)
    getMediaCatalog().then(items=>{if(!live)return;setCatalog(items);const found=items.find(entry=>entry.id===Number(id));setItem(found?withSpotlightArtwork(found):null);setLoading(false);window.clearTimeout(timeout)}).catch(()=>{if(live){setError('Media could not be loaded. Please retry.');setLoading(false);window.clearTimeout(timeout)}})
    return()=>{live=false;window.clearTimeout(timeout)}
  },[id,retry])
  if(!item)return <main className="media-detail"><button className="media-detail-back" onClick={onLibrary}>? Media library</button><div className="media-detail-player"><div className="media-unavailable" role="status"><h1>{loading?'Loading media?':'Media unavailable'}</h1><p>{loading?'Opening the selected media.':error||'This media ID does not match an existing item.'}</p>{!loading&&<button onClick={()=>setRetry(value=>value+1)}>Retry</button>}</div></div></main>
  const rate=async(score:number)=>{if(!user){onSignIn();return}setRatingBusy(true);setError('');try{const result=await rateMedia(item.id,score);setItem({...item,...result});onRatingUpdated(item.id,result.averageRating,result.ratingsCount,result.userRating)}catch{setError('Rating could not be saved. Please try again.')}finally{setRatingBusy(false)}}
  const audio=(item.mediaType||'').toLowerCase()==='audio', embed=youtubeEmbed(item.mediaUrl||''), direct=playableSource(item.mediaUrl||'')
  const related=catalog.filter(entry=>entry.id!==item.id).sort((a,b)=>Number(b.fandomUniverse===item.fandomUniverse)-Number(a.fandomUniverse===item.fandomUniverse)||Number(b.mediaType===item.mediaType)-Number(a.mediaType===item.mediaType)).slice(0,4)
  return <main className="media-detail">
    <button className="media-detail-back" onClick={onLibrary}>← Media library</button>
    <div className="media-detail-player" data-player-kind={audio?'audio':'video'} data-provider={embed?'youtube':'native'}>
      {(!embed&&!direct)||playerFailed?<div className="media-unavailable"><h2>Media unavailable</h2><p>{playerFailed?'This source could not be played. Try the original source below.':'The source URL is missing or is not a supported video or audio URL.'}</p></div>:embed?<iframe src={embed} title={`${audio?'Soundtrack':'Video'} player: ${item.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:audio?<div className="media-detail-audio"><img src={item.thumbnailUrl} alt=""/><audio onError={()=>setPlayerFailed(true)} controls preload="metadata" src={direct||undefined}/></div>:<video onError={()=>setPlayerFailed(true)} controls playsInline preload="metadata" poster={item.thumbnailUrl} src={direct||undefined}/>}
    </div>
    <section className="media-detail-copy media-info-panel" aria-label="Media information">
      <img className="media-detail-artwork" src={item.thumbnailUrl} alt={item.title}/>
      <div className="media-info-content">
        <div className="media-info-badges"><span>{item.mediaType}</span><span>{item.fandomUniverse}</span></div>
        <h1>{item.title}</h1>
        <p className="media-info-description">{item.description}</p>
        <dl className="media-info-metadata">
          <div><dt>Rating</dt><dd>{(Number(item.averageRating)||0).toFixed(1)} / 5</dd></div>
          <div><dt>Reviews</dt><dd>{item.ratingsCount}</dd></div>
          <div><dt>Duration</dt><dd>{Math.floor(item.durationSeconds/60)}:{String(item.durationSeconds%60).padStart(2,'0')}</dd></div>
          <div><dt>Added</dt><dd>{Number.isNaN(new Date(item.createdAt).getTime())?'Not provided':new Date(item.createdAt).getFullYear()}</dd></div>
          <div><dt>Creator / artist</dt><dd>{(item as MediaItem & {artist?:string;creator?:string}).artist || (item as MediaItem & {creator?:string}).creator || 'Not provided'}</dd></div>
        </dl>
        {item.tags&&<div className="media-info-tags" aria-label="Tags">{item.tags.split(',').map(tag=>tag.trim()).filter(Boolean).map((tag,index)=><span key={`${tag}-${index}`}>{tag}</span>)}</div>}
        <div className="media-info-rating"><span>Your rating</span><div className="media-detail-stars" role="group" aria-label="Rate this media">{[1,2,3,4,5].map(score=><button key={score} disabled={ratingBusy} aria-label={`Rate ${score} stars`} aria-pressed={item.userRating===score} onClick={()=>rate(score)}><StarIcon size={23} fill={(item.userRating||0)>=score?'currentColor':'none'}/></button>)}</div>{!user&&<button className="media-info-signin" onClick={onSignIn}>Sign in to rate</button>}</div>
        <div className="media-detail-engagement"><button className="media-info-save" aria-pressed={isBookmarked(item.id)} onClick={()=>onToggleBookmark(item)}><BookmarkIcon size={17} fill={isBookmarked(item.id)?'currentColor':'none'}/>{isBookmarked(item.id)?'Saved':'Save media'}</button>{item.mediaUrl?.trim()&&<a className="media-info-source" href={item.mediaUrl} target="_blank" rel="noopener noreferrer">Open Source &#8599;</a>}</div>
        {error&&<p role="status">{error}</p>}
      </div>
    </section>
    {related.length>0&&<div className="media-detail-related"><h2>Related media</h2><div>{related.map(entry=>{const relatedItem=withSpotlightArtwork(entry);return <button key={entry.id} onClick={()=>onSelect(relatedItem)}><img src={relatedItem.thumbnailUrl} alt=""/><span>{entry.mediaType}</span><strong>{entry.title}</strong></button>})}</div></div>}
  </main>
}
