import { useEffect, useRef, useState } from 'react'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Category, Character, ContentItem, MediaItem, MerchandiseItem } from '../types'
import { QUESTIONS, REALMS, matchRealm } from './realmDiscoveryScoring'
import './RealmDiscovery.css'

interface Props { onHome:()=>void; onExplore:(category:Category)=>void; onChronicle:(item:ContentItem)=>void; onCharacter:(item:Character)=>void; onMedia:(item:MediaItem)=>void; onMerchandise:(item:MerchandiseItem)=>void; onEvents:()=>void; onSignIn:()=>void }
type Recommendation = {id:number;title:string;image:string;detail:string;open:()=>void}
type Group = {name:string;items:Recommendation[];failed:boolean}
const storageKey='fhp-discovery-v1'
function readAnswers():number[]{try{const a=JSON.parse(sessionStorage.getItem(storageKey)||'[]');return Array.isArray(a)&&a.length<=5&&a.every((v,i)=>Number.isInteger(v)&&QUESTIONS[i]?.options[v])?a:[]}catch{return []}}
export function RealmDiscovery(props:Props){
 const {user,profile,updateProfile}=useAuth()
 const [answers,setAnswers]=useState<number[]>(readAnswers)
 const [step,setStep]=useState(()=>Math.min(readAnswers().length,4))
 const [phase,setPhase]=useState<'questions'|'reveal'|'result'>(()=>readAnswers().length===5?'result':'questions')
 const [selected,setSelected]=useState<number|null>(null)
 const [category,setCategory]=useState<Category|null>(null)
 const [groups,setGroups]=useState<Group[]>([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [retry,setRetry]=useState(0)
 const [saving,setSaving]=useState(false)
 const [saveMessage,setSaveMessage]=useState('')
 const [saveError,setSaveError]=useState('')
 const heading=useRef<HTMLHeadingElement>(null)
 const callbacks=useRef(props);callbacks.current=props
 const result=answers.length===5?matchRealm(answers):null
 const slug=result?.realm.slug
 useEffect(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(answers))}catch{}},[answers])
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[step,phase])
 useEffect(()=>{
  if(phase!=='reveal')return
  const timer=window.setTimeout(()=>setPhase('result'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:1450)
  return()=>clearTimeout(timer)
 },[phase])
 useEffect(()=>{
  if(!slug)return
  let active=true;setLoading(true);setError('');setCategory(null);setGroups([])
  async function load(){
   try{
    const categories=await api.getCategories()
    const cat=categories.find(c=>c.slug===slug || c.name.toLowerCase()===REALMS.find(r=>r.slug===slug)?.name.toLowerCase())
    if(!cat)throw new Error('This realm is not available in the archive yet. Try again shortly.')
    if(!active)return
    setCategory(cat)
    const params={categoryId:cat.id,page:1,pageSize:3}
    const tasks:[string,Promise<Recommendation[]>][]=[
     ['Chronicles',api.getContentList(params).then(r=>r.items.filter(i=>i.categoryId===cat.id).map(i=>({id:i.id,title:i.title,image:i.thumbnailUrl,detail:i.fandomUniverse,open:()=>callbacks.current.onChronicle(i)})))],
     ['Characters',api.getCharacters(params).then(r=>r.items.filter(i=>i.categoryId===cat.id).map(i=>({id:i.id,title:i.name,image:i.avatarUrl||i.bannerUrl,detail:i.roleTitle,open:()=>callbacks.current.onCharacter(i)})))],
     ['Media',api.getMediaList(params).then(r=>r.items.filter(i=>i.categoryId===cat.id).map(i=>({id:i.id,title:i.title,image:i.thumbnailUrl,detail:i.mediaType,open:()=>callbacks.current.onMedia(i)})))],
     ['Events',api.getEvents(params).then(r=>r.items.filter(i=>i.categoryId===cat.id).map(i=>({id:i.id,title:i.title,image:i.thumbnailUrl,detail:i.city,open:()=>callbacks.current.onEvents()})))],
     ['Merchandise',api.getMerchandise(params).then(r=>r.items.filter(i=>i.categoryId===cat.id).map(i=>({id:i.id,title:i.name,image:i.imageUrl,detail:i.fandomUniverse,open:()=>callbacks.current.onMerchandise(i)})))],
    ]
    const outcomes=await Promise.allSettled(tasks.map(t=>t[1]))
    if(active)setGroups(outcomes.map((outcome,i)=>({name:tasks[i][0],items:outcome.status==='fulfilled'?outcome.value:[],failed:outcome.status==='rejected'})))
   }catch(e){if(active)setError('Could not load your realm. Please check your connection and try again.')}
   finally{if(active)setLoading(false)}
  }
  void load();return()=>{active=false}
 },[slug,retry])
 const favorites=profile?.favoriteCategories||profile?.favoriteCategory?.split(',').map(s=>s.trim())||[]
 const isFavorite=!!category&&favorites.some(f=>f.toLowerCase()===category.name.toLowerCase())
 async function saveFavorite(){
  if(!user){props.onSignIn();return}
  if(!category||saving)return
  setSaving(true);setSaveMessage('');setSaveError('')
  try{
   const latest=await api.apiGetMe()
   const previous=latest.favoriteCategories||latest.favoriteCategory?.split(',').map(s=>s.trim()).filter(Boolean)||[]
   const combined=[category.name,...previous.filter(n=>n.toLowerCase()!==category.name.toLowerCase())]
   await updateProfile({displayName:latest.displayName,bio:latest.bio,avatarUrl:latest.avatarUrl,favoriteCategories:combined})
   setSaveMessage(`${category.name} is saved to your favorite realms.`)
  }catch{setSaveError('Your favorite could not be saved. Please try again.')}
  finally{setSaving(false)}
 }
 function restart(){setAnswers([]);setSelected(null);setStep(0);setPhase('questions');setSaveMessage('');setSaveError('');window.scrollTo({top:0,behavior:'instant'})}
 function next(){if(selected===null)return;const nextAnswers=[...answers.slice(0,step),selected];setAnswers(nextAnswers);setSelected(null);if(step===4)setPhase('reveal');else setStep(step+1)}
 const question=QUESTIONS[step]
 return <main className="realm-discovery">
  <div className="discovery-topline"><button onClick={props.onHome}>Back to Home</button><span>FAN HUB PLUS / DISCOVERY</span><span>08 realms. One connection.</span></div>
  {phase==='questions'&&<section className="discovery-question" aria-labelledby="discovery-title">
   <div className="discovery-progress" aria-label={`Question ${step+1} of 5`}>{QUESTIONS.map((q,i)=><span key={q.chapter} className={i<=step?'is-lit':''}><i/>{String(i+1).padStart(2,'0')}<b>{q.chapter}</b></span>)}</div>
   <header><p className="discovery-kicker">DISCOVER YOUR REALM / {String(step+1).padStart(2,'0')} / 05</p><h1 id="discovery-title" tabIndex={-1} ref={heading}>{question.title}</h1><p>{question.subtitle}</p></header>
   <div className="discovery-options" role="group" aria-label={question.title} key={step}>{question.options.map((option,i)=><button key={option.title} className={`discovery-option ${selected===i?'is-selected':''}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}>
    <img src={`/realms/${option.art}.jpg`} alt="" decoding="async"/><span className="discovery-option-shade"/><span className="discovery-option-number">0{i+1}</span><span className="discovery-selection" aria-hidden="true">{selected===i?'\u2713':'+'}</span><span className="discovery-option-copy"><strong>{option.title}</strong><span>{option.detail}</span></span>
   </button>)}</div>
   <div className="discovery-question-actions"><button className="discovery-text-button" disabled={step===0} onClick={()=>{setSelected(answers[step-1]??null);setStep(step-1)}}>Previous</button><span>Choose what draws you in.</span><button className="discovery-primary" disabled={selected===null} onClick={next}>{step===4?'Reveal my realm':'Continue'} <span aria-hidden="true">&rarr;</span></button></div>
  </section>}
  {phase==='reveal'&&<section className="discovery-reveal" aria-live="polite" aria-busy="true"><div className="discovery-portal" aria-hidden="true"><i/><i/><i/><span>FH+</span></div><p className="discovery-kicker">YOUR WORLD IS TAKING SHAPE</p><h1 ref={heading} tabIndex={-1}>A connection across the Nexus.</h1></section>}
  {phase==='result'&&result&&<>
   <section className="discovery-result" aria-labelledby="discovery-result-title"><div className="discovery-result-art"><img src={`/realms/${result.realm.slug}.jpg`} alt=""/><div className="discovery-portal" aria-hidden="true"><i/><i/><i/></div><span className="discovery-match"><strong>{result.percent}%</strong><span>preference match</span></span></div>
    <div className="discovery-result-copy"><p className="discovery-kicker">YOUR REALM, REVEALED</p><h1 id="discovery-result-title" ref={heading} tabIndex={-1}>{result.realm.name}</h1><h2>{result.realm.line}</h2><p>{result.reason}</p><small>Match strength reflects your five answers, not a prediction of your personality.</small><div className="discovery-result-actions"><button className="discovery-primary" disabled={!category} onClick={()=>category&&props.onExplore(category)}>Explore Realm &rarr;</button><button className="discovery-secondary" disabled={!category||saving||isFavorite} onClick={saveFavorite}>{saving?'Saving...':isFavorite?'Favorite realm saved':user?'Set as Favorite Realm':'Sign in to save realm'}</button></div><p role="status" className="discovery-save-status">{saveMessage}</p>{saveError&&<p role="alert">{saveError}</p>}<button className="discovery-text-button" onClick={restart}>Restart Discovery</button></div>
   </section>
   <section className="discovery-recommendations" aria-labelledby="discovery-recommendations-title"><header><p className="discovery-kicker">YOUR NEXT CHAPTER</p><h2 id="discovery-recommendations-title">Step into {result.realm.name}.</h2><p>Stories, people and experiences from the live Fan Hub Plus archive.</p></header>
    {loading&&<div className="discovery-load" role="status">Opening your realm's archive...<div className="discovery-skeletons" aria-hidden="true"><i/><i/><i/></div></div>}
    {error&&<div className="discovery-message" role="alert"><p>{error}</p><button className="discovery-secondary" onClick={()=>setRetry(r=>r+1)}>Retry recommendations</button></div>}
    {!loading&&!error&&groups.map(group=><section className="discovery-recommendation-group" key={group.name}><h3>{group.name}<span>{group.items.length?`${group.items.length} to discover`:''}</span></h3>{group.failed?<div className="discovery-message"><p>{group.name} could not be loaded.</p><button className="discovery-text-button" onClick={()=>setRetry(r=>r+1)}>Try again</button></div>:group.items.length?<div className="discovery-recommendation-grid">{group.items.map(item=><button className="discovery-recommendation" key={item.id} onClick={item.open}>{item.image&&<img src={item.image} alt="" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/>}<span><small>{item.detail}</small><strong>{item.title}</strong><b>{group.name==='Events'?'Browse events':'Discover'} &rarr;</b></span></button>)}</div>:<p className="discovery-empty">No {group.name.toLowerCase()} in this realm yet. Check back as the archive grows.</p>}</section>)}
   </section>
  </>}
 </main>
}
