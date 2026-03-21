import { Onboarding } from '@/features/onboarding'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { FieldInput } from '@/components/ui/field-input'
import {
  FieldTextarea,
  type FieldTextareaLengthDetail,
  type FieldTextareaOverLimitDetail,
} from '@/components/ui/field-textarea'
import { toast } from '@/components/ui/sonner'

const Container = ({ children }: { children: ReactNode }) => {
  return <div className="rounded-2xl bg-gray-50 px-10 py-20">{children}</div>
}

const DESCRIPTION_MAX = 500

function handleTestReachMaxLength(detail: FieldTextareaLengthDetail) {
  const { length, maxLength } = detail
  toast.info(`At limit: ${length}/${maxLength}`, {
    description: 'FieldTextarea onReachMaxLength',
  })
  console.info('[FieldTextarea] onReachMaxLength', detail)
}

function handleTestOverMaxLength(detail: FieldTextareaOverLimitDetail) {
  const { length, maxLength, excess } = detail
  toast.warning(`Over by ${excess} (${length}/${maxLength})`, {
    description: 'FieldTextarea onOverMaxLength',
  })
  console.warn('[FieldTextarea] onOverMaxLength', detail)
}

export default function Test() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="flex min-h-screen flex-col gap-10 p-8">
      <Container>
        <FieldInput
          label="Name"
          placeholder="Enter your name"
          value={name}
          onValueChange={setName}
        />

        <FieldTextarea
          value={description}
          onValueChange={setDescription}
          label="Description"
          maxLength={DESCRIPTION_MAX}
          onReachMaxLength={handleTestReachMaxLength}
          onOverMaxLength={handleTestOverMaxLength}
        />
      </Container>
      <Container>
        <Onboarding />
      </Container>
    </div>
  )
}
