import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

interface SlotsLeftLabelProps {
  current: number
  max: number
  className?: string
}

export default function SlotsLeftLabel({ current, max, className }: SlotsLeftLabelProps) {
  return (
    <Text
      as="span"
      variant="small"
      className={cn('text-xs text-gray-500', className)}
    >
      {max - current}/{max} slots left
    </Text>
  )
}
