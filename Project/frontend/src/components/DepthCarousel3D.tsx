import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import './DepthCarousel3D.css'
import { ArrowRightIcon } from './Icons'

export interface DepthCardItem {
  id: string
  category: string
  title: string
  desc: string
  ctaText?: string
  imageUrl: string
  action: () => void
}

interface DepthCarousel3DProps {
  items?: DepthCardItem[]
  theme?: 'dark' | 'light'
  onExploreWorld?: () => void
  onExploreCharacters?: () => void
  onExploreMedia?: () => void
  onExploreEvents?: () => void
  onExploreReleases?: () => void
}

const STEP = 0.46 // ~26.3 degrees in radians
const RADIUS = 7.0

export const DepthCarousel3D: React.FC<DepthCarousel3DProps> = ({
  items: propItems,
  theme = 'dark',
  onExploreWorld,
  onExploreCharacters,
  onExploreMedia,
  onExploreEvents,
  onExploreReleases,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Default gateway items: Explore Worlds, Characters, Media, Events, Releases
  const items: DepthCardItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems
    return [
      {
        id: 'worlds',
        category: 'MULTIVERSE REALMS',
        title: 'Explore Worlds',
        desc: 'Explore lore, planetary territories, and connected multiverse dimensions.',
        ctaText: 'Explore Worlds',
        imageUrl: '/carousel/worlds.jpg',
        action: onExploreWorld || (() => {}),
      },
      {
        id: 'media',
        category: 'CINEMA & AUDIO',
        title: 'Media',
        desc: 'Watch cinema trailers, gameplay teasers, and original soundtrack streams.',
        ctaText: 'Explore Media',
        imageUrl: '/carousel/media.jpg',
        action: onExploreMedia || (() => {}),
      },
      {
        id: 'releases',
        category: 'PREMIERE CALENDAR',
        title: 'Releases',
        desc: 'Track premiere dates, countdown clocks, and hyped launch windows.',
        ctaText: 'Enter Releases',
        imageUrl: '/carousel/releases.jpg',
        action: onExploreReleases || (() => {}),
      },
      {
        id: 'events',
        category: 'COMMUNITY SUMMITS',
        title: 'Events',
        desc: 'Global fan expos, live tournaments, creator stages, and multiverse panels.',
        ctaText: 'Enter Events',
        imageUrl: '/carousel/events.jpg',
        action: onExploreEvents || (() => {}),
      },
      {
        id: 'characters',
        category: 'OPERATIVES & ICONS',
        title: 'Characters',
        desc: 'Dossiers, legendary abilities, and origins across eight connected universes.',
        ctaText: 'Explore Characters',
        imageUrl: '/carousel/characters.jpg',
        action: onExploreCharacters || (() => {}),
      },
    ]
  }, [propItems, onExploreWorld, onExploreCharacters, onExploreMedia, onExploreEvents, onExploreReleases])

  // Current active index in 0..items.length-1
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [hasInteracted, setHasInteracted] = useState<boolean>(false)

  // References for animation state
  const angleRef = useRef<number>(0)
  const targetAngleRef = useRef<number>(0)
  const targetSlotRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startAngleRef = useRef<number>(0)
  const lastXRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const velocityRef = useRef<number>(0)
  const dragDistRef = useRef<number>(0)
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mouseNormRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999))
  const hoveredSlotRef = useRef<number | null>(null)

  // External controller functions
  const navigateToSlot = useCallback((newSlot: number) => {
    targetSlotRef.current = newSlot
    targetAngleRef.current = newSlot * STEP
    setHasInteracted(true)
  }, [])

  const handlePrev = useCallback(() => {
    navigateToSlot(targetSlotRef.current - 1)
  }, [navigateToSlot])

  const handleNext = useCallback(() => {
    navigateToSlot(targetSlotRef.current + 1)
  }, [navigateToSlot])

  const handleDotClick = useCallback((targetItemIndex: number) => {
    const currentItemIndex = ((targetSlotRef.current % items.length) + items.length) % items.length
    let diff = targetItemIndex - currentItemIndex
    if (diff > items.length / 2) diff -= items.length
    if (diff < -items.length / 2) diff += items.length
    navigateToSlot(targetSlotRef.current + diff)
  }, [items.length, navigateToSlot])

  // Primary WebGL + Three.js Effect
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let disposed = false
    let animFrameId = 0
    const isDark = theme !== 'light'

    // Scene setup - camera centered vertically with -0.42 offset so card top is ~30px below canvas top
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, -0.42, 6.2)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(container.clientWidth, container.clientHeight, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)
    } catch {
      return
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 2.5 : 2.7)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xff4455, isDark ? 3.0 : 2.2)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.8)
    fillLight.position.set(-5, 3, 4)
    scene.add(fillLight)

    // Crimson Atmospheric Ground Glow
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 512
    glowCanvas.height = 256
    const gctx = glowCanvas.getContext('2d')
    if (gctx) {
      const grad = gctx.createRadialGradient(256, 128, 5, 256, 128, 250)
      grad.addColorStop(0, isDark ? 'rgba(235, 25, 45, 0.42)' : 'rgba(220, 38, 38, 0.22)')
      grad.addColorStop(0.35, isDark ? 'rgba(160, 15, 30, 0.20)' : 'rgba(180, 20, 30, 0.10)')
      grad.addColorStop(0.7, isDark ? 'rgba(30, 8, 14, 0.08)' : 'rgba(255, 255, 255, 0.05)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      gctx.fillStyle = grad
      gctx.fillRect(0, 0, 512, 256)
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas)
    const glowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 7),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: isDark ? 0.75 : 0.4,
      })
    )
    glowMesh.position.set(0, -1.8, -1.0)
    glowMesh.rotation.x = -Math.PI / 4.5
    scene.add(glowMesh)

    // Pre-render textures for the items
    const cardCanvases: HTMLCanvasElement[] = []
    const cardTextures: THREE.CanvasTexture[] = []
    const loadedImages: (HTMLImageElement | null)[] = items.map(() => null)

    const drawCardCanvas = (index: number) => {
      const item = items[index]
      let c = cardCanvases[index]
      if (!c) {
        c = document.createElement('canvas')
        c.width = 1200
        c.height = 750
        cardCanvases[index] = c
      }
      const ctx = c.getContext('2d')
      if (!ctx) return c

      const W = c.width
      const H = c.height
      const R = 36

      ctx.clearRect(0, 0, W, H)

      // Base rounded rectangle clip for entire card
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(R, 0)
      ctx.lineTo(W - R, 0)
      ctx.quadraticCurveTo(W, 0, W, R)
      ctx.lineTo(W, H - R)
      ctx.quadraticCurveTo(W, H, W - R, H)
      ctx.lineTo(R, H)
      ctx.quadraticCurveTo(0, H, 0, H - R)
      ctx.lineTo(0, R)
      ctx.quadraticCurveTo(0, 0, R, 0)
      ctx.closePath()
      ctx.clip()

      // 1. FULL CARD ARTWORK BACKGROUND: Edge-to-edge, width/height 100%, object-fit: cover, object-position: center
      const img = loadedImages[index]
      if (img && img.complete && img.naturalWidth > 0) {
        const imgRatio = img.naturalWidth / img.naturalHeight
        const targetRatio = W / H
        let sw: number, sh: number, sx: number, sy: number
        if (imgRatio > targetRatio) {
          sh = img.naturalHeight
          sw = sh * targetRatio
          sx = (img.naturalWidth - sw) / 2
          sy = 0
        } else {
          sw = img.naturalWidth
          sh = sw / targetRatio
          sx = 0
          sy = (img.naturalHeight - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      } else {
        // Deep obsidian fallback (never red/pink)
        ctx.fillStyle = '#0a0810'
        ctx.fillRect(0, 0, W, H)
      }

      // 2. Subtle Bottom Readability Gradient (Overlay above full-card image)
      // Top ~55% of artwork is 100% open and visible; lower ~45% fades for text contrast
      const scrimStartY = 410
      const scrim = ctx.createLinearGradient(0, scrimStartY, 0, H)
      scrim.addColorStop(0, 'rgba(6, 4, 10, 0)')
      scrim.addColorStop(0.25, isDark ? 'rgba(7, 5, 12, 0.55)' : 'rgba(8, 6, 12, 0.50)')
      scrim.addColorStop(0.65, isDark ? 'rgba(7, 5, 12, 0.88)' : 'rgba(8, 6, 12, 0.82)')
      scrim.addColorStop(1, isDark ? 'rgba(6, 4, 10, 0.97)' : 'rgba(7, 5, 11, 0.94)')
      ctx.fillStyle = scrim
      ctx.fillRect(0, scrimStartY, W, H - scrimStartY)

      // 3. Typography & Text Content Overlay
      // Eyebrow Tag
      ctx.font = '800 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = '#ff4d5a'
      ctx.fillText(item.category.toUpperCase(), 48, scrimStartY + 62)

      // Card Title
      ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 2
      ctx.fillText(item.title, 48, scrimStartY + 135)
      ctx.shadowColor = 'transparent'

      // 1 Short Description
      ctx.font = '500 23px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = '#e2dfec'
      ctx.fillText(item.desc, 48, scrimStartY + 192)

      // 4. Explore / Enter CTA Pill Button overlay on the card
      const ctaLabel = item.ctaText ? item.ctaText.toUpperCase() : 'EXPLORE'
      const badgeW = 215
      const badgeH = 50
      const badgeX = W - badgeW - 48
      const badgeY = scrimStartY + 120
      const badgeR = 25

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(badgeX + badgeR, badgeY)
      ctx.lineTo(badgeX + badgeW - badgeR, badgeY)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeR)
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - badgeR)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeR, badgeY + badgeH)
      ctx.lineTo(badgeX + badgeR, badgeY + badgeH)
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - badgeR)
      ctx.lineTo(badgeX, badgeY + badgeR)
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeR, badgeY)
      ctx.closePath()

      const ctaGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH)
      ctaGrad.addColorStop(0, '#e5182e')
      ctaGrad.addColorStop(1, '#aa0d22')
      ctx.fillStyle = ctaGrad
      ctx.fill()

      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.stroke()

      // CTA Text with Arrow
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ctaLabel + ' →', badgeX + badgeW / 2, badgeY + badgeH / 2 - 1)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.restore()

      // Card Outer 1px theme rim border
      ctx.lineWidth = 3
      ctx.strokeStyle = isDark ? 'rgba(220, 38, 38, 0.45)' : 'rgba(220, 38, 38, 0.38)'
      ctx.strokeRect(2, 2, W - 4, H - 4)

      // Accent tick on top-right
      ctx.lineWidth = 6
      ctx.strokeStyle = '#dc2626'
      ctx.beginPath()
      ctx.moveTo(W - 48, 3)
      ctx.lineTo(W - 3, 3)
      ctx.lineTo(W - 3, 48)
      ctx.stroke()

      ctx.restore()
      return c
    }

    // Initialize textures & load images immediately
    items.forEach((item, idx) => {
      const c = drawCardCanvas(idx)
      const texture = new THREE.CanvasTexture(c)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      cardTextures.push(texture)

      const img = new Image()
      img.src = item.imageUrl
      const onDone = () => {
        if (disposed) return
        loadedImages[idx] = img
        drawCardCanvas(idx)
        texture.needsUpdate = true
      }
      if (img.complete && img.naturalWidth > 0) {
        onDone()
      } else {
        img.onload = onDone
      }
    })

    // Card 3D Geometry (Larger physical dimensions)
    function createCardShape(w: number, h: number, r: number) {
      const s = new THREE.Shape()
      const x = -w / 2
      const y = -h / 2
      s.moveTo(x + r, y)
      s.lineTo(x + w - r, y)
      s.quadraticCurveTo(x + w, y, x + w, y + r)
      s.lineTo(x + w, y + h - r)
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      s.lineTo(x + r, y + h)
      s.quadraticCurveTo(x, y + h, x, y + h - r)
      s.lineTo(x, y + r)
      s.quadraticCurveTo(x, y, x + r, y)
      return s
    }

    const cardWidth = 4.7
    const cardHeight = 2.94
    const cardShape = createCardShape(cardWidth, cardHeight, 0.22)
    const cardGeometry = new THREE.ExtrudeGeometry(cardShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    })

    // CRITICAL: Normalize UV coordinates so texture covers the FULL card face edge-to-edge (0..1)
    const pos = cardGeometry.attributes.position
    const uv = cardGeometry.attributes.uv
    const halfW = cardWidth / 2
    const halfH = cardHeight / 2
    for (let i = 0; i < uv.count; i++) {
      const px = pos.getX(i)
      const py = pos.getY(i)
      const u = Math.min(1, Math.max(0, (px + halfW) / cardWidth))
      const v = Math.min(1, Math.max(0, (py + halfH) / cardHeight))
      uv.setXY(i, u, v)
    }
    uv.needsUpdate = true

    // Material pooling for slots
    const SLOT_COUNT = 9
    const cardMeshes: THREE.Mesh[] = []
    const frontMaterials: THREE.MeshStandardMaterial[] = []
    const rimMaterials: THREE.MeshStandardMaterial[] = []

    for (let i = 0; i < SLOT_COUNT; i++) {
      const frontMat = new THREE.MeshStandardMaterial({
        map: cardTextures[i % items.length],
        roughness: 0.16,
        metalness: 0.04,
        transparent: true,
      })
      const rimMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x1f0e14 : 0xf4eee6,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0x991024,
        emissiveIntensity: 0.3,
      })
      frontMaterials.push(frontMat)
      rimMaterials.push(rimMat)

      const mesh = new THREE.Mesh(cardGeometry, [frontMat, rimMat])
      mesh.userData = { poolIndex: i, slotIndex: 0 }
      scene.add(mesh)
      cardMeshes.push(mesh)
    }

    // Raycaster for hover/click detection
    const raycaster = new THREE.Raycaster()

    // Responsive camera position adjustment
    function updateCamera() {
      if (!container) return
      const w = container.clientWidth
      camera.aspect = w / container.clientHeight
      if (w < 600) {
        camera.position.set(0, -0.32, 7.5)
      } else if (w < 1024) {
        camera.position.set(0, -0.38, 6.8)
      } else {
        camera.position.set(0, -0.42, 6.2)
      }
      camera.updateProjectionMatrix()
      renderer.setSize(w, container.clientHeight, false)
    }
    const resizeObserver = new ResizeObserver(updateCamera)
    resizeObserver.observe(container)
    updateCamera()

    let lastActiveIdx = -1

    // Animation Loop
    function render(now: number) {
      if (disposed) return

      // Smooth damping interpolation
      const diff = targetAngleRef.current - angleRef.current
      angleRef.current += diff * 0.12

      // Micro floating breathing motion
      const floatOffset = Math.sin(now * 0.0018) * 0.035

      const continuousSlot = angleRef.current / STEP
      const centerSlot = Math.round(continuousSlot)

      // Notify React state of center card change
      const currentActive = ((centerSlot % items.length) + items.length) % items.length
      if (currentActive !== lastActiveIdx) {
        lastActiveIdx = currentActive
        setActiveIndex(currentActive)
      }

      // Position each of the 9 mesh slots along the 3D depth arc
      const halfSlots = Math.floor(SLOT_COUNT / 2) // 4
      for (let s = -halfSlots; s <= halfSlots; s++) {
        const slotK = centerSlot + s
        const meshIdx = ((slotK % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT
        const mesh = cardMeshes[meshIdx]
        const frontMat = frontMaterials[meshIdx]
        const rimMat = rimMaterials[meshIdx]

        mesh.userData.slotIndex = slotK

        // Card data item index
        const itemIdx = ((slotK % items.length) + items.length) % items.length
        frontMat.map = cardTextures[itemIdx]

        // Relative angle from current view center
        const relAngle = (slotK - continuousSlot) * STEP

        if (Math.abs(relAngle) > 1.85) {
          mesh.visible = false
          continue
        }
        mesh.visible = true

        // True 3D Depth Curve Coordinates
        const x = RADIUS * Math.sin(relAngle)
        const z = RADIUS * (Math.cos(relAngle) - 1) - 0.42 * (relAngle * relAngle)
        const rotY = -relAngle * 0.76

        // Depth perspective foreshortening - center card large, side cards clearly visible
        const distFromCenter = Math.abs(relAngle) / STEP
        const scaleFactor = Math.max(0.60, 1.0 - 0.11 * distFromCenter)

        // Depth fog / opacity falloff - subtle only, no excessive wash out
        const depthAlpha = Math.max(0.48, 1.0 - 0.05 * Math.pow(distFromCenter, 1.35))
        frontMat.opacity = depthAlpha

        // Center card crimson rim bloom
        const isCenter = distFromCenter < 0.45
        const isHovered = hoveredSlotRef.current === slotK

        if (isCenter) {
          rimMat.emissiveIntensity = 0.9
          rimMat.emissive.setHex(0xdc2626)
        } else if (isHovered) {
          rimMat.emissiveIntensity = 0.65
          rimMat.emissive.setHex(0xff3b4d)
        } else {
          rimMat.emissiveIntensity = 0.3
          rimMat.emissive.setHex(0x7a0e1c)
        }

        mesh.position.set(x, floatOffset * (isCenter ? 1 : 0.6), z)
        mesh.rotation.set(0, rotY, 0)
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
      }

      // Pointer raycasting for hover detection
      if (mouseNormRef.current.x > -2) {
        raycaster.setFromCamera(mouseNormRef.current, camera)
        const hits = raycaster.intersectObjects(cardMeshes)
        if (hits.length > 0) {
          hoveredSlotRef.current = hits[0].object.userData.slotIndex
        } else {
          hoveredSlotRef.current = null
        }
      }

      renderer.render(scene, camera)
      animFrameId = requestAnimationFrame(render)
    }
    animFrameId = requestAnimationFrame(render)

    // Pointer Event Listeners for Drag and Click
    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true
      setIsDragging(true)
      startXRef.current = e.clientX
      startAngleRef.current = targetAngleRef.current
      lastXRef.current = e.clientX
      lastTimeRef.current = performance.now()
      velocityRef.current = 0
      dragDistRef.current = 0
      setHasInteracted(true)

      // Update mouse normalized coords
      const rect = canvas.getBoundingClientRect()
      mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      if (!isPointerDownRef.current) return

      const dx = e.clientX - startXRef.current
      dragDistRef.current = Math.abs(dx)

      const stageWidth = Math.max(300, rect.width)
      // Sensitivity: drag 1 stage width rotates ~4 card slots
      const angleDelta = (dx / stageWidth) * 1.95
      targetAngleRef.current = startAngleRef.current - angleDelta

      const now = performance.now()
      const dt = Math.max(1, now - lastTimeRef.current)
      velocityRef.current = (e.clientX - lastXRef.current) / dt
      lastXRef.current = e.clientX
      lastTimeRef.current = now
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return
      isPointerDownRef.current = false
      setIsDragging(false)

      const rect = canvas.getBoundingClientRect()
      const totalDrag = dragDistRef.current

      if (totalDrag > 8) {
        // Drag release: apply inertial momentum
        const stageWidth = Math.max(300, rect.width)
        const momentumDelta = (velocityRef.current * 140) / stageWidth
        targetAngleRef.current -= momentumDelta

        // Spring snap to nearest slot
        const nearestSlot = Math.round(targetAngleRef.current / STEP)
        targetSlotRef.current = nearestSlot
        targetAngleRef.current = nearestSlot * STEP
      } else {
        // Click action: raycast clicked card
        mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouseNormRef.current, camera)
        const hits = raycaster.intersectObjects(cardMeshes)

        if (hits.length > 0) {
          const hitMesh = hits[0].object
          const hitSlot = hitMesh.userData.slotIndex
          const currentCenterSlot = Math.round(targetAngleRef.current / STEP)
          const offsetFromCenter = hitSlot - currentCenterSlot

          if (Math.abs(offsetFromCenter) < 0.2) {
            // Clicked active front center card -> Trigger action!
            const hitItemIdx = ((hitSlot % items.length) + items.length) % items.length
            items[hitItemIdx].action()
          } else {
            // Clicked side card -> rotate to it!
            navigateToSlot(hitSlot)
          }
        }
      }
    }

    const onPointerLeave = () => {
      mouseNormRef.current.set(-999, -999)
      hoveredSlotRef.current = null
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false
        setIsDragging(false)
        const nearestSlot = Math.round(targetAngleRef.current / STEP)
        targetSlotRef.current = nearestSlot
        targetAngleRef.current = nearestSlot * STEP
      }
    }

    // Wheel listener
    const onWheel = (e: WheelEvent) => {
      // Horizontal or vertical trackpad / wheel delta
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) < 2) return

      e.preventDefault()
      setHasInteracted(true)

      const wheelFactor = 0.0024
      targetAngleRef.current += delta * wheelFactor

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current)
      wheelTimeoutRef.current = setTimeout(() => {
        const nearestSlot = Math.round(targetAngleRef.current / STEP)
        targetSlotRef.current = nearestSlot
        targetAngleRef.current = nearestSlot * STEP
      }, 160)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    // Cleanup
    return () => {
      disposed = true
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current)

      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('wheel', onWheel)

      cardGeometry.dispose()
      glowTexture.dispose()
      cardTextures.forEach((t) => t.dispose())
      frontMaterials.forEach((m) => m.dispose())
      rimMaterials.forEach((m) => m.dispose())
      renderer.dispose()
    }
  }, [items, theme, navigateToSlot])

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      items[activeIndex].action()
    }
  }

  const activeItem = items[activeIndex]

  return (
    <div
      className={`depth-carousel-wrapper ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}
      role="region"
      aria-label="3D Multiverse Gateways Depth Carousel"
    >
      {/* 3D Depth WebGL Stage */}
      <div
        ref={containerRef}
        className={`depth-carousel-canvas-container ${isDragging ? 'is-dragging' : ''}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Interactive 3D Carousel. Use left/right arrow keys or drag to rotate."
      >
        <canvas ref={canvasRef} className="depth-carousel-canvas" />
        <div className="depth-carousel-vignette" />

        {/* Drag Hint (hidden once user interacts) */}
        {!hasInteracted && (
          <div className="depth-carousel-hint" aria-hidden="true">
            <span className="depth-carousel-hint-icon">✦</span>
            <span>Drag or scroll to rotate 3D paths</span>
          </div>
        )}

        {/* Floating Controls Bar */}
        <div className="depth-carousel-controls">
          {/* Left CTA: "Preview →" / "Explore →" matching Scrolltide reference */}
          {/* Left CTA: Explore/Enter Gateway matching card action */}
          <button
            type="button"
            className="depth-carousel-cta"
            onClick={() => activeItem.action()}
            aria-label={activeItem.ctaText ? `${activeItem.ctaText}` : `Explore ${activeItem.title}`}
          >
            <span>{activeItem.ctaText || `Explore ${activeItem.title}`}</span>
            <span className="depth-carousel-cta-arrow" aria-hidden="true">
              <ArrowRightIcon size={14} />
            </span>
          </button>

          {/* Center 3-Dot Pagination */}
          <div className="depth-carousel-pagination" role="tablist" aria-label="Carousel pagination">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Jump to ${item.title}`}
                className={`depth-carousel-dot ${idx === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleDotClick(idx)}
              />
            ))}
          </div>

          {/* Right Navigation Arrows */}
          <div className="depth-carousel-nav-arrows">
            <button
              type="button"
              className="depth-carousel-arrow-btn"
              onClick={handlePrev}
              aria-label="Previous card in 3D carousel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="depth-carousel-arrow-btn"
              onClick={handleNext}
              aria-label="Next card in 3D carousel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DepthCarousel3D
