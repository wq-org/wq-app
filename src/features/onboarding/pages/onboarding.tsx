import { Text } from '@/components/ui/text'
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from '@/components/ui/stepper'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardPathForRole, type UserRole } from '@/features/auth/types/auth.types'
import StepAccount from '../components/StepAccount'
import StepInstitution from '../components/StepInstitution'
import StepFinish from '../components/StepFinish'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import type { AccountData, Institution } from '../types/onboarding.types'
import { Navigation } from '@/components/shared'
import { PageTitle } from '@/components/layout/PageTitle'

export default function Onboarding() {
  const navigate = useNavigate()
  const { pendingRole } = useUser()
  const [step, setStep] = useState(1)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const handleStepChange = (nextStep: number) => {
    setStep((prev) => (nextStep <= prev ? nextStep : prev))
  }

  const handleAccountNext = (data: AccountData) => {
    setAccountData(data)
    setStep(2)
  }

  const handleInstitutionNext = (selectedInstitutions: Institution[]) => {
    setInstitutions(selectedInstitutions)
    setStep(3)
  }

  const handleFinish = () => {
    const role = pendingRole
    if (!role) {
      toast.error('Something went wrong', {
        description:
          'Your account is missing a role. Please refresh the page. If this keeps happening, contact support.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      })
    } else {
      navigate(getDashboardPathForRole(role as UserRole))
    }
  }

  return (
    <div>
      <Navigation>
        <PageTitle />
      </Navigation>
      <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
        <Stepper
          value={step}
          onValueChange={handleStepChange}
          className="w-full max-w-2xl mb-8"
        >
          <StepperItem step={1}>
            <StepperTrigger onClick={() => step > 1 && setStep(1)}>
              <StepperIndicator>
                {step > 1 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <Text
                    as="span"
                    variant="small"
                  >
                    1
                  </Text>
                )}
              </StepperIndicator>
              <div>
                <StepperTitle>Account</StepperTitle>
                <StepperDescription>Create your account</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
          <StepperSeparator />
          <StepperItem step={2}>
            <StepperTrigger onClick={() => step > 2 && setStep(2)}>
              <StepperIndicator>
                {step > 2 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <Text
                    as="span"
                    variant="small"
                  >
                    2
                  </Text>
                )}
              </StepperIndicator>
              <div>
                <StepperTitle>Institution</StepperTitle>
                <StepperDescription>Follow institutions</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
          <StepperSeparator />
          <StepperItem step={3}>
            <StepperTrigger onClick={() => step > 3 && setStep(3)}>
              <StepperIndicator>
                <Text
                  as="span"
                  variant="small"
                >
                  3
                </Text>
              </StepperIndicator>
              <div>
                <StepperTitle>Finish</StepperTitle>
                <StepperDescription>Complete onboarding</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
        <div className="mt-8 w-full max-w-xl">
          {step === 1 && <StepAccount onNext={handleAccountNext} />}
          {step === 2 && (
            <StepInstitution
              onNext={handleInstitutionNext}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && accountData && (
            <StepFinish
              onBack={() => setStep(2)}
              onFinish={handleFinish}
              accountData={accountData}
              institutions={institutions}
            />
          )}
        </div>
      </div>
    </div>
  )
}
