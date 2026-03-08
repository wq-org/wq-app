import { TitleDescriptionFields } from '@/components/shared/forms'
import ClearableInput from '@/components/shared/inputs/ClearableInput'
export default function Test() {
  return (
    <div className="min-h-screen  p-8">
      <ClearableInput />
      <TitleDescriptionFields />
      <section className="py-10"></section>
    </div>
  )
}
