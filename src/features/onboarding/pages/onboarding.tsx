import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { StepperContentEachStep } from '@/components/shared'
import { AppNavigation } from '@/components/layout'
import { getDashboardPathForRole, type UserRole } from '@/features/auth/'
import { logRoleDebug } from '@/features/auth/utils/roleDebugLog'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'

import { StepAccount } from '../components/StepAccount'
import { StepAvatar } from '../components/StepAvatar'
import { StepFinish } from '../components/StepFinish'
import type { AccountData, AccountDetailsData, AvatarOption } from '../types/onboarding.types'

const Onboarding = () => {
  const navigate = useNavigate()
  const { profile } = useUser()
  const { t } = useTranslation('features.onboarding')
  const [step, setStep] = useState(1)
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)

  const accountData = useMemo<AccountData | null>(() => {
    if (!accountDetails || !selectedAvatar) {
      return null
    }

    return {
      ...accountDetails,
      avatar: selectedAvatar,
    }
  }, [accountDetails, selectedAvatar])

  const stepperSteps = useMemo(
    () => [
      {
        title: t('steps.account.title'),
        description: t('steps.account.description'),
      },
      {
        title: t('steps.avatar.title'),
        description: t('steps.avatar.description'),
      },
      {
        title: t('steps.finish.title'),
        description: t('steps.finish.description'),
      },
    ],
    [t],
  )

  useEffect(() => {
    logRoleDebug('onboarding snapshot', {
      step,
      profileRole: profile?.role ?? null,
      is_onboarded: profile?.is_onboarded ?? null,
    })
  }, [step, profile?.role, profile?.is_onboarded])

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

  const handleFinish = () => {
    const role = profile?.role?.trim() ?? ''
    logRoleDebug('onboarding handleFinish (SuccessPage onClick fallback)', {
      profileRole: role || '(none)',
      navigateTo: role ? getDashboardPathForRole(role as UserRole) : null,
    })
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
      <div className="flex min-h-screen flex-col px-4 py-12">
        <StepperContentEachStep
          steps={stepperSteps}
          value={step}
          defaultValue={1}
          onValueChange={handleStepChange}
          className="mx-auto w-full max-w-2xl space-y-10"
          renderContent={(_, index) => (
            <div className="w-full pt-2">
              {index === 0 ? (
                <StepAccount
                  onNext={handleAccountNext}
                  initialData={accountDetails || undefined}
                />
              ) : null}
              {index === 1 ? (
                <StepAvatar
                  onNext={handleAvatarNext}
                  onBack={() => setStep(1)}
                  initialAvatarSrc={selectedAvatar?.src}
                />
              ) : null}
              {index === 2 && accountData ? (
                <StepFinish
                  onBack={() => setStep(2)}
                  onFinish={handleFinish}
                  accountData={accountData}
                />
              ) : null}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export { Onboarding }
