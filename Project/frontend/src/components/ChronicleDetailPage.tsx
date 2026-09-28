import { useEffect, useState } from 'react'
import type { ContentItem } from '../types'
import { getContentById } from '../api'
import { useAuth } from '../context/AuthContext'
import { resolveChronicleArtwork } from './chronicleArtworkResolver'
import './ChronicleDetailPage.css'
interface Props { id:string; initialItem:ContentItem|null; onBack:()=>void; onEdit:(item:ContentItem)=>void; isBookmarked:(id:number)=>boolean; onToggleBookmark:(item:ContentItem)=>void }
export function ChronicleDetailPage({id,initialItem,onBack,onEdit,isBookmarked,onToggleBookmark}:Props){
 const {user}=useAuth()
 const [item,setItem]=useState<ContentItem|null>(()=>initialItem?.id===Number(id)?initialItem:window.history.state?.chronicle?.id===Number(id)?window.history.state.chronicle:null)
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{if(initialItem?.id===Number(id))setItem(initialItem)},[initialItem,id])
 useEffect(()=>{let active=true;getContentById(Number(id)).then(data=>{if(active){setItem(data);setLoading(false)}}).catch(()=>{if(active){setError('This chronicle could not be loaded. Please return to Chronicles and try again.');setLoading(false)}});return()=>{active=false}},[id])
 const back=<button className="chronicle-page-button" onClick={onBack}>? Back to Chronicles</button>
 if(!item)return <main className="chronicle-detail-page">{back}<section className="chronicle-page-body" role="status"><h1>{loading?'Loading chronicle?':'Chronicle unavailable'}</h1><p>{error}</p></section></main>
 const image=resolveChronicleArtwork(item)
 const date=new Date(item.releaseDate||item.createdAt)
 return <main className="chronicle-detail-page">{back}<article>
  <header className="chronicle-page-hero">
   <img src={image} alt={item.title} onError={e=>{if(item.thumbnailUrl&&e.currentTarget.getAttribute('src')!==item.thumbnailUrl)e.currentTarget.src=item.thumbnailUrl}}/>
   <div className="chronicle-page-heading"><div className="chronicle-page-badges"><span>{item.categoryName}</span><span>{item.contentType}</span><span>{item.popularityScore}% rating</span></div><p>{item.fandomUniverse}</p><h1>{item.title}</h1><div className="chronicle-page-byline">{item.author&&<span>By {item.author}</span>}{!Number.isNaN(date.getTime())&&<time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}</time>}</div></div>
  </header>
  <div className="chronicle-page-body"><p className="chronicle-page-summary">{item.description}</p><div className="chronicle-page-prose">{(item.contentText||'').split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=>paragraph.startsWith('### ')?<h2 key={index}>{paragraph.slice(4)}</h2>:<p key={index}>{paragraph}</p>)}</div>
   {!!item.tags&&<div className="chronicle-page-tags" aria-label="Tags">{item.tags.split(',').map(tag=>tag.trim()).filter(Boolean).map((tag,i)=><span key={i}>{tag}</span>)}</div>}
   <div className="chronicle-page-actions"><button className="chronicle-page-button" aria-pressed={isBookmarked(item.id)} onClick={()=>onToggleBookmark(item)}>{isBookmarked(item.id)?'Saved to My Archive':'Save to My Archive'}</button>{user?.role==='Admin'&&<button className="chronicle-page-button" onClick={()=>onEdit(item)}>Edit Chronicle</button>}</div>
   {error&&<p role="status">{error}</p>}
  </div></article></main>
}
