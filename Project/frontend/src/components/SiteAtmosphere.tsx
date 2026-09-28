import React from 'react'

interface SiteAtmosphereProps {
  theme: 'dark' | 'light'
}

const SiteAtmosphereComponent: React.FC<SiteAtmosphereProps> = ({ theme }) => {
  return (
    <div className={`site-atmosphere-layer theme-${theme}`} aria-hidden="true">
      <div className="atmosphere-global-dark-bg" />
      <div className="atmosphere-global-light-bg" />
    </div>
  )
}

export const SiteAtmosphere = React.memo(SiteAtmosphereComponent)

