import { useId } from 'react'
import nexusWorld from '../assets/nexus-world.webp'

/** Local, resolution-independent world beyond the gate; also survives WebGL failure. */
export function NexusWorld() {
  const id = useId().replace(/:/g, '')
  return <div className="nexus-world-art"><svg className="nexus-world" viewBox="0 0 400 400" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-sky`} cx="50%" cy="36%" r="70%">
        <stop offset="0" stopColor="var(--world-sky-light)" />
        <stop offset=".55" stopColor="var(--world-sky)" />
        <stop offset="1" stopColor="var(--world-edge)" />
      </radialGradient>
      <linearGradient id={`${id}-road`} x2="0" y2="1">
        <stop stopColor="#e5ab8d" stopOpacity=".9" /><stop offset="1" stopColor="#a62825" stopOpacity=".15" />
      </linearGradient>
      <linearGradient id={`${id}-tower`}><stop stopColor="var(--world-stone)" /><stop offset=".48" stopColor="var(--world-stone)" /><stop offset=".5" stopColor="var(--world-lit)" /><stop offset="1" stopColor="var(--world-stone)" /></linearGradient>
    </defs>
    <path fill={`url(#${id}-sky)`} d="M0 0h400v400H0z" />
    <circle cx="204" cy="147" r="106" fill="none" stroke="var(--world-halo)" strokeWidth=".8" />
    <circle cx="204" cy="147" r="94" fill="none" stroke="var(--world-halo)" strokeWidth=".3" />
    <path d="M0 126Q80 164 154 122T400 110M0 176Q60 143 128 173T400 153M0 84Q99 105 161 70T400 63" fill="none" stroke="var(--world-halo)" strokeWidth="13" opacity=".07" />
    <path d="M0 268 44 185 70 223 104 167 131 233 161 193 210 257 269 191 309 151 343 235 375 193 400 221V400H0Z" fill="var(--world-mountain)" opacity=".6" />
    <path d="M0 303 46 269 80 283 130 242 162 282 215 251 263 280 322 235 365 274 400 250V400H0Z" fill="var(--world-mountain)" />
    <g fill={`url(#${id}-tower)`} stroke="var(--world-lit)" strokeWidth=".5">
      <path d="M148 298V218L158 193 168 218V254H181V165L190 137 197 165V113L204 58 211 113V177L220 151 229 179V256H241V219L250 197 259 219V299Z" />
      <path d="M112 308V257L120 232 128 257V283H143V246L150 222 157 246V310ZM260 309V261L268 239 276 261V288H288V237L297 212 306 237V310Z" />
    </g>
    <path d="M198 287Q204 269 211 287V311H198Z" fill="#efc2a0" />
    <path d="M198 311 211 311 284 400H111Z" fill={`url(#${id}-road)`} />
    <path d="M0 330 45 311 91 325 133 302 166 316 116 343 80 380 0 389ZM400 317 368 303 331 323 295 308 245 321 288 346 319 383 400 390Z" fill="var(--world-foreground)" />
    <path d="M0 370 55 350 105 374 126 400H0ZM400 354 352 350 307 381 298 400H400Z" fill="var(--world-edge)" />
    <g fill="var(--world-halo)" opacity=".7"><path d="M187 192h2v5h-2zm31 9h2v5h-2zm-20 23h2v5h-2zm-47 48h2v4h-2zm97-18h2v5h-2z" /></g>
    <ellipse cx="204" cy="370" rx="9" ry="2" fill="#09090a" opacity=".4" />
    <circle cx="204" cy="347" r="3" fill="var(--world-foreground)" /><path d="m201 351-2 12h3v8h2l1-8h2l-1-12Z" fill="var(--world-foreground)" />
  </svg><img className="nexus-world-image" src={nexusWorld} alt="" width="768" height="768" decoding="async" fetchPriority="high" onError={event => { event.currentTarget.style.display = 'none' }} /></div>
}

export function NexusArchitectureFallback() {
  const id = useId().replace(/:/g, '')
  return <svg className="nexus-architecture-fallback" viewBox="0 0 800 800" aria-hidden="true">
    <defs><linearGradient id={`${id}-stone`} x2=".8" y2="1"><stop stopColor="var(--nexus-stone-light)" /><stop offset=".5" stopColor="var(--nexus-stone)" /><stop offset="1" stopColor="var(--nexus-stone-dark)" /></linearGradient></defs>
    <ellipse cx="410" cy="738" rx="300" ry="32" fill="#000" opacity=".16" />
    <path d="M120 729h560l34 30H86Z" fill="var(--nexus-stone-dark)" stroke="var(--nexus-seam)" />
    <path d="M156 706h488l36 23H120Z" fill={`url(#${id}-stone)`} stroke="var(--nexus-seam)" />
    <path d="M185 684h430l29 22H156Z" fill={`url(#${id}-stone)`} stroke="var(--nexus-seam)" />
    {Array.from({length:8}, (_, i) => {
      const angle = i * Math.PI / 4 - Math.PI / 2
      const a = angle - Math.PI / 8 + .003, b = angle + Math.PI / 8 - .003
      const point = (r:number,t:number) => `${400 + r*Math.cos(t)},${368+r*Math.sin(t)}`
      return <path key={i} d={`M${point(351,a)}L${point(351,b)}L${point(202,b)}A202 202 0 0 0 ${point(202,a)}Z`} fill={`url(#${id}-stone)`} stroke="var(--nexus-seam)" strokeWidth="2" />
    })}
    <path d="m266 44 268 0 190 190v268L534 692H266L76 502V234Z" fill="none" stroke="#bb302b" strokeWidth="2" />
    <circle cx="400" cy="368" r="198" fill="var(--world-edge)" stroke="var(--nexus-stone-light)" strokeWidth="12" />
    <circle cx="400" cy="368" r="188" fill="none" stroke="#bf302a" strokeWidth="2" />
  </svg>
}
