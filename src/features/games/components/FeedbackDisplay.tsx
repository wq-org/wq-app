import { cn } from '@/lib/utils'

interface FeedbackDisplayProps {
  feedback: string | undefined
  variant?: 'correct' | 'wrong'
  className?: string
}

export default function FeedbackDisplay({
  feedback,
  variant,
  className,
}: FeedbackDisplayProps) {
  if (feedback === undefined || feedback.trim() === '') {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 text-sm min-h-[2.5rem]',
        variant === 'wrong' && 'border-orange-100 bg-orange-50/40 text-orange-800',
        variant === 'correct' && 'border-black/20 bg-black/5 text-black',
        !variant && 'border-border bg-muted/30 text-muted-foreground',
        className,
      )}
    >
      {feedback}
    </div>
  )
}
