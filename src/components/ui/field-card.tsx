import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FieldCardProps = {
  children: ReactNode
  className?: string
}

export const FieldCard = ({ children, className }: FieldCardProps) => (
  <div
    className={cn(
      'bg-card text-card-foreground border-border rounded-3xl border px-5 py-4',
      className,
    )}
  >
    {children}
  </div>
)
