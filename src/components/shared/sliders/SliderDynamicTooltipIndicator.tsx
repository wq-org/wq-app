import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export type SliderDynamicTooltipIndicatorProps = {
  label?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  formatTooltipValue?: (value: number) => string
  className?: string
}

export function SliderDynamicTooltipIndicator({
  label = 'Volume',
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatTooltipValue = (currentValue) => `${currentValue}%`,
  className,
}: SliderDynamicTooltipIndicatorProps) {
  const range = Math.max(max - min, 1)
  const percentage = ((value - min) / range) * 100

  return (
    <div className={cn('mx-auto grid w-full max-w-sm gap-4', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative pt-7">
        <div
          className="bg-foreground text-background absolute top-0 rounded px-2 py-0.5 text-xs font-semibold tabular-nums"
          style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {formatTooltipValue(value)}
          <div className="bg-foreground absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45" />
        </div>
        <Slider
          value={[value]}
          onValueChange={(nextValue) => onValueChange(nextValue[0] ?? value)}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  )
}
