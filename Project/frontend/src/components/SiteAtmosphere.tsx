import React from 'react'

interface SiteAtmosphereProps {
  theme: 'dark' | 'light'
}

const SiteAtmosphereComponent: React.FC<SiteAtmosphereProps> = ({ theme }) => {
  return (
    <div className={`site-atmosphere-layer theme-${theme}`} aria-hidden="true">
      {theme === 'dark' ? (
        /* Single Global Dark Mode Background: /background.png with ~15% dark overlay */
        <div className="atmosphere-global-dark-bg" />
      ) : (
        /* Single Global Light Mode Background: /background.png with warm ivory translucent overlay */
        <div className="atmosphere-global-light-bg" />
      )}
    </div>
  )
}

export const SiteAtmosphere = React.memo(SiteAtmosphereComponent)

