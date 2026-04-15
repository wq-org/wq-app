import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const defaultEmojis = ['😡', '🙁', '😐', '🙂', '😍'] as const
const defaultRatingLabels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'] as const

export type RatingSliderEmojiFeedbackProps = {
  label?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  emojis?: readonly string[]
  ratingLabels?: readonly string[]
  className?: string
}

export function RatingSliderEmojiFeedback({
  label = 'Rate your experience',
  value,
  onValueChange,
  min = 1,
  max = 5,
  step = 1,
  emojis = defaultEmojis,
  ratingLabels = defaultRatingLabels,
  className,
}: RatingSliderEmojiFeedbackProps) {
  const clampedValue = Math.min(Math.max(value, min), max)
  const currentIndex = clampedValue - min
  const currentEmoji = emojis[currentIndex] ?? '🙂'
  const currentLabel = ratingLabels[currentIndex] ?? 'Good'

  return (
    <div className={cn('mx-auto grid w-full max-w-sm gap-3', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <Slider
          value={[clampedValue]}
          onValueChange={(nextValue) => onValueChange(nextValue[0] ?? clampedValue)}
          min={min}
          max={max}
          step={step}
        />
        <span
          className="text-2xl"
          aria-hidden="true"
        >
          {currentEmoji}
        </span>
      </div>
      <span className="text-muted-foreground text-center text-xs font-medium">{currentLabel}</span>
    </div>
  )
}
