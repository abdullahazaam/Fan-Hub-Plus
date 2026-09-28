import React, { useState, useRef, useEffect } from 'react'
import type { Character } from '../types'
import { ArrowRightIcon, StarIcon } from './Icons'
import './ExpandedLegendsCards.css'

export interface LegendProfile {
  id: string
  name: string
  universe: string
  roleTitle: string
  bio: string
  abilities: string
  backstory: string
  originUniverse: string
  voiceActor: string
  popularityScore: number
  image: string
  accentColor: string
}

const LEGEND_ITEMS: LegendProfile[] = [
  {
    id: '2b',
    name: 'YoRHa No.2 Type B (2B)',
    universe: 'NIER: AUTOMATA',
    roleTitle: 'YoRHa All-Purpose Combat Android',
    bio: 'Stoic combat android deployed to Earth during the 14th Machine War, bound by the strict decree that soldiers are forbidden to show emotion.',
    abilities: 'Virtuous Contract dual-sword choreography, Pod 042 support fire, short-range phase evades, self-destruct override.',
    backstory: 'Created to eradicate machine lifeforms, 2B conceals her true designation as an executioner model tasked with eliminating 9S whenever he learns the truth.',
    originUniverse: 'Ruined Earth (NieR: Automata)',
    voiceActor: 'Yui Ishikawa',
    popularityScore: 96,
    image: '/legends/2b.jpg',
    accentColor: '#38bdf8',
  },
  {
    id: 'arcane',
    name: 'Arcane',
    universe: 'ARCANE / RUNETERRA',
    roleTitle: 'Hextech Vanguard & Zaun Rebel',
    bio: 'An enigmatic icon of the Hextech revolution bridging high Piltover innovation and deep Zaun rebellion.',
    abilities: 'Hextech weaponry, tactical skirmish combat, shimmer-resistant physiology, street warfare mastery.',
    backstory: 'Born from the friction between the shining towers of Piltover and the toxic undercity of Zaun, fighting to protect the marginalized in a fractured city.',
    originUniverse: 'Piltover & Zaun (Runeterra)',
    voiceActor: 'Ella Purnell',
    popularityScore: 97,
    image: '/legends/arcane.jpg',
    accentColor: '#ec4899',
  },
  {
    id: 'daemon',
    name: 'Daemon Targaryen',
    universe: 'HOUSE OF THE DRAGON',
    roleTitle: 'The Rogue Prince & Rider of Caraxes',
    bio: 'Mercurial Targaryen warrior prince wielding the Valyrian steel blade Dark Sister atop the ferocious Blood Wyrm Caraxes.',
    abilities: 'Valyrian steel mastery, aerial dragon combat, fearlessness, fierce dynastic loyalty.',
    backstory: 'Passed over for succession in favor of Viserys, Daemon fought brutal skirmishes in the Stepstones before wedding Rhaenyra to defend the Black faction.',
    originUniverse: 'Dragonstone & King\'s Landing',
    voiceActor: 'Matt Smith',
    popularityScore: 96,
    image: '/legends/daemon.jpg',
    accentColor: '#dc2626',
  },
  {
    id: 'geralt',
    name: 'Geralt of Rivia',
    universe: 'THE WITCHER SAGA',
    roleTitle: 'The White Wolf & Monster Slayer',
    bio: 'Mutated monster hunter wielding twin silver and meteorite steel blades against beasts and dark sorceries across the Continent.',
    abilities: 'Witcher signs (Aard, Igni, Quen, Axii, Yrden), superhuman senses, potion toxicity tolerance, sword mastery.',
    backstory: 'Subjected to the Trial of the Grasses at Kaer Morhen, Geralt roams a fractured world protecting humanity from ancient horrors.',
    originUniverse: 'The Continent (Witcher)',
    voiceActor: 'Doug Cockle',
    popularityScore: 96,
    image: '/legends/geralt.jpg',
    accentColor: '#dc2626',
  },
  {
    id: 'gojo',
    name: 'Satoru Gojo',
    universe: 'JUJUTSU KAISEN',
    roleTitle: 'Special Grade Sorcerer',
    bio: 'The undisputed pinnacle of modern jujutsu sorcery, commanding the spatial Limitless cursed technique and Six Eyes.',
    abilities: 'Limitless (Infinity, Blue, Red, Hollow Purple), Six Eyes atomic precision, Infinite Void Domain Expansion.',
    backstory: 'Born into the Gojo clan as the first bearer of both Limitless and the Six Eyes in 400 years, altering the balance of the supernatural world.',
    originUniverse: 'Tokyo Jujutsu High',
    voiceActor: 'Yuichi Nakamura',
    popularityScore: 99,
    image: '/legends/gojo.jpg',
    accentColor: '#38bdf8',
  },
]

interface ExpandedLegendsCardsProps {
  characters?: Character[]
  onSelectCharacter: (char: Character) => void
  theme?: string
}

