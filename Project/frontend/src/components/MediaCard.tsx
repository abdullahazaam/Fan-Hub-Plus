import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { MediaItem } from '../types'
import { BookmarkIcon, MusicIcon, PlayIcon, StarIcon } from './Icons'
import { withSpotlightArtwork } from './MediaRail'
import './MediaLibraryCards.css'
interface MediaCardProps { item:MediaItem; onSelect?:(item:MediaItem)=>void; onEdit?:(item:MediaItem)=>void; onDelete?:(id:number)=>void; isBookmarked?:boolean; onToggleBookmark?:(item:MediaItem)=>void; onRatingUpdated?:(id:number,avg:number,count:number,userScore:number)=>void }
export const MediaCard=React.memo(function MediaCard({item,onSelect,onEdit,onDelete,isBookmarked=false,onToggleBookmark}:MediaCardProps){
 const {user}=useAuth();const audio=item.mediaType.toLowerCase()==='audio';const art=withSpotlightArtwork(item)
 return <article className="media-library-tile">
  <img src={art.thumbnailUrl} alt="" loading="lazy"/><div className="media-library-shade"/>
  <div className="media-library-top"><span>{audio?'AUDIO / SOUNDTRACK':'VIDEO / TRAILER'}</span><time>{Math.floor(item.durationSeconds/60)}:{String(item.durationSeconds%60).padStart(2,'0')}</time></div>
  <a className="media-library-link" href={`/media/${item.id}`} aria-label={`Play ${item.title}`} onClick={e=>{if(onSelect&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onSelect(item)}}}><span>{audio?<MusicIcon size={26}/>:<PlayIcon size={24} fill="currentColor"/>}</span></a>
  <div className="media-library-copy"><h3>{item.title}</h3><span><StarIcon size={13} fill="currentColor"/> {item.averageRating.toFixed(1)} <small>({item.ratingsCount})</small></span></div>
  {onToggleBookmark&&<button className="media-library-bookmark" aria-label={`Bookmark ${item.title}`} aria-pressed={isBookmarked} onClick={()=>onToggleBookmark(item)}><BookmarkIcon size={16} fill={isBookmarked?'currentColor':'none'}/></button>}
  {user?.role==='Admin'&&<div className="media-library-admin">{onEdit&&<button onClick={()=>onEdit(item)}>Edit</button>}{onDelete&&<button onClick={()=>{if(window.confirm(`Delete media item "${item.title}"?`))onDelete(item.id)}}>Delete</button>}</div>}
 </article>
})
