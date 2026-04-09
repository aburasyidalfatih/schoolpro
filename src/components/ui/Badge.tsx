import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'gray', children, ...props }, ref) => {
    const variantClass = `badge-${variant}`
    
    return (
      <span ref={ref} className={`badge ${variantClass} ${className}`} {...props}>
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'
