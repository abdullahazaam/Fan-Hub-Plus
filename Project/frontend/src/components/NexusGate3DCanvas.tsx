import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { NexusArchitectureFallback } from './NexusWorld'
import worldArtwork from '../assets/nexus-world.webp'

interface NexusGate3DCanvasProps {
  theme: 'dark' | 'light'
  activeFacet: number | null
  entering: boolean
}

/** One bounded architectural assembly. DOM entry points share its coordinate system. */
export const NexusGate3DCanvas: React.FC<NexusGate3DCanvasProps> = ({ theme, activeFacet, entering }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(activeFacet)
  const enteringRef = useRef(entering)
  const invalidateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    activeRef.current = activeFacet
    enteringRef.current = entering
    invalidateRef.current?.()
  }, [activeFacet, entering])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const stage = container?.closest<HTMLElement>('.nexus-stage')
    if (!container || !canvas || !stage) return

    container.classList.remove('is-ready')
    stage.classList.remove('has-webgl-world')

    function resetLayout() {
      stage!.querySelectorAll<HTMLElement>('.portal-facet').forEach((button, i) => {
        const angle = (i * Math.PI) / 4 - Math.PI / 2
        button.style.left = `${50 + Math.cos(angle) * 33.1}%`
        button.style.top = `${46 + Math.sin(angle) * 33.1}%`
      })
      const aperture = stage!.querySelector<HTMLElement>('.portal-inner-aperture')
      if (aperture) {
        aperture.style.left = '50%'
        aperture.style.top = '46%'
      }
    }
    resetLayout()

    const dark = theme === 'dark'
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)')

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 50)
    camera.position.set(0, 0, 14)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, innerWidth < 600 || navigator.hardwareConcurrency <= 4 ? 1 : 1.5)
      )
      renderer.setClearColor(0, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = dark ? 1.28 : 1.06
    } catch {
      return
    }

    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []

    function material(options: THREE.MeshStandardMaterialParameters) {
      const mat = new THREE.MeshStandardMaterial(options)
      materials.push(mat)
      return mat
    }

    // Deterministic fine stone grain texture, generated locally with zero network overhead.
    const grain = new Uint8Array(128 * 128 * 4)
    let seed = 19
    for (let i = 0; i < 128 * 128; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const x = i % 128,
        y = Math.floor(i / 128)
      const vein = Math.pow(Math.abs(Math.sin(x * 0.071 + y * 0.035 + Math.sin(y * 0.08) * 1.8)), 18)
      const value = Math.round(192 + (seed % 35) - vein * 34)
      grain.set([value, value, value, 255], i * 4)
    }
    const texture = new THREE.DataTexture(grain, 128, 128)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(3, 3)
    texture.needsUpdate = true

    // Architectural materials matching obsidian abyss & warm ivory
    const stone = material({
      color: dark ? '#2a2b2e' : '#ede7dc',
      roughness: dark ? 0.5 : 0.65,
      metalness: dark ? 0.4 : 0.08,
      map: texture,
      bumpMap: texture,
      bumpScale: 0.028,
    })
    const side = material({
      color: dark ? '#131416' : '#d5cbbd',
      roughness: 0.58,
      metalness: dark ? 0.42 : 0.12,
    })
    const trim = material({
      color: dark ? '#58544e' : '#a8967f',
      metalness: dark ? 0.72 : 0.52,
      roughness: 0.32,
    })
    const red = material({
      color: dark ? '#b91c1c' : '#dc2626',
      emissive: '#dc2626',
      emissiveIntensity: dark ? 0.5 : 0.15,
      metalness: 0.4,
      roughness: 0.35,
    })

    const assembly = new THREE.Group()
    assembly.position.y = 0.32
    assembly.rotation.y = -0.1
    scene.add(assembly)

    function mesh(
      geo: THREE.BufferGeometry,
      mat: THREE.Material | THREE.Material[],
      parent: THREE.Object3D = assembly
    ) {
      geometries.push(geo)
      const object = new THREE.Mesh(geo, mat)
      parent.add(object)
      return object
    }

    function sector(outer: number, inner: number, angle: number, gap: number) {
      const a = angle - Math.PI / 8 + gap,
        b = angle + Math.PI / 8 - gap
      const shape = new THREE.Shape()
      shape.moveTo(outer * Math.cos(a), outer * Math.sin(a))
      shape.lineTo(outer * Math.cos(b), outer * Math.sin(b))
      shape.lineTo(inner * Math.cos(b), inner * Math.sin(b))
      shape.absarc(0, 0, inner, b, a, true)
      shape.closePath()
      return shape
    }

    // Monumental octagonal backing slab
    const backingShape = new THREE.Shape()
    for (let i = 0; i < 8; i++) {
      const t = Math.PI / 8 + (i * Math.PI) / 4
      const x = 3.58 * Math.cos(t),
        y = 3.58 * Math.sin(t)
      if (i === 0) backingShape.moveTo(x, y)
      else backingShape.lineTo(x, y)
    }
    backingShape.closePath()
    const hole = new THREE.Path()
    hole.absarc(0, 0, 1.89, 0, Math.PI * 2, true)
    backingShape.holes.push(hole)
    const backing = mesh(
      new THREE.ExtrudeGeometry(backingShape, {
        depth: 1.08,
        bevelEnabled: true,
        bevelSize: 0.045,
        bevelThickness: 0.045,
        bevelSegments: 2,
      }),
      side
    )
    backing.position.set(0.035, -0.04, -1.18)

    // 8 Faceted Fandom Portals with machined trim & crimson threshold lights
    const facets: THREE.MeshStandardMaterial[] = []
    const facetGroups: THREE.Group[] = []
    const facetDepths = Array(8).fill(0) as number[]

    for (let i = 0; i < 8; i++) {
      const angle = Math.PI / 2 - (i * Math.PI) / 4
      const group = new THREE.Group()
      assembly.add(group)
      facetGroups.push(group)

      const front = stone.clone()
      materials.push(front)
      facets.push(front)

      const wedge = mesh(
        new THREE.ExtrudeGeometry(sector(3.49, 2.02, angle, 0.006), {
          depth: 0.38,
          bevelEnabled: true,
          bevelThickness: 0.08,
          bevelSize: 0.06,
          bevelSegments: 3,
          steps: 1,
          curveSegments: 24,
        }),
        [front, side],
        group
      )
      wedge.position.z = -0.1

      const a = angle - Math.PI / 8,
        b = angle + Math.PI / 8
      const x1 = 3.58 * Math.cos(a),
        y1 = 3.58 * Math.sin(a)
      const x2 = 3.58 * Math.cos(b),
        y2 = 3.58 * Math.sin(b)
      const edge = mesh(new THREE.BoxGeometry(Math.hypot(x2 - x1, y2 - y1) - 0.055, 0.014, 0.024), red, group)
      edge.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0.4)
      edge.rotation.z = Math.atan2(y2 - y1, x2 - x1)

      for (const sign of [-1, 1]) {
        const t = angle + sign * 0.28
        const rivet = mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.017, 8), trim, group)
        rivet.rotation.x = Math.PI / 2
        rivet.position.set(3.12 * Math.cos(t), 3.12 * Math.sin(t), 0.365)
      }

      const threshold = mesh(new THREE.TorusGeometry(1.97, 0.02, 6, 18, Math.PI / 4 - 0.09), red, group)
      threshold.rotation.z = angle - Math.PI / 8 + 0.045
      threshold.position.z = 0.29
    }

    // Stepped inner portal collar rings
    for (const [radius, tube, z] of [
      [2.01, 0.075, 0.18],
      [1.95, 0.048, -0.12],
      [1.91, 0.045, -0.48],
      [1.87, 0.038, -0.88],
    ]) {
      const collar = mesh(new THREE.TorusGeometry(radius, tube, 10, 96), trim)
      collar.position.z = z
    }
    const recess = mesh(new THREE.CylinderGeometry(1.95, 1.85, 1.25, 80, 1, true), side)
    recess.rotation.x = Math.PI / 2
    recess.position.z = -0.48

    // Monumental Tiered Stone Plinth Base with Crimson Seam Runners
    for (let i = 0; i < 4; i++) {
      const w = 5.2 + i * 0.65,
        y = -2.9 - i * 0.22
      const shape = new THREE.Shape()
      shape.moveTo(-w / 2, y)
      shape.lineTo(w / 2, y)
      shape.lineTo(w / 2 + 0.2, y - 0.15)
      shape.lineTo(-w / 2 - 0.2, y - 0.15)
      shape.closePath()
      const step = mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: 0.72 + i * 0.14,
          bevelEnabled: true,
          bevelSize: 0.028,
          bevelThickness: 0.028,
          bevelSegments: 2,
        }),
        [stone, side],
        scene
      )
      step.position.z = -0.25

      // Inset crimson runner strip between steps
      if (i < 3) {
        const runner = mesh(new THREE.BoxGeometry(w - 0.4, 0.015, 0.03), red, scene)
        runner.position.set(0, y - 0.01, 0.44 - i * 0.08)
      }
    }

    // Portal Kinetic Embers & Stardust Particles
    const particleCount = 42
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVelocities = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 1.55
      const theta = Math.random() * Math.PI * 2
      particlePositions[i * 3] = r * Math.cos(theta)
      particlePositions[i * 3 + 1] = r * Math.sin(theta)
      particlePositions[i * 3 + 2] = -1.1 + Math.random() * 1.4
      particleVelocities[i * 3 + 2] = 0.22 + Math.random() * 0.38
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: dark ? '#ff3b30' : '#ea580c',
      size: 0.042,
      transparent: true,
      opacity: dark ? 0.72 : 0.42,
      blending: THREE.AdditiveBlending,
    })
    materials.push(particleMat)
    geometries.push(particleGeo)
    const particles = new THREE.Points(particleGeo, particleMat)
    assembly.add(particles)

    // Core Portal Aperture Light (Casts crimson illumination outward onto bevels)
    const portalCoreLight = new THREE.PointLight('#dc2626', dark ? 20 : 6, 7, 2)
    portalCoreLight.position.set(0, 0, -0.35)
    assembly.add(portalCoreLight)

    // Studio Lighting Environment
    scene.add(
      new THREE.HemisphereLight(
        dark ? '#efeeeb' : '#fffcf4',
        dark ? '#1c1716' : '#a79b88',
        dark ? 0.65 : 2.4
      )
    )
    const key = new THREE.DirectionalLight(dark ? '#fff8ef' : '#fff1db', dark ? 2.0 : 2.9)
    key.position.set(-3.5, 6.5, 7.5)
    scene.add(key)

    const softbox = new THREE.PointLight(dark ? '#fff4e5' : '#fffaf0', dark ? 40 : 24, 18, 2)
    softbox.position.set(-2, 4, 3)
    scene.add(softbox)

    const rim = new THREE.PointLight('#dc2626', dark ? 26 : 4, 16, 2)
    rim.position.set(4.2, 1, 2.5)
    scene.add(rim)

    const fill = new THREE.DirectionalLight('#c0523a', dark ? 0.55 : 0.15)
    fill.position.set(-4, -2, 3)
    scene.add(fill)

    // Floor bounce reflection light
    const floorBounce = new THREE.DirectionalLight(dark ? '#dc2626' : '#d97706', dark ? 0.35 : 0.12)
    floorBounce.position.set(0, -5, 2)
    scene.add(floorBounce)

    let frame = 0,
      visible = true,
      lost = false,
      disposed = false,
      worldReady = false
    let pointerX = 0,
      pointerY = 0,
      currentX = 0,
      currentY = 0,
      scroll = 0,
      currentScroll = 0,
      entryProgress = 0
    let last = performance.now(),
      renderCount = 0

    const buttons = Array.from(stage.querySelectorAll<HTMLElement>('.portal-facet'))
    const aperture = stage.querySelector<HTMLElement>('.portal-inner-aperture')
    const labelPoint = new THREE.Vector3()

    const worldMap = new THREE.TextureLoader().load(worldArtwork, (map) => {
      if (disposed) {
        map.dispose()
        return
      }
      map.colorSpace = THREE.SRGBColorSpace
      worldReady = true
      stage.classList.add('has-webgl-world')
      invalidate()
    })
    const worldMaterial = new THREE.MeshBasicMaterial({
      map: worldMap,
      color: dark ? '#c07369' : '#fff7e9',
    })
    materials.push(worldMaterial)
    const worldDisc = mesh(new THREE.CircleGeometry(1.86, 80), worldMaterial)
    worldDisc.position.z = -1.14

    function projectLabels() {
      scene.updateMatrixWorld(true)
      camera.updateMatrixWorld(true)
      buttons.forEach((button, i) => {
        const angle = Math.PI / 2 - (i * Math.PI) / 4
        labelPoint.set(Math.cos(angle) * 2.65, Math.sin(angle) * 2.65, 0.4)
        facetGroups[i].localToWorld(labelPoint).project(camera)
        button.style.left = `${(labelPoint.x + 1) * 50}%`
        button.style.top = `${(1 - labelPoint.y) * 50}%`
      })
      if (aperture) {
        labelPoint.set(0, 0, -0.2)
        assembly.localToWorld(labelPoint).project(camera)
        aperture.style.left = `${(labelPoint.x + 1) * 50}%`
        aperture.style.top = `${(1 - labelPoint.y) * 50}%`
      }
    }

    function render(time: number) {
      frame = 0
      if (disposed || lost || !visible || document.hidden) return
      const animate = !motion.matches && finePointer.matches
      const dt = Math.min((time - last) / 1000, 0.05)
      last = time
      const damping = animate ? 1 - Math.exp(-dt * 9) : 1
      const targetX = animate ? pointerX : 0,
        targetY = animate ? pointerY : 0
      currentX += (targetX - currentX) * damping
      currentY += (targetY - currentY) * damping
      currentScroll += ((animate ? scroll : 0) - currentScroll) * damping
      const entryTarget = enteringRef.current && !motion.matches ? 1 : 0
      entryProgress += (entryTarget - entryProgress) * damping

      camera.position.set(0.65 + currentX * 1.9, 0.3 - currentY * 0.95 + currentScroll * 0.45, 14)
      camera.lookAt(0, 0.1, 0)
      camera.zoom = 1 + entryProgress * 0.075
      camera.updateProjectionMatrix()

      softbox.position.x = -2 + currentX * 1.6
      rim.position.y = 1 - currentY

      // Update inner portal particle positions
      const pos = particleGeo.attributes.position.array as Float32Array
      const speedMult = 1 + entryProgress * 3.5
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 2] += particleVelocities[i * 3 + 2] * dt * speedMult
        if (pos[i * 3 + 2] > 0.35) {
          pos[i * 3 + 2] = -1.1
          const r = Math.random() * 1.55
          const theta = Math.random() * Math.PI * 2
          pos[i * 3] = r * Math.cos(theta)
          pos[i * 3 + 1] = r * Math.sin(theta)
        }
      }
      particleGeo.attributes.position.needsUpdate = true

      let settling =
        Math.abs(currentX - targetX) +
        Math.abs(currentY - targetY) +
        Math.abs(currentScroll - (animate ? scroll : 0)) +
        Math.abs(entryProgress - entryTarget)

      facets.forEach((mat, i) => {
        const selected = i === activeRef.current
        const target = selected ? 0.32 : 0
        facetDepths[i] += (target - facetDepths[i]) * damping
        settling += Math.abs(target - facetDepths[i])
        const angle = Math.PI / 2 - (i * Math.PI) / 4
        facetGroups[i].position.set(
          Math.cos(angle) * entryProgress * 0.15,
          Math.sin(angle) * entryProgress * 0.15,
          facetDepths[i] + entryProgress * 0.08
        )
        mat.emissive.set(selected ? '#842219' : '#000000')
        mat.emissiveIntensity = selected ? (dark ? 0.28 : 0.06) : 0
        mat.roughness = selected ? 0.29 : 0.48
      })

      worldDisc.scale.setScalar(1 + entryProgress * 0.06)
      projectLabels()
      renderer.render(scene, camera)

      container!.dataset.renderCount = String(++renderCount)
      if (animate && (settling > 0.002 || !motion.matches)) frame = requestAnimationFrame(render)
    }

    function invalidate() {
      if (!frame && !disposed && !lost && visible && !document.hidden) {
        last = performance.now() - 16
        frame = requestAnimationFrame(render)
      }
    }
    invalidateRef.current = invalidate

    const resize = new ResizeObserver(() => {
      renderer.setSize(container.clientWidth, container.clientHeight, false)
      invalidate()
    })
    resize.observe(container)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        last = performance.now()
        invalidate()
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    intersection.observe(container)

    const move = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      invalidate()
    }
    const leave = () => {
      pointerX = 0
      pointerY = 0
      invalidate()
    }
    const onScroll = () => {
      scroll = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / innerHeight))
      invalidate()
    }
    const onPreference = () => {
      currentX = currentY = 0
      invalidate()
    }
    const onVisibility = () => {
      if (!document.hidden) invalidate()
    }
    const onLoss = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      frame = 0
      container.classList.remove('is-ready')
      stage.classList.remove('has-webgl-world')
      resetLayout()
    }
    const onRestore = () => {
      lost = false
      container.classList.add('is-ready')
      if (worldReady) stage.classList.add('has-webgl-world')
      invalidate()
    }

    stage.addEventListener('pointermove', move, { passive: true })
    stage.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onPreference)
    finePointer.addEventListener('change', onPreference)
    canvas.addEventListener('webglcontextlost', onLoss)
    canvas.addEventListener('webglcontextrestored', onRestore)

    renderer.setSize(container.clientWidth, container.clientHeight, false)
    renderer.render(scene, camera)
    container.classList.add('is-ready')
    invalidate()

    return () => {
      disposed = true
      invalidateRef.current = null
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      stage.classList.remove('has-webgl-world')
      resetLayout()
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onPreference)
      finePointer.removeEventListener('change', onPreference)
      canvas.removeEventListener('webglcontextlost', onLoss)
      canvas.removeEventListener('webglcontextrestored', onRestore)
      geometries.forEach((geo) => geo.dispose())
      materials.forEach((mat) => mat.dispose())
      texture.dispose()
      worldMap.dispose()
      renderer.dispose()
      if (!canvas.isConnected) renderer.forceContextLoss()
    }
  }, [theme])

  return (
    <div ref={containerRef} className="nexus-3d-canvas-wrap" aria-hidden="true">
      <NexusArchitectureFallback />
      <canvas ref={canvasRef} className="nexus-webgl-canvas" />
    </div>
  )
}
