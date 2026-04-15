import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export type SliderReferenceLabelsProps = {
  label?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  referenceLabels?: readonly string[]
  className?: string
}

export function SliderReferenceLabels({
  label = 'Storage',
  value,
  onValueChange,
  min = 5,
  max = 35,
  step = 1,
  referenceLabels,
  className,
}: SliderReferenceLabelsProps) {
  const labels = referenceLabels ?? [`${min} GB`, `${Math.round((min + max) / 2)} GB`, `${max} GB`]

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
        className="text-muted-foreground flex w-full items-center justify-between text-xs font-medium"
      >
        {labels.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </span>
    </div>
  )
}
