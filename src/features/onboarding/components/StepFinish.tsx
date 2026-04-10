import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { upsertProfile, updateProfile } from '@/features/auth'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { SuccessPage } from './SuccessPage'
import type { StepFinishProps } from '../types/onboarding.types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { BlurredImage } from '@/components/ui/blurred-image'

export function StepFinish({ onBack, onFinish, accountData }: StepFinishProps) {
  const { session, pendingRole, profile, setPendingRole, refreshProfile } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { t } = useTranslation('features.onboarding')

  // Generate signed URL for displaying avatar (accountData.avatar.src is just the path)
  const { url: signedAvatarUrl } = useAvatarUrl(accountData.avatar.src)

  const handleFinish = async () => {
    if (!session?.user) {
      console.error('No authenticated user found')
      return
    }

    setIsSubmitting(true)

    const trimmedPending = pendingRole?.trim() ?? ''
    const trimmedProfileRole = profile?.role?.trim() ?? ''
    const onboardingRole = trimmedPending || trimmedProfileRole

    if (!onboardingRole) {
      setIsSubmitting(false)
      // Show error or prevent submission if role is not selected using the sonner toast
      toast.error(t('finish.errors.missingRole'))
      return
    }

    // Keep role in context/sessionStorage for the final navigation step.
    setPendingRole(onboardingRole)

    try {
      // Persist profile data and mark onboarding as complete.
      await upsertProfile(session.user.id, {
        email: session.user.email,
        username: accountData.username,
        description: accountData.description,
        display_name: accountData.displayName,
        avatar_url: accountData.avatar.src,
        role: onboardingRole,
        is_onboarded: false,
      })

      await updateProfile(session.user.id, { is_onboarded: true })

      // Refresh profile to get the updated is_onboarded status
      await refreshProfile()

      // Small delay to ensure context state is updated before navigation
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Show success dialog which will trigger confetti
      setShowSuccess(true)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsSubmitting(false)
      toast.error(t('finish.errors.completionTitle'), {
        description: t('finish.errors.completionDescription'),
      })
    }
  }

  return (
    <>
      <SuccessPage
        isOpen={showSuccess}
        title={t('finish.successDialog.title')}
        description={t('finish.successDialog.description')}
        onClickHandler={onFinish}
      />

      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Text
            as="h2"
            variant="h2"
            className="text-3xl font-light mb-2"
          >
            {t('finish.header.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground text-sm"
          >
            {t('finish.header.subtitle')}
          </Text>
        </div>

        {/* Summary Card */}
        <Card className="rounded-4xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="size-20 overflow-hidden rounded-3xl">
                <BlurredImage
                  src={signedAvatarUrl || accountData.avatar.src}
                  alt={accountData.avatar.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{accountData.displayName}</CardTitle>
                  <Text
                    as="span"
                    variant="small"
                    className="text-xl"
                  >
                    {accountData.avatar.emoji}
                  </Text>
                </div>
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground"
                >
                  @{accountData.username}
                </Text>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {/* Description */}
            <div>
              <Text
                as="h3"
                variant="h3"
                className="font-semibold mb-2"
              >
                {t('finish.about.title')}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-muted-foreground text-sm"
              >
                {accountData.description}
              </Text>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground mb-1"
                >
                  Username
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="font-medium"
                >
                  @{accountData.username}
                </Text>
              </div>
              <div>
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground mb-1"
                >
                  Display Name
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="font-medium"
                >
                  {accountData.displayName}
                </Text>
              </div>
              <div className="col-span-2">
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground mb-1"
                >
                  Avatar
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="font-medium"
                >
                  {accountData.avatar.name} {accountData.avatar.emoji}
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 py-11">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleFinish}
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Finish Setup 🎉'}
          </Button>
        </div>
      </div>
    </>
  )
}
