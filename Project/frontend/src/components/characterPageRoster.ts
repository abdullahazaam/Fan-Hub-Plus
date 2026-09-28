import type { Character } from '../types'
const roster=[
 ['2b.jpg','YoRHa No.2 Type B (2B)','2b','Gaming','NieR: Automata'],
 ['arcane.jpg','Arcane','arcane','Original','Original character'],
 ['daemon.jpg','Daemon Targaryen','daemon','TV Shows','House of the Dragon'],
 ['geralt.jpg','Geralt of Rivia','geralt','Gaming','The Witcher'],
 ['gojo.jpg','Satoru Gojo','gojo','Anime','Jujutsu Kaisen'],
 ['guts.jpg','Guts','guts','Manga','Berserk'],
 ['Itachi.jpg','Itachi Uchiha','itachi','Anime','Naruto'],
 ['jinx.jpg','Jinx (Powder)','jinx','Gaming','Arcane / League of Legends'],
 ['johnny.jpg','Johnny Silverhand','silverhand','Gaming','Cyberpunk 2077'],
 ['kaelen.jpg',"Kaelen 'Forge' Vance",'kaelen','Original','Original character'],
 ['levi.jpg','Levi Ackerman','levi','Anime','Attack on Titan'],
 ['makima.jpg','Makima','makima','Manga','Chainsaw Man'],
 ['malenia.jpg','Malenia, Blade of Miquella','malenia','Gaming','Elden Ring'],
 ['neo.jpg','Neo (Thomas Anderson)','neo','Movies','The Matrix'],
 ['paul.jpg','Paul Atreides','paul','Movies','Dune'],
 ['tanjiro.jpg','Tanjiro Kamado','tanjiro','Anime','Demon Slayer'],
]
export function resolveCharacterPortrait(character: { name: string; avatarUrl?: string; bannerUrl?: string }): string {
  const match = roster.find(([, , keyword]) => character.name.toLowerCase().includes(keyword))
  if (match) return `/legends/${match[0]}`
  return character.avatarUrl || character.bannerUrl || ''
}

export function characterPageRoster(items:Character[]):Character[]{
 return roster.map(([file,name,keyword,categoryName,fandomUniverse],index)=>{
  const existing=items.find(item=>item.name.toLowerCase().includes(keyword))
  const art=`/legends/${file}`
  if(existing)return {...existing,avatarUrl:art,bannerUrl:art}
  // Local previews only: never send invented IDs to mutation endpoints.
  return {id:-800-index,name,categoryId:categoryName==='Anime'?1:0,categoryName,fandomUniverse,roleTitle:name==='Arcane'?'Character portrait':'Character dossier',bio:'',abilities:'',backstory:'',avatarUrl:art,bannerUrl:art,originUniverse:fandomUniverse,voiceActor:'',popularityScore:0,createdAt:'',updatedAt:''}
 })
}
