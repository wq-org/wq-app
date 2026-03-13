import { TitleDescriptionFields } from '@/components/shared/forms'
import { ClearableInput } from '@/components/shared/inputs'
import { OnboardingPage } from '@/features/onboarding'

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="py-20 px-10 bg-gray-50 rounded-2xl">{children}</div>
}
export default function Test() {
  return (
    <div className="min-h-screen flex flex-col gap-10  p-8">
      <Container>
        <ClearableInput />
      </Container>
      <Container>
        <TitleDescriptionFields />
      </Container>
      <OnboardingPage />
    </div>
  )
}
