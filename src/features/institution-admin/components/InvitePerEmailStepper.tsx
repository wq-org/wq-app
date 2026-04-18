import { useMemo, useState } from 'react'
import { MoveLeft, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StepperProgressBarTitles } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'

import { parseBulkEmailTokens } from '../utils'

export type InvitePerEmailStepperProps = {
  onExit: () => void
}

export function InvitePerEmailStepper({ onExit }: InvitePerEmailStepperProps) {
  const { t } = useTranslation('features.institution-admin')
  const [activeStep, setActiveStep] = useState(1)
  const [emailBulkText, setEmailBulkText] = useState('')

  const detectedEmails = useMemo(() => parseBulkEmailTokens(emailBulkText), [emailBulkText])

  const wizardSteps = useMemo(
    () => [
      { title: t('inviteUsers.emailWizard.steps.enterAddresses') },
      { title: t('inviteUsers.emailWizard.steps.reviewRecipients') },
    ],
    [t],
  )

  function handleGoToReviewStep() {
    setActiveStep(2)
  }

  function handleBackToAddressStep() {
    setActiveStep(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="ghost"
        className="w-fit px-0 text-muted-foreground hover:text-foreground"
        onClick={onExit}
      >
        <MoveLeft />
        {t('inviteUsers.emailWizard.changeMethod')}
      </Button>

      <StepperProgressBarTitles
        steps={wizardSteps}
        value={activeStep}
        defaultValue={1}
        onValueChange={setActiveStep}
        colorVariant="orange"
        className="max-w-3xl space-y-8"
        renderContent={(_, index) => {
          if (index === 0) {
            const hasEmails = detectedEmails.length > 0

            return (
              <div className="flex w-full flex-col gap-6">
                <div className="space-y-2">
                  <Text
                    variant="h3"
                    as="h2"
                    className="font-semibold text-foreground"
                  >
                    {t('inviteUsers.emailWizard.sectionTitle')}
                  </Text>
                  <Text
                    variant="small"
                    className="text-muted-foreground"
                  >
                    {t('inviteUsers.emailWizard.separatorHint')}
                  </Text>
                </div>

                <FieldTextarea
                  label={t('inviteUsers.emailWizard.textareaLabel')}
                  placeholder={t('inviteUsers.emailWizard.textareaPlaceholder')}
                  value={emailBulkText}
                  onValueChange={setEmailBulkText}
                  rows={8}
                  className="pb-0"
                />

                <div className="flex justify-end border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="darkblue"
                    disabled={!hasEmails}
                    onClick={handleGoToReviewStep}
                  >
                    {t('inviteUsers.emailWizard.nextButton')}
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div className="flex w-full flex-col gap-6">
              <Card className="gap-0 py-5 shadow-sm">
                <CardHeader className="gap-1 px-6 pb-4 pt-0">
                  <CardTitle className="text-lg">
                    {t('inviteUsers.emailWizard.reviewCardTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-6 pb-6">
                  {detectedEmails.map((email) => (
                    <Text
                      key={email}
                      variant="body"
                      className="break-all text-foreground"
                    >
                      {email}
                    </Text>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToAddressStep}
                >
                  {t('inviteUsers.emailWizard.backButton')}
                </Button>
                <Button
                  type="button"
                  variant="darkblue"
                >
                  <Send
                    className="size-4 shrink-0"
                    aria-hidden
                  />
                  {t('inviteUsers.emailWizard.sendButton')}
                </Button>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
