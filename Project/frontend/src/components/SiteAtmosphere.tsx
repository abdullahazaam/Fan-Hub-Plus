import React, { useEffect, useRef, useState } from 'react'

interface SiteAtmosphereProps {
  theme: 'dark' | 'light'
}

export const SiteAtmosphere: React.FC<SiteAtmosphereProps> = ({ theme }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Listen for prefers-reduced-motion system setting
  useEffect(() => {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Video playback lifecycle: only play in dark mode, when document is visible, and motion is allowed
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updatePlayback = () => {
      if (theme === 'dark' && !reducedMotion && !document.hidden) {
        video.play().catch(() => {
          // Autoplay policy or interruption handling
        })
      } else {
        video.pause()
      }
    }

    updatePlayback()

    const handleVisibilityChange = () => {
      updatePlayback()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [theme, reducedMotion])

  return (
    <div className={`site-atmosphere-layer theme-${theme}`} aria-hidden="true">
      {/* Global Cinematic Background Video — approved /background.mp4, dark mode only */}
      {theme === 'dark' && (
        <div className={`atmosphere-video-container ${reducedMotion ? 'is-reduced-motion' : ''}`}>
          <video
            ref={videoRef}
            className="atmosphere-video"
            src="/background.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
          {/* Static fallback when prefers-reduced-motion is active */}
          <div className="atmosphere-video-fallback" />
        </div>
      )}

      {/* Soft screen-edge vignette only — does NOT cover the center of the video */}
      <div className="atmosphere-edge-vignette" />

      {/* Subtle top crimson glow — dark mode only */}
      {theme === 'dark' && <div className="atmosphere-ceiling-glow" />}
    </div>
  )
}
