import React from 'react'

interface SiteAtmosphereProps {
  theme: 'dark' | 'light'
}

export const SiteAtmosphere: React.FC<SiteAtmosphereProps> = ({ theme }) => {
  return (
    <div className={`site-atmosphere-layer theme-${theme}`} aria-hidden="true">
      {/* Studio Ceiling Crimson Rim Light */}
      <div className="atmosphere-ceiling-glow" />

      {/* Subtle Studio Atmospheric Haze */}
      <div className="atmosphere-ambient-haze haze-primary" />
      <div className="atmosphere-ambient-haze haze-secondary" />

      {/* Fine Architectural Grid (Fading Downwards) */}
      <div className="atmosphere-grid-floor" />

      {/* Restrained Side Studio Accent */}
      <div className="atmosphere-side-rim" />
    </div>
  )
}
