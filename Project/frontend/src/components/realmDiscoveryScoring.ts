export const REALMS = [
 { slug:'anime', name:'Anime', line:'Extraordinary worlds. Unforgettable bonds.' },
 { slug:'gaming', name:'Gaming', line:'A world that changes with every choice.' },
 { slug:'movies', name:'Movies', line:'Big-screen wonder. Stories that stay with you.' },
 { slug:'tv-shows', name:'TV Shows', line:'One more episode. A deeper connection.' },
 { slug:'k-pop', name:'K-Pop', line:'Find your rhythm. Join the crowd.' },
 { slug:'comics', name:'Comics', line:'Iconic heroes. Limitless possibilities.' },
 { slug:'manga', name:'Manga', line:'Every panel opens another world.' },
 { slug:'cosplay', name:'Cosplay', line:'Bring the characters you love to life.' },
] as const
export type RealmSlug = typeof REALMS[number]['slug']
type Option = { title:string; detail:string; art:RealmSlug; scores:readonly number[] }
type Question = { chapter:string; title:string; subtitle:string; weight:number; options:Option[] }
// Scores follow REALMS order; fixed order also breaks exact ties deterministically.
export const QUESTIONS:Question[] = [
 {chapter:'The story',title:'What makes you lose track of time?',subtitle:'Follow the feeling, not the format.',weight:3,options:[
  {title:'A journey that changes you',detail:'Found family, impossible odds, a hard-earned transformation.',art:'anime',scores:[5,3,2,3,1,2,5,1]},
  {title:'The choice is yours',detail:'Decisions, discovery, and the thrill of shaping what happens next.',art:'gaming',scores:[2,5,1,2,0,3,2,2]},
  {title:'A story with a long shadow',detail:'Powerful performances, mysteries and characters that linger.',art:'movies',scores:[2,1,5,5,1,3,3,1]},
  {title:'Something you can be part of',detail:'Shared energy, creative expression and a community around it.',art:'cosplay',scores:[1,2,1,1,5,2,1,5]},
 ]},
 {chapter:'The world',title:'Which doorway would you walk through?',subtitle:'Imagine you could stay a little longer.',weight:2,options:[
  {title:'Beyond the ordinary',detail:'Floating cities, hidden powers and beautifully strange horizons.',art:'anime',scores:[5,3,3,2,1,3,5,2]},
  {title:'An unexplored frontier',detail:'A map to uncover, a challenge to master, a legend to build.',art:'gaming',scores:[2,5,3,1,0,3,2,1]},
  {title:'A city full of secrets',detail:'Intertwined lives, larger-than-life heroes and stories on every street.',art:'comics',scores:[2,2,4,5,1,5,3,2]},
  {title:'Backstage, before the lights',detail:'The craft, the costumes and the moment an audience comes alive.',art:'k-pop',scores:[1,1,2,2,5,1,1,5]},
 ]},
 {chapter:'The characters',title:'Who would you follow into the unknown?',subtitle:'Every great world starts with someone worth knowing.',weight:2,options:[
  {title:'The unlikely dreamer',detail:'An underdog with heart, loyal friends and room to grow.',art:'manga',scores:[5,2,2,3,2,2,5,1]},
  {title:'The rule breaker',detail:'A complicated hero who rewrites the rules and owns the consequences.',art:'comics',scores:[2,5,3,2,1,5,3,1]},
  {title:'The magnetic ensemble',detail:'Distinct personalities, unforgettable chemistry and evolving relationships.',art:'tv-shows',scores:[3,1,5,5,3,2,2,2]},
  {title:'The fearless creator',detail:'Someone who turns imagination, practice and presence into an art.',art:'cosplay',scores:[1,2,1,2,5,2,1,5]},
 ]},
 {chapter:'The medium',title:'Your evening is yours. What comes first?',subtitle:'Choose the experience you naturally reach for.',weight:4,options:[
  {title:'Motion, music, immersion',detail:'Animated worlds or a soundtrack you can feel in your bones.',art:'k-pop',scores:[5,1,2,2,5,0,1,1]},
  {title:'Controller or costume',detail:'Become part of the world instead of watching from the outside.',art:'gaming',scores:[1,5,0,0,1,1,0,5]},
  {title:'The screen lights up',detail:'A beautifully shot film or a series you can sink into.',art:'movies',scores:[1,0,5,5,1,1,1,0]},
  {title:'One more page',detail:'Expressive artwork, striking panels and stories at your own pace.',art:'manga',scores:[2,0,1,1,0,5,5,1]},
 ]},
 {chapter:'The connection',title:'What would you love to discover next?',subtitle:'The final spark. Make it yours.',weight:4,options:[
  {title:'A new adventure to live',detail:'Animated journeys and interactive worlds with more to explore.',art:'gaming',scores:[5,5,2,1,0,2,2,1]},
  {title:'A performance to remember',detail:'Cinema that moves you or music that brings people together.',art:'movies',scores:[1,0,5,2,5,1,0,2]},
  {title:'A universe to unravel',detail:'Interconnected heroes and long-running stories with hidden layers.',art:'tv-shows',scores:[2,1,2,5,0,5,2,1]},
  {title:'An art to make your own',detail:'Illustrated storytelling, intricate details and character-driven craft.',art:'cosplay',scores:[2,1,1,1,1,2,5,5]},
 ]},
]
export function matchRealm(answers:readonly number[]) {
 if(answers.length!==QUESTIONS.length || answers.some((a,i)=>!Number.isInteger(a)||!QUESTIONS[i].options[a])) throw new Error('Complete all five questions first.')
 const ranked=REALMS.map((realm,r)=>{
  const total=QUESTIONS.reduce((sum,q,i)=>sum+q.options[answers[i]].scores[r]*q.weight,0)
  const maximum=QUESTIONS.reduce((sum,q)=>sum+Math.max(...q.options.map(o=>o.scores[r]))*q.weight,0)
  return {realm,index:r,total,percent:Math.round(total/maximum*100)}
 }).sort((a,b)=>b.percent-a.percent||b.total-a.total||a.index-b.index)
 const winner=ranked[0]
 const affinities=QUESTIONS.map((q,i)=>({title:q.options[answers[i]].title,score:q.options[answers[i]].scores[winner.index]*q.weight})).sort((a,b)=>b.score-a.score).slice(0,2)
 return {...winner,reason:`Your pull toward "${affinities[0].title.toLowerCase()}" and "${affinities[1].title.toLowerCase()}" brings you closest to ${winner.realm.name}.`}
}
