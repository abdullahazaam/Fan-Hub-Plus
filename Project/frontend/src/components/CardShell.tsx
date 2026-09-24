import React from 'react'

interface CardShellProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverEffect?: boolean
}

export const CardShell: React.FC<CardShellProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}) => {
  return (
    <div
      className={`card-shell ${hoverEffect ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
      <div className="card-shell-border" aria-hidden="true" />
    </div>
  )
}
