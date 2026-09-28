import type { ContentItem } from '../types'
import { useAuth } from '../context/AuthContext'
import { ArrowRightIcon, BookmarkIcon, EditIcon } from './Icons'
import { resolveChronicleArtwork } from './chronicleArtworkResolver'
import './ChroniclesEditorialGrid.css'
interface Props { items:ContentItem[]; onSelect:(item:ContentItem)=>void; onEdit:(item:ContentItem)=>void; isBookmarked:(id:number)=>boolean; onToggleBookmark:(item:ContentItem)=>void }
export function ChroniclesEditorialGrid({items,onSelect,onEdit,isBookmarked,onToggleBookmark}:Props){
  const {user}=useAuth()
  return <div className="chronicles-editorial-grid">{Array.from({length:Math.ceil(items.length/3)},(_,row)=><div className={`chronicles-editorial-row ${row%2?'is-reversed':''}`} key={row}>
    {items.slice(row*3,row*3+3).map((item,index)=>{const featured=index===(row%2?2:0);const date=new Date(item.releaseDate||item.createdAt);return <article key={item.id} className={`chronicles-editorial-card ${featured?'is-featured':''}`}>
      <img className="chronicles-editorial-art" src={resolveChronicleArtwork(item)} alt={item.title} loading="lazy" decoding="async" onError={e=>{if(item.thumbnailUrl&&e.currentTarget.getAttribute('src')!==item.thumbnailUrl)e.currentTarget.src=item.thumbnailUrl}}/>
      <div className="chronicles-editorial-shade"/>
      <span className="chronicles-editorial-category">{item.categoryName}</span>
      <div className="chronicles-editorial-tools">
        <button aria-label={`Bookmark ${item.title}`} aria-pressed={isBookmarked(item.id)} onClick={()=>onToggleBookmark(item)}><BookmarkIcon size={15} fill={isBookmarked(item.id)?'currentColor':'none'}/></button>
        {user?.role==='Admin'&&<button aria-label={`Edit ${item.title}`} onClick={()=>onEdit(item)}><EditIcon size={15}/></button>}
      </div>
      <div className="chronicles-editorial-copy"><h2><button onClick={()=>onSelect(item)}>{item.title}</button></h2><p>{item.description}</p>
        <div className="chronicles-editorial-meta">{!Number.isNaN(date.getTime())&&<time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</time>}<span>{item.author}</span><button className="chronicles-editorial-open" aria-label={`Read Chronicle: ${item.title}`} onClick={()=>onSelect(item)}><ArrowRightIcon size={18}/></button></div>
      </div>
    </article>})}
  </div>)}</div>
}
