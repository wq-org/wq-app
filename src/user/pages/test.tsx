import { Onboarding } from '@/features/onboarding/pages/onboarding'
import type { ReactNode } from 'react'

const Container = ({ children }: { children: ReactNode }) => {
  return <div className="py-20 px-10 bg-gray-50 rounded-2xl">{children}</div>
}
export default function Test() {
  return (
    <div className="min-h-screen flex flex-col gap-10  p-8">
      <Container>
        <Onboarding />
      </Container>
    </div>
  )
}
