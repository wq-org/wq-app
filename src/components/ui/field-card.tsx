// components/ui/field-card.tsx
import { cn } from '@/lib/utils'

type FieldCardProps = {
  children: React.ReactNode
  className?: string
}

export const FieldCard = ({ children, className }: FieldCardProps) => (
  <div className={cn('bg-white px-5 py-4 border-neutral-200 border rounded-3xl', className)}>
    {children}
  </div>
)
