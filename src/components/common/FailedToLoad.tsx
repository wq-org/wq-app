import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface FailedToLoadProps {
  message?: string
  className?: string
}

export default function FailedToLoad({
  message = 'Failed to load file',
  className,
}: FailedToLoadProps) {
  return (
    <Badge
      className={cn('text-orange-500 bg-orange-500/10 border-orange-500/20', className)}
      variant="outline"
    >
      {message}
    </Badge>
  )
}
