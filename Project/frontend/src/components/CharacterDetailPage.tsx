import { useEffect, useState } from 'react'
import type { Character } from '../types'
import { getCharacterById } from '../api'
import { characterPageRoster, resolveCharacterPortrait } from './characterPageRoster'
import './CharacterDetailPage.css'
interface Props { id:string; initialCharacter:Character|null; onBack:()=>void; onEdit:(character:Character)=>void; isAdmin:boolean }
export function CharacterDetailPage({id,initialCharacter,onBack,onEdit,isAdmin}:Props){
 const [character,setCharacter]=useState<Character|null>(()=>initialCharacter?.id===Number(id)?initialCharacter:window.history.state?.character?.id===Number(id)?window.history.state.character:characterPageRoster([]).find(c=>c.id===Number(id))||null)
 const [loading,setLoading]=useState(Number(id)>0)
 const [error,setError]=useState('')
 useEffect(()=>{if(initialCharacter?.id===Number(id))setCharacter(initialCharacter)},[initialCharacter,id])
 useEffect(()=>{let live=true;if(Number(id)<=0){setLoading(false);return}setLoading(true);getCharacterById(Number(id)).then(item=>{if(live){setCharacter(item);setLoading(false)}}).catch(()=>{if(live){setError('This character could not be loaded. Please return to Characters and try again.');setLoading(false)}});return()=>{live=false}},[id])
 if(!character)return <main className="character-detail-page"><button className="character-page-back" onClick={onBack}>← Back to Characters</button><section className="character-page-panel" role="status"><h1>{loading?'Loading character…':'Character unavailable'}</h1><p>{error||(!loading?'This character could not be found.':'Opening the dossier.')}</p></section></main>
 const art=resolveCharacterPortrait(character)
 return <main className="character-detail-page">
   <button className="character-page-back" onClick={onBack}>← Back to Characters</button>
   <header className="character-page-hero">
     {art&&<img src={art} alt={character.name}/>}
     <div className="character-page-hero-shade"/>
     <div className="character-page-identity"><span>{character.categoryName} / {character.fandomUniverse}</span><h1>{character.name}</h1><p>{character.roleTitle}</p>{character.popularityScore>0&&<span className="character-page-rating">{character.popularityScore}% fan rating</span>}</div>
   </header>
   <div className="character-page-layout"><div className="character-page-stories">
     <section className="character-page-panel"><h2>Biography</h2><p>{character.bio||'A biography has not been added yet.'}</p></section>
     {character.backstory&&<section className="character-page-panel"><h2>Origins & story</h2><p>{character.backstory}</p></section>}
     {character.abilities&&<section className="character-page-panel"><h2>Abilities & traits</h2><p>{character.abilities}</p></section>}
   </div><aside className="character-page-panel character-page-facts"><h2>Character details</h2><dl>
    {[["Fandom",character.fandomUniverse],["Origin",character.originUniverse],["Category",character.categoryName],["Voice / performer",character.voiceActor]].filter(([,value])=>value).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
   </dl>{isAdmin&&character.id>0&&<button className="character-page-edit" onClick={()=>onEdit(character)}>Edit character</button>}</aside></div>
   {error&&<p role="status">{error}</p>}
 </main>
}
