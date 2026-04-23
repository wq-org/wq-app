import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export type SliderTickMarksProps = {
  label?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  skipInterval?: number
  className?: string
}

export function SliderTickMarks({
  label = 'Duration (months)',
  value,
  onValueChange,
  min = 0,
  max = 12,
  step = 1,
  skipInterval = 2,
  className,
}: SliderTickMarksProps) {
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className={cn('mx-auto grid w-full max-w-sm gap-4', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={(nextValue) => onValueChange(nextValue[0] ?? value)}
        min={min}
        max={max}
        step={step}
      />
      <span
        aria-hidden="true"
        className="text-muted-foreground flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium"
      >
        {ticks.map((tick) => (
          <span
            key={tick}
            className="flex w-0 flex-col items-center justify-center gap-2"
          >
            <span
              className={cn(
                'bg-muted-foreground/70 h-1 w-px',
                (tick - min) % skipInterval !== 0 && 'h-0.5',
              )}
            />
            <span className={cn((tick - min) % skipInterval !== 0 && 'opacity-0')}>{tick}</span>
          </span>
        ))}
      </span>
    </div>
  )
}
