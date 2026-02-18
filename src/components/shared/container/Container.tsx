import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  children: React.ReactNode
  className?: string
}

export default function Container({
  as: Component = 'section',
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn('container mx-auto max-w-7xl px-14 py-8', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
