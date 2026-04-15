import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from '@/components/ui/number-field'

export function NumberFieldButtonsRight() {
  return (
    <div className="w-full max-w-48">
      <NumberField
        defaultValue={5}
        min={0}
        max={100}
      >
        <NumberFieldScrubArea label="Amount" />
        <NumberFieldGroup className="rounded-xl">
          <NumberFieldInput className="text-left" />
          <NumberFieldDecrement />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  )
}
