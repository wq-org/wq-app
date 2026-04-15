import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export type SliderSyncedNumberInputProps = {
  label?: string
  inputId?: string
  suffix?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function SliderSyncedNumberInput({
  label = 'Opacity',
  inputId = 'slider-synced-number-input',
  suffix = '%',
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderSyncedNumberInputProps) {
  const handleInputChange = (rawValue: string) => {
    const nextValue = Number(rawValue)
    if (Number.isNaN(nextValue)) return
    if (nextValue < min || nextValue > max) return
    onValueChange(nextValue)
  }

  return (
    <div className={cn('mx-auto grid w-full max-w-sm gap-4', className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium"
        >
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={inputId}
            type="number"
            value={value}
            onChange={(event) => handleInputChange(event.target.value)}
            min={min}
            max={max}
            step={step}
            className="h-8 w-16 text-center text-sm tabular-nums"
          />
          <span className="text-muted-foreground text-xs">{suffix}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(nextValue) => onValueChange(nextValue[0] ?? value)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}