export const ExpandedLegendsCards: React.FC<ExpandedLegendsCardsProps> = ({
  characters = [],
  onSelectCharacter,
}) => {
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width:768px)').matches)
  const [mobileIndex,setMobileIndex]=useState(0)
  useEffect(()=>{const query=window.matchMedia('(max-width:768px)');const update=()=>setMobile(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeTouchIndex, setActiveTouchIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Expand active card on hover or mobile tap; defaults to null (all cards slim)
  const expandedIndex = hoveredIndex !== null ? hoveredIndex : activeTouchIndex

  const handleCardClick = (index: number, legend: LegendProfile) => {
    // On mobile/touch: first tap expands, second tap/CTA triggers dossier
    if (!mobile && activeTouchIndex !== index && window.innerWidth <= 768) {
      setActiveTouchIndex(index)
      return
    }
    resolveAndOpenDossier(legend)
  }

  const resolveAndOpenDossier = (legend: LegendProfile) => {
    // Find matching character in DB by name or keyword
    const match = characters.find(
      (c) =>
        c.name.toLowerCase().includes(legend.name.toLowerCase()) ||
        legend.name.toLowerCase().includes(c.name.toLowerCase()) ||
        (legend.id === '2b' && (c.name.toLowerCase().includes('2b') || c.name.toLowerCase().includes('yorha'))) ||
        (legend.id === 'arcane' && c.name.toLowerCase().includes('arcane')) ||
        (legend.id === 'daemon' && c.name.toLowerCase().includes('daemon')) ||
        (legend.id === 'geralt' && c.name.toLowerCase().includes('geralt')) ||
        (legend.id === 'gojo' && c.name.toLowerCase().includes('gojo'))
    )

    if (match) {
      onSelectCharacter({
        ...match,
        avatarUrl: match.avatarUrl && !match.avatarUrl.includes('photo-1534447677768') ? match.avatarUrl : legend.image,
        bannerUrl: legend.image || match.bannerUrl,
      })
    } else {
      // Complete fallback Character object with rich lore
      const syntheticChar: Character = {
        id: -100 - LEGEND_ITEMS.findIndex((l) => l.id === legend.id),
        categoryId: 1,
        categoryName: legend.universe,
        name: legend.name,
        fandomUniverse: legend.universe,
        roleTitle: legend.roleTitle,
        bio: legend.bio,
        abilities: legend.abilities,
        backstory: legend.backstory,
        avatarUrl: legend.image,
        bannerUrl: legend.image,
        originUniverse: legend.originUniverse,
        voiceActor: legend.voiceActor,
        popularityScore: legend.popularityScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onSelectCharacter(syntheticChar)
    }
  }

  const hasActiveCard = !mobile && expandedIndex !== null

  return (
    <div className="expanded-legends-wrapper" ref={containerRef}>
      <div className={`expanded-legends-row ${hasActiveCard ? 'has-active-card' : ''}`} role="region" aria-label="People Behind the Legends Carousel" onScroll={e=>{if(!mobile)return;const node=e.currentTarget;setMobileIndex(Math.round(node.scrollLeft/((node.firstElementChild?.getBoundingClientRect().width||1)+12)))}}>
        {LEGEND_ITEMS.map((legend, index) => {
          const isExpanded = mobile || expandedIndex === index
          const itemNumber = `0${index + 1}`

          return (
            <article
              key={legend.id}
              className={`legend-card ${isExpanded ? 'is-expanded' : hasActiveCard ? 'is-compressed' : 'is-default'}`}
              onMouseEnter={() => {if(!mobile)setHoveredIndex(index)}}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => {if(!mobile)setHoveredIndex(index)}}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => handleCardClick(index, legend)}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
              aria-label={`${legend.name} - ${legend.universe}. ${isExpanded ? 'Expanded. Click to open dossier.' : 'Click or hover to expand.'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isExpanded) {
                    setHoveredIndex(index)
                  } else {
                    resolveAndOpenDossier(legend)
                  }
                }
              }}
            >
              {/* Full-bleed background character artwork */}
              <div className="legend-media-stage">
                <img
                  src={legend.image}
                  alt={legend.name}
                  className="legend-bg-image"
                  loading="lazy"
                />
                <div className="legend-vignette-overlay" />
                <div
                  className="legend-accent-glow"
                  style={{
                    boxShadow: isExpanded ? `inset 0 0 35px ${legend.accentColor}33` : 'none',
                  }}
                />
              </div>

              {/* Slim collapsed indicator (visible when slim) */}
              <div className="legend-slim-label" aria-hidden={isExpanded}>
                <span className="legend-slim-num">{itemNumber}</span>
                <span className="legend-slim-pip" />
                <span className="legend-slim-name">{legend.name}</span>
              </div>

              {/* Expanded details (smoothly revealed when active) */}
              <div className={`legend-expanded-content ${isExpanded ? 'content-visible' : 'content-hidden'}`}>
                <div className="legend-top-badges">
                  <span className="legend-universe-badge">
                    <span className="badge-glow-dot" />
                    {legend.universe}
                  </span>
                  <div className="legend-rating-pill">
                    <StarIcon size={12} fill="currentColor" />
                    <span>{legend.popularityScore}% Rating</span>
                  </div>
                </div>

                <div className="legend-header-block">
                  <h3 className="legend-title">{legend.name}</h3>
                  <p className="legend-role">{legend.roleTitle}</p>
                </div>

                <p className="legend-bio">{legend.bio}</p>

                <div className="legend-action-row">
                  <button
                    type="button"
                    className="legend-dossier-cta"
                    onClick={(e) => {
                      e.stopPropagation()
                      resolveAndOpenDossier(legend)
                    }}
                    tabIndex={isExpanded ? 0 : -1}
                  >
                    <span>View Dossier</span>
                    <ArrowRightIcon size={15} />
                  </button>
                  <span className="legend-origin-tag">
                    Origin: <strong>{legend.originUniverse}</strong>
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Mobile Swipe / Tap Navigation Indicators */}
      <div className="expanded-legends-mobile-nav" aria-label="Choose character">
        {LEGEND_ITEMS.map((legend, index) => (
          <button
            key={legend.id}
            type="button"
            className={`mobile-dot ${mobileIndex === index ? 'active' : ''}`}
            aria-current={mobileIndex===index?'true':undefined}
            onClick={() => {const row=containerRef.current?.querySelector('.expanded-legends-row');if(row){const width=row.firstElementChild?.getBoundingClientRect().width||0;row.scrollTo({left:index*(width+12),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}}
            aria-label={`Select ${legend.name}`}
          />
        ))}
      </div>
    </div>
  )
}
