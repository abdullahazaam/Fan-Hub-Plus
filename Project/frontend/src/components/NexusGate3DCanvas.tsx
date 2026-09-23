import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { NexusArchitectureFallback } from './NexusWorld'

interface NexusGate3DCanvasProps {
  theme: 'dark' | 'light'
  activeFacet: number | null
}

/** One bounded architectural assembly. DOM entry points share its coordinate system. */
export const NexusGate3DCanvas: React.FC<NexusGate3DCanvasProps> = ({ theme, activeFacet }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(activeFacet)
  const invalidateRef = useRef<(() => void) | null>(null)
  useEffect(() => { activeRef.current = activeFacet; invalidateRef.current?.() }, [activeFacet])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const stage = container?.closest<HTMLElement>('.nexus-stage')
    if (!container || !canvas || !stage) return
    container.classList.remove('is-ready')
    const dark = theme === 'dark'
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)')
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, .1, 50)
    camera.position.set(0, 0, 14)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 600 ? 1.25 : 1.5))
      renderer.setClearColor(0, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = dark ? 1.25 : 1.05
    } catch { return }

    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    function material(options: THREE.MeshStandardMaterialParameters) {
      const mat = new THREE.MeshStandardMaterial(options)
      materials.push(mat)
      return mat
    }
    // Deterministic fine stone grain, generated locally; no remote texture requests.
    const grain = new Uint8Array(128 * 128 * 4)
    let seed = 19
    for (let i = 0; i < 128 * 128; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const x = i % 128, y = Math.floor(i / 128)
      const vein = Math.pow(Math.abs(Math.sin(x * .071 + y * .035 + Math.sin(y * .08) * 1.8)), 18)
      const value = Math.round(192 + (seed % 35) - vein * 34)
      grain.set([value, value, value, 255], i * 4)
    }
    const texture = new THREE.DataTexture(grain, 128, 128)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(3, 3)
    texture.needsUpdate = true
    const stone = material({color: dark ? '#353637' : '#e5d9c3', roughness: .48, metalness: dark ? .48 : .12, map: texture, bumpMap: texture, bumpScale: .025})
    const side = material({color: dark ? '#151617' : '#b4a58e', roughness: .55, metalness: .45})
    const trim = material({color: dark ? '#625e58' : '#bca98d', metalness: .72, roughness: .32})
    const red = material({color: '#a72722', emissive: '#bd211a', emissiveIntensity: dark ? .45 : .1, metalness: .4, roughness: .38})
    const assembly = new THREE.Group()
    assembly.position.y = .32
    assembly.rotation.y = -.055
    scene.add(assembly)
    function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], parent: THREE.Object3D = assembly) {
      geometries.push(geo)
      const object = new THREE.Mesh(geo, mat)
      parent.add(object)
      return object
    }
    function sector(outer: number, inner: number, angle: number, gap: number) {
      const a = angle - Math.PI / 8 + gap, b = angle + Math.PI / 8 - gap
      const shape = new THREE.Shape()
      shape.moveTo(outer * Math.cos(a), outer * Math.sin(a))
      shape.lineTo(outer * Math.cos(b), outer * Math.sin(b))
      shape.lineTo(inner * Math.cos(b), inner * Math.sin(b))
      shape.absarc(0, 0, inner, b, a, true)
      shape.closePath()
      return shape
    }
    // Solid octagonal backing exposes the thickness of the carved front assembly.
    const backingShape = new THREE.Shape()
    for (let i = 0; i < 8; i++) {
      const t = Math.PI / 8 + i * Math.PI / 4
      const x = 3.57 * Math.cos(t), y = 3.57 * Math.sin(t)
      if (i === 0) backingShape.moveTo(x,y); else backingShape.lineTo(x,y)
    }
    backingShape.closePath()
    const hole = new THREE.Path()
    hole.absarc(0,0,1.89,0,Math.PI*2,true)
    backingShape.holes.push(hole)
    const backing = mesh(new THREE.ExtrudeGeometry(backingShape,{depth:.6,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:2}),side)
    backing.position.set(.035,-.04,-.7)
    const facets: THREE.MeshStandardMaterial[] = []
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI / 2 - i * Math.PI / 4
      const front = stone.clone()
      materials.push(front)
      facets.push(front)
      const wedge = mesh(new THREE.ExtrudeGeometry(sector(3.49, 2.02, angle, .006), {depth: .38, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 3, steps: 1, curveSegments: 24}), [front, side])
      wedge.position.z = -.1
      const a = angle - Math.PI/8, b = angle + Math.PI/8
      const x1 = 3.58*Math.cos(a), y1 = 3.58*Math.sin(a)
      const x2 = 3.58*Math.cos(b), y2 = 3.58*Math.sin(b)
      const edge = mesh(new THREE.BoxGeometry(Math.hypot(x2-x1,y2-y1)-.055,.013,.022),red)
      edge.position.set((x1+x2)/2,(y1+y2)/2,.4)
      edge.rotation.z = Math.atan2(y2-y1,x2-x1)
      // Machined fasteners and a restrained inset score give each facet scale.
      for (const sign of [-1,1]) {
        const t = angle + sign*.28
        const rivet = mesh(new THREE.CylinderGeometry(.024,.024,.017,8),trim)
        rivet.rotation.x = Math.PI/2
        rivet.position.set(3.12*Math.cos(t),3.12*Math.sin(t),.365)
      }
      // Eight inset threshold lights tie each universe to the same opening.
      const threshold = mesh(new THREE.TorusGeometry(1.97, .019, 6, 18, Math.PI / 4 - .09), red)
      threshold.rotation.z = angle - Math.PI / 8 + .045
      threshold.position.z = .29
    }
    for (const [radius, tube, z] of [[2.01,.075,.18],[1.92,.037,.04],[1.87,.026,-.14]]) {
      const collar = mesh(new THREE.TorusGeometry(radius, tube, 10, 96), trim)
      collar.position.z = z
    }
    const recess = mesh(new THREE.CylinderGeometry(1.95, 1.85, .55, 80, 1, true), side)
    recess.rotation.x = Math.PI / 2
    recess.position.z = -.13
    // Broad bevelled plinths ground the gate. No floor grid or freestanding objects.
    for (let i = 0; i < 3; i++) {
      const w = 5.1 + i * .6, y = -2.93 - i * .22
      const shape = new THREE.Shape()
      shape.moveTo(-w/2, y); shape.lineTo(w/2,y); shape.lineTo(w/2+.19,y-.14); shape.lineTo(-w/2-.19,y-.14); shape.closePath()
      const step = mesh(new THREE.ExtrudeGeometry(shape, {depth: .65 + i*.12, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 1}), [stone,side], scene)
      step.position.z = -.22
    }
    scene.add(new THREE.HemisphereLight(dark ? '#efeeeb' : '#fff9ed', dark ? '#211918' : '#a79b88', dark ? .65 : 2.5))
    const key = new THREE.DirectionalLight(dark ? '#fff8ef' : '#fff1db', dark ? 1.8 : 2.8)
    key.position.set(-3, 6, 7); scene.add(key)
    const softbox = new THREE.PointLight(dark ? '#fff4e5' : '#fffaf0', dark ? 42 : 24, 18, 2)
    softbox.position.set(-2, 4, 3)
    scene.add(softbox)
    const rim = new THREE.PointLight('#c92b20', dark ? 23 : 3, 16, 2)
    rim.position.set(4, 1, 2); scene.add(rim)
    const fill = new THREE.DirectionalLight('#c0523a', dark ? .5 : .12)
    fill.position.set(-4, -2, 3); scene.add(fill)

    let frame = 0, visible = true, lost = false, disposed = false
    let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0, scroll = 0
    let last = 0
    function render(time = 0) {
      frame = 0
      if (disposed || lost || !visible || document.hidden) return
      const animate = !motion.matches && finePointer.matches
      const dt = Math.min((time - last) / 1000 || 0, .05)
      last = time
      const damping = 1 - Math.exp(-dt * 7)
      currentX += ((animate ? pointerX : 0) - currentX) * damping
      currentY += ((animate ? pointerY : 0) - currentY) * damping
      stage!.style.transform = animate ? `perspective(1100px) rotateY(${currentX * 1.6}deg) rotateX(${-currentY * 1.1}deg) translateY(${scroll * -4}px)` : ''
      rim.intensity = (dark ? 23 : 3) * (animate ? 1 + Math.sin(time * .00065) * .055 : 1)
      key.position.x = -3 + currentX * .7
      facets.forEach((mat,i) => { mat.emissive.set(i === activeRef.current ? '#842219' : '#000000'); mat.emissiveIntensity = i === activeRef.current ? (dark ? .45 : .12) : 0 })
      renderer.render(scene, camera)
      if (animate) frame = requestAnimationFrame(render)
    }
    function invalidate() { if (!frame && !disposed) frame = requestAnimationFrame(render) }
    invalidateRef.current = invalidate
    const resize = new ResizeObserver(() => {
      renderer.setSize(container.clientWidth, container.clientHeight, false)
      invalidate()
    })
    resize.observe(container)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) { last = performance.now(); invalidate() } else { cancelAnimationFrame(frame); frame = 0 }
    })
    intersection.observe(container)
    const move = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointerX = (event.clientX - rect.left) / rect.width * 2 - 1
      pointerY = (event.clientY - rect.top) / rect.height * 2 - 1
      invalidate()
    }
    const leave = () => { pointerX = 0; pointerY = 0; invalidate() }
    const onScroll = () => { scroll = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / innerHeight)); invalidate() }
    const onPreference = () => { currentX = currentY = 0; stage.style.transform = ''; invalidate() }
    const onVisibility = () => { if (!document.hidden) invalidate() }
    const onLoss = (event: Event) => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; container.classList.remove('is-ready'); stage.style.transform = '' }
    const onRestore = () => { lost = false; container.classList.add('is-ready'); invalidate() }
    stage.addEventListener('pointermove', move, {passive:true})
    stage.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', onScroll, {passive:true})
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
      resize.disconnect(); intersection.disconnect()
      stage.style.transform = ''
      stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onPreference); finePointer.removeEventListener('change', onPreference)
      canvas.removeEventListener('webglcontextlost', onLoss); canvas.removeEventListener('webglcontextrestored', onRestore)
      geometries.forEach(geo => geo.dispose()); materials.forEach(mat => mat.dispose()); texture.dispose()
      renderer.dispose()
      // StrictMode and theme changes reuse the mounted canvas immediately.
      // Only release its context after a real DOM unmount.
      if (!canvas.isConnected) renderer.forceContextLoss()
    }
  }, [theme])

  return <div ref={containerRef} className="nexus-3d-canvas-wrap" aria-hidden="true">
    <NexusArchitectureFallback />
    <canvas ref={canvasRef} className="nexus-webgl-canvas" />
  </div>
}
