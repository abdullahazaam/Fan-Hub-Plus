// Authoring coordinates are intrinsic pixels of the approved 1875 × 839 environment.
// Every render path (WebGL, interaction polygons and static fallback) uses these anchors.
export const HERO_WORLD = { width:1875, height:839, portalX:1168, portalY:394 }
export const HERO_REALMS = [
  {slug:'gaming',name:'GAMING',x:1168,y:112,angle:0},
  {slug:'anime',name:'ANIME',x:865,y:197,angle:-5},
  {slug:'comics',name:'COMICS',x:830,y:352,angle:-3},
  {slug:'manga',name:'MANGA',x:850,y:507,angle:-3},
  {slug:'movies',name:'MOVIES',x:1460,y:197,angle:4},
  {slug:'tv-shows',name:'TV SHOWS',x:1500,y:352,angle:-4},
  {slug:'k-pop',name:'K-POP',x:1470,y:507,angle:-3},
  {slug:'cosplay',name:'COSPLAY',x:1460,y:662,angle:2},
] as const
export const CARD = {width:234,height:122}
// /fh-operative.png (1024 × 1536) master image.
// Preserves original aspect ratio 2:3. Boots touch floor at y=818, head well below portal center (y=394).
const opWidth = 288
const opHeight = 432
const opSoleOffset = (1437 / 1536) * opHeight // ~404.16
const opSpineOffset = (705 / 1024) * opWidth   // ~198.28

export const OPERATIVE = {
  x: Math.round(HERO_WORLD.portalX - opSpineOffset),
  y: Math.round(788 - opSoleOffset),
  width: opWidth,
  height: opHeight,
}
export const OPERATIVE_CONTACTS = [
  { x: Math.round(OPERATIVE.x + (481 / 1024) * opWidth), y: 788, width: 52, height: 12 },
  { x: Math.round(OPERATIVE.x + (740 / 1024) * opWidth), y: 788, width: 48, height: 12 },
]
export function heroView(width:number,height:number) {
  const worldWidth = width / height < 1.6 ? 1100 : HERO_WORLD.width
  const worldHeight = worldWidth * height / width
  // Ensure the bottom includes operative boots (y=818) plus reflective floor margin (~42px)
  const maxY = 860
  const y = Math.min((HERO_WORLD.height - worldHeight) / 2, maxY - worldHeight)
  return {x:worldWidth===1100?600:0,y,width:worldWidth,height:worldHeight}
}
export function realmPoints(index:number) {
  const r=HERO_REALMS[index],angle=r.angle*Math.PI/180
  return [[-CARD.width/2,-CARD.height/2],[CARD.width/2,-CARD.height/2],[CARD.width/2,CARD.height/2],[-CARD.width/2,CARD.height/2]].map(([x,y])=>`${r.x+x*Math.cos(angle)-y*Math.sin(angle)},${r.y+x*Math.sin(angle)+y*Math.cos(angle)}`).join(' ')
}
export interface HeroSceneProps {theme:'dark'|'light';onSelect:(slug:string)=>void;selected?:string|null}
