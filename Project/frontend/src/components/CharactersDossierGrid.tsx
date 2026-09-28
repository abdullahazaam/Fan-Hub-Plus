import type { Character } from '../types'
import { useAuth } from '../context/AuthContext'
import { ArrowRightIcon, BookmarkIcon, EditIcon } from './Icons'
import { resolveCharacterPortrait } from './characterPageRoster'
import './CharactersDossierGrid.css'
interface Props { characters:Character[]; onSelect:(character:Character)=>void; onEdit:(character:Character)=>void; isBookmarked:(id:number)=>boolean; onToggleBookmark:(character:Character)=>void }
export function CharactersDossierGrid({characters,onSelect,onEdit,isBookmarked,onToggleBookmark}:Props){
  const {user}=useAuth()
  return <div className="characters-dossier-grid">{characters.map((character,index)=><article key={character.id} className="catalog-legend">
    <img className="catalog-legend-image" src={resolveCharacterPortrait(character)} alt={character.name} loading="lazy" onError={e=>{if(character.bannerUrl&&e.currentTarget.getAttribute('src')!==character.bannerUrl)e.currentTarget.src=character.bannerUrl}}/>
    <div className="catalog-legend-shade"/>
    <button className="catalog-legend-select" aria-label={`View dossier: ${character.name}`} onClick={()=>onSelect(character)}/>
    <div className="catalog-legend-content">
      <div className="catalog-legend-number">{String(index+1).padStart(2,'0')}<span/></div>
      <h3>{character.name}</h3>
      <p className="catalog-legend-role">{character.roleTitle}</p>
      <div className="catalog-legend-bottom"><div className="catalog-legend-pills"><span>{character.categoryName}</span><span>{character.fandomUniverse||character.originUniverse}</span></div>
        <button className="catalog-legend-arrow" aria-label={`Open ${character.name} dossier`} onClick={()=>onSelect(character)}><ArrowRightIcon size={22}/></button>
      </div>
    </div>
    <div className="catalog-legend-tools">
      {user&&character.id>0&&<button aria-label={`Bookmark ${character.name}`} aria-pressed={isBookmarked(character.id)} onClick={()=>onToggleBookmark(character)}><BookmarkIcon size={16} fill={isBookmarked(character.id)?'currentColor':'none'}/></button>}
      {user?.role==='Admin'&&character.id>0&&<button aria-label={`Edit ${character.name}`} onClick={()=>onEdit(character)}><EditIcon size={16}/></button>}
    </div>
  </article>)}</div>
}
