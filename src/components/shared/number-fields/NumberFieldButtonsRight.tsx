import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from '@/components/ui/number-field'

type NumberFieldButtonsRightProps = {
  defaultValue?: number
  min?: number
  max?: number
  label?: string
}

export function NumberFieldButtonsRight({
  defaultValue = 5,
  min = 0,
  max = 100,
  label = 'Amount',
}: NumberFieldButtonsRightProps) {
  return (
    <div className="w-full max-w-48">
      <NumberField
        defaultValue={defaultValue}
        min={min}
        max={max}
      >
        <NumberFieldScrubArea label={label} />
        <NumberFieldGroup className="rounded-lg">
          <NumberFieldInput className="text-left" />
          <NumberFieldDecrement />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  )
}
