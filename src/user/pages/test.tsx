import { TitleDescriptionFields } from '@/components/shared/forms'
import ClearableInput from '@/components/shared/inputs/ClearableInput'
import QuantityStepper from '@/components/shared/inputs/QuantityStepper'
import { useState } from 'react'
export default function Test() {
  const [qty, setQty] = useState(1)
  return (
    <div className="min-h-screen  p-8">
      // Controlled
      <QuantityStepper
        value={qty}
        onChange={setQty}
        min={1}
        max={99}
      />
      // Uncontrolled
      <QuantityStepper
        defaultValue={3}
        min={0}
        max={10}
      />
      <ClearableInput />
      <TitleDescriptionFields />
      <section className="py-10"></section>
    </div>
  )
}
