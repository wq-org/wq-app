import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tick, Ticks } from '@/components/ui/tick'
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
  const tickItems = ticks.map((tick) => ({
    tick,
    isMinorTick: (tick - min) % skipInterval !== 0,
  }))

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
      <Ticks>
        {tickItems.map(({ tick, isMinorTick }) => (
          <Tick
            key={tick}
            minor={isMinorTick}
            hideLabel={isMinorTick}
          >
            {tick}
          </Tick>
        ))}
      </Ticks>
    </div>
  )
}
