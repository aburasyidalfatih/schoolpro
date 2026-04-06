import React from 'react'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`card ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`card-header ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3 ref={ref} className={`card-title ${className}`} {...props}>
        {children}
      </h3>
    )
  }
)
CardTitle.displayName = 'CardTitle'

export const CardBody = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }
)
CardBody.displayName = 'CardBody'

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-3 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
CardFooter.displayName = 'CardFooter'
