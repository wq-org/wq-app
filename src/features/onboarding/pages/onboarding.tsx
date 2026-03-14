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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardPathForRole, type UserRole } from '@/features/auth/'
import { StepAccount } from '../components/StepAccount'
import { StepAvatar } from '../components/StepAvatar'
import { StepInstitution } from '../components/StepInstitution'
import { StepFinish } from '../components/StepFinish'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import type {
  AccountData,
  AccountDetailsData,
  AvatarOption,
  Institution,
} from '../types/onboarding.types'
import { AppNavigation } from '@/components/layout'
import { useTranslation } from 'react-i18next'

export default function Onboarding() {
  const navigate = useNavigate()
  const { pendingRole, profile } = useUser()
  const { t } = useTranslation('features.onboarding')
  const [step, setStep] = useState(1)
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [institutions, setInstitutions] = useState<Institution[]>([])

  const accountData = useMemo<AccountData | null>(() => {
    if (!accountDetails || !selectedAvatar) {
      return null
    }

    return {
      ...accountDetails,
      avatar: selectedAvatar,
    }
  }, [accountDetails, selectedAvatar])

  const handleStepChange = (nextStep: number) => {
    setStep((prev) => (nextStep <= prev ? nextStep : prev))
  }

  const handleAccountNext = (data: AccountDetailsData) => {
    setAccountDetails(data)
    setStep(2)
  }

  const handleAvatarNext = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar)
    setStep(3)
  }

  const handleInstitutionNext = (selectedInstitutions: Institution[]) => {
    setInstitutions(selectedInstitutions)
    setStep(4)
  }

  const handleFinish = () => {
    const role = profile?.role || pendingRole
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
      <AppNavigation />
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
                <StepperTitle>{t('steps.account.title')}</StepperTitle>
                <StepperDescription>{t('steps.account.description')}</StepperDescription>
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
                <StepperTitle>{t('steps.avatar.title')}</StepperTitle>
                <StepperDescription>{t('steps.avatar.description')}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
          <StepperSeparator />
          <StepperItem step={3}>
            <StepperTrigger onClick={() => step > 3 && setStep(3)}>
              <StepperIndicator>
                {step > 3 ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <Text
                    as="span"
                    variant="small"
                  >
                    3
                  </Text>
                )}
              </StepperIndicator>
              <div>
                <StepperTitle>{t('steps.institution.title')}</StepperTitle>
                <StepperDescription>{t('steps.institution.description')}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
          <StepperSeparator />
          <StepperItem step={4}>
            <StepperTrigger onClick={() => step > 4 && setStep(4)}>
              <StepperIndicator>
                <Text
                  as="span"
                  variant="small"
                >
                  4
                </Text>
              </StepperIndicator>
              <div>
                <StepperTitle>{t('steps.finish.title')}</StepperTitle>
                <StepperDescription>{t('steps.finish.description')}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
        <div className="mt-8 w-full max-w-xl">
          {step === 1 && (
            <StepAccount
              onNext={handleAccountNext}
              initialData={accountDetails || undefined}
            />
          )}
          {step === 2 && (
            <StepAvatar
              onNext={handleAvatarNext}
              onBack={() => setStep(1)}
              initialAvatarSrc={selectedAvatar?.src}
            />
          )}
          {step === 3 && (
            <StepInstitution
              onNext={handleInstitutionNext}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && accountData && (
            <StepFinish
              onBack={() => setStep(3)}
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
