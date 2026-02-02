import { cn } from '@/lib/utils'

interface SlotsLeftLabelProps {
  current: number
  max: number
  className?: string
}

export default function SlotsLeftLabel({ current, max, className }: SlotsLeftLabelProps) {
  return (
    <span className={cn('text-xs text-gray-500', className)}>
      {max - current}/{max} slots left
    </span>
  )
}
