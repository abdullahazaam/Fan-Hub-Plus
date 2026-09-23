import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface NexusGate3DCanvasProps {
  theme: 'dark' | 'light'
}

export const NexusGate3DCanvas: React.FC<NexusGate3DCanvasProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webGLError, setWebGLError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // Verify WebGL availability
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) {
        setWebGLError(true)
        return
      }
    } catch {
      setWebGLError(true)
      return
    }

    // Motion preference check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 600

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 18)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(width, height)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to static CSS architecture:', err)
      setWebGLError(true)
      return
    }

    // -------------------------------------------------------------
    // STUDIO LIGHTING SETUP (Obsidian + Crimson vs Neoclassical Ivory)
    // -------------------------------------------------------------
    const isDark = theme === 'dark'

    const ambientColor = isDark ? 0x08090c : 0xf7f4ee
    const ambientIntensity = isDark ? 0.6 : 1.2
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity)
    scene.add(ambientLight)

    // Left Studio Crimson Rim Light
    const crimsonRimLeft = new THREE.DirectionalLight(0xe50914, isDark ? 2.5 : 1.4)
    crimsonRimLeft.position.set(-14, 8, 8)
    scene.add(crimsonRimLeft)

    // Right Studio Crimson Rim Light
    const crimsonRimRight = new THREE.DirectionalLight(0xdc2626, isDark ? 2.2 : 1.2)
    crimsonRimRight.position.set(14, 6, 6)
    scene.add(crimsonRimRight)

    // Central Aperture Focus Light
    const aperturePointLight = new THREE.PointLight(0xe50914, isDark ? 2.8 : 1.6, 25)
    aperturePointLight.position.set(4, 0, 2)
    scene.add(aperturePointLight)

    // -------------------------------------------------------------
    // ARCHITECTURAL DEPTH: Flanking Monolith Pylons
    // -------------------------------------------------------------
    const pylonGroup = new THREE.Group()

    const pylonGeo = new THREE.BoxGeometry(1.2, 28, 2.4)
    const pylonMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x111318 : 0xe6e1d6,
      roughness: 0.55,
      metalness: 0.35,
    })

    // Left Colonnade Pylons
    const pylonL1 = new THREE.Mesh(pylonGeo, pylonMat)
    pylonL1.position.set(-11, 0, -4)
    pylonL1.rotation.y = 0.25
    pylonGroup.add(pylonL1)

    const pylonL2 = new THREE.Mesh(pylonGeo, pylonMat)
    pylonL2.position.set(-15, 0, -8)
    pylonL2.rotation.y = 0.35
    pylonGroup.add(pylonL2)

    // Right Colonnade Pylons
    const pylonR1 = new THREE.Mesh(pylonGeo, pylonMat)
    pylonR1.position.set(13, 0, -4)
    pylonR1.rotation.y = -0.25
    pylonGroup.add(pylonR1)

    const pylonR2 = new THREE.Mesh(pylonGeo, pylonMat)
    pylonR2.position.set(17, 0, -8)
    pylonR2.rotation.y = -0.35
    pylonGroup.add(pylonR2)

    scene.add(pylonGroup)

    // -------------------------------------------------------------
    // RECEDING ARCHITECTURAL FLOOR GRID
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(
      48,
      32,
      isDark ? 0xe50914 : 0xdc2626,
      isDark ? 0x242833 : 0xd5cfc2
    )
    gridHelper.position.set(0, -6.5, -4)
    scene.add(gridHelper)

    // -------------------------------------------------------------
    // CONCENTRIC NEXUS GATE ORBITAL ENERGY RINGS
    // Integrated directly with the Nexus Gate center coordinates
    // (offset rightwards to align with .hero-nexus-container)
    // -------------------------------------------------------------
    const gateGroup = new THREE.Group()
    // Offset in X to align with the desktop Nexus Gate focal position
    const gateXOffset = width > 992 ? 3.8 : 0
    gateGroup.position.set(gateXOffset, 0.4, 0)

    // Ring 1: Primary Orbital Aperture Ring
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.045, 16, 100)
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xe50914,
      emissive: 0x991b1b,
      emissiveIntensity: isDark ? 0.75 : 0.4,
      roughness: 0.3,
      metalness: 0.8,
    })
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    gateGroup.add(ring1)

    // Ring 2: Concentric Inner Harmonic Ring
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.035, 16, 80)
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf43f5e : 0xdc2626,
      emissive: 0x881337,
      emissiveIntensity: isDark ? 0.6 : 0.3,
      roughness: 0.4,
      metalness: 0.7,
    })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 6
    gateGroup.add(ring2)

    // Ring 3: Deep Outer Resonance Ring
    const ring3Geo = new THREE.TorusGeometry(4.4, 0.025, 16, 120)
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xef4444 : 0xb91c1c,
      emissive: 0x7f1d1d,
      emissiveIntensity: isDark ? 0.4 : 0.2,
      roughness: 0.5,
      metalness: 0.6,
      transparent: true,
      opacity: 0.65,
    })
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat)
    ring3.rotation.y = Math.PI / 8
    gateGroup.add(ring3)

    scene.add(gateGroup)

    // -------------------------------------------------------------
    // FLOATING ATMOSPHERIC EMBER DUST MOTES (Restrained count: 32)
    // -------------------------------------------------------------
    const dustCount = 32
    const dustGeo = new THREE.BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 24
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))

    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0xff4d5e : 0xdc2626,
      size: 0.12,
      transparent: true,
      opacity: isDark ? 0.55 : 0.35,
      blending: THREE.AdditiveBlending,
    })
    const dustParticles = new THREE.Points(dustGeo, dustMat)
    scene.add(dustParticles)

    // -------------------------------------------------------------
    // INTERACTION & PARALLAX DRIFT
    // -------------------------------------------------------------
    let mouseX = 0
    let mouseY = 0
    let targetCameraX = 0
    let targetCameraY = 0

    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1
      const normY = -(e.clientY / window.innerHeight) * 2 + 1
      mouseX = normX * 0.9
      mouseY = normY * 0.5
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // -------------------------------------------------------------
    // RESIZE LISTENER
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !renderer) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)

      // Adjust gate offset on mobile/desktop
      const offset = w > 992 ? 3.8 : 0
      gateGroup.position.x = offset
    }

    window.addEventListener('resize', handleResize)

    // -------------------------------------------------------------
    // INTERSECTION OBSERVER: PAUSE RENDER LOOP WHEN OFF-SCREEN
    // -------------------------------------------------------------
    let isVisible = true
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // -------------------------------------------------------------
    // ANIMATION RENDER LOOP
    // -------------------------------------------------------------
    let animationFrameId: number
    let lastTime = performance.now()
    const startTime = performance.now()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Pause rendering if off-screen to preserve CPU/GPU
      if (!isVisible) return

      const now = performance.now()
      const delta = Math.min((now - lastTime) * 0.001, 0.1)
      const time = (now - startTime) * 0.001
      lastTime = now

      if (!prefersReducedMotion) {
        // Slow architectural ring rotations
        ring1.rotation.z += delta * 0.22
        ring2.rotation.z -= delta * 0.3
        ring2.rotation.y = Math.sin(time * 0.35) * 0.25 + Math.PI / 6
        ring3.rotation.z += delta * 0.12

        // Slow ember particles drift
        const positions = dustGeo.attributes.position.array as Float32Array
        for (let i = 0; i < dustCount; i++) {
          positions[i * 3 + 1] += delta * 0.25
          if (positions[i * 3 + 1] > 8) {
            positions[i * 3 + 1] = -7
          }
        }
        dustGeo.attributes.position.needsUpdate = true

        // Smooth camera parallax damping
        targetCameraX += (mouseX - targetCameraX) * 0.04
        targetCameraY += (mouseY - targetCameraY) * 0.04
        camera.position.x = targetCameraX
        camera.position.y = targetCameraY
        camera.lookAt(gateGroup.position.x * 0.3, 0, 0)
      } else {
        // Static frame for reduced motion
        camera.position.set(0, 0, 18)
        camera.lookAt(gateGroup.position.x * 0.3, 0, 0)
      }

      renderer.render(scene, camera)
    }

    // Initial render
    renderer.render(scene, camera)

    // Start loop if motion allowed
    if (!prefersReducedMotion) {
      animate()
    }

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', handleResize)

      // Dispose Three.js resources
      pylonGeo.dispose()
      pylonMat.dispose()
      gridHelper.dispose()
      ring1Geo.dispose()
      ring1Mat.dispose()
      ring2Geo.dispose()
      ring2Mat.dispose()
      ring3Geo.dispose()
      ring3Mat.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      renderer.dispose()
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      className={`nexus-3d-canvas-wrap ${theme} ${webGLError ? 'has-fallback' : ''}`}
      aria-hidden="true"
    >
      {!webGLError ? (
        <canvas ref={canvasRef} className="nexus-webgl-canvas" />
      ) : (
        <div className="nexus-3d-css-fallback">
          <div className="fallback-pylon fallback-pylon-left" />
          <div className="fallback-pylon fallback-pylon-right" />
          <div className="fallback-floor-grid" />
          <div className="fallback-aperture-glow" />
        </div>
      )}
    </div>
  )
}
