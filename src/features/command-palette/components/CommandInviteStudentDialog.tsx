import { CheckCircle2, LampDesk, Mail, MoveLeft, Send, UserRoundX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StepperSegmentedProgressBar } from '@/components/shared/steppers/StepperSegmentedProgressBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldInput } from '@/components/ui/field-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useCommandInviteStudent } from '../hooks/useCommandInviteStudent'

type CommandInviteStudentDialogProps = {
  classroomId: string | undefined
  onRequestClose?: () => void
  onBack?: () => void
  onInvited?: () => void
}

export function CommandInviteStudentDialog({
  classroomId,
  onRequestClose,
  onBack,
  onInvited,
}: CommandInviteStudentDialogProps) {
  const { t } = useTranslation('features.commandPalette')
  const state = useCommandInviteStudent({ classroomId, onRequestClose, onInvited })

  const steps = Array.from({ length: state.totalSteps }, (_, i) => i + 1)

  const stepLabel = (() => {
    if (state.step === 'email') return t('inviteStudentDialog.steps.enterEmail')
    if (state.step === 'classroom') return t('inviteStudentDialog.steps.pickClassroom')
    return t('inviteStudentDialog.steps.result')
  })()

  const isSuccess = state.result?.kind === 'success'
  const ResultIcon = isSuccess ? CheckCircle2 : UserRoundX
  const resultIconClass = isSuccess ? 'text-emerald-500' : 'text-destructive'

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBack}
              disabled={state.isSubmitting}
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <CardTitle className="text-lg">{t('inviteStudentDialog.title')}</CardTitle>
        </div>
        {state.step !== 'result' ? (
          <Text
            as="p"
            variant="body"
            className="mt-1 text-sm text-muted-foreground"
          >
            {t('inviteStudentDialog.subtitle')}
          </Text>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Segmented progress bar */}
        <div className="flex flex-col gap-1.5">
          <StepperSegmentedProgressBar
            steps={steps}
            value={state.stepNumber}
            progressOnly
          />
          <Text
            as="p"
            variant="small"
            className="text-xs text-muted-foreground"
          >
            {stepLabel}
          </Text>
        </div>

        {/* Step: email */}
        {state.step === 'email' ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              state.advanceFromEmail()
            }}
          >
            <FieldInput
              value={state.email}
              onValueChange={state.setEmail}
              label={t('inviteStudentDialog.fields.emailLabel')}
              placeholder={t('inviteStudentDialog.fields.emailPlaceholder')}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
            />
          </form>
        ) : null}

        {/* Step: classroom picker */}
        {state.step === 'classroom' ? (
          <>
            {state.classroomsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner
                  variant="gray"
                  size="sm"
                  speed={1750}
                />
              </div>
            ) : state.classroomOptions.length === 0 ? (
              <Text
                as="p"
                variant="small"
                className="text-muted-foreground"
              >
                {t('inviteStudentDialog.classroomPicker.empty')}
              </Text>
            ) : (
              <ScrollArea className="h-44 pr-1">
                <div className="flex flex-col gap-1">
                  {state.classroomOptions.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => state.selectClassroom(row.id, row.title)}
                      disabled={state.isSubmitting}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      {state.isSubmitting ? (
                        <Spinner
                          variant="gray"
                          size="xs"
                          speed={1750}
                        />
                      ) : (
                        <LampDesk
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                      <Text
                        as="span"
                        variant="small"
                        className="truncate font-medium"
                      >
                        {row.title}
                      </Text>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        ) : null}

        {/* Step: result */}
        {state.step === 'result' ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <ResultIcon
              className={`size-10 ${resultIconClass}`}
              aria-hidden
            />
            <Text
              as="h3"
              variant="h3"
              className="text-base font-semibold"
            >
              {t(
                isSuccess ? 'inviteStudentDialog.success.title' : 'inviteStudentDialog.error.title',
                { email: state.result?.email ?? '' },
              )}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {isSuccess
                ? t('inviteStudentDialog.success.description')
                : t('inviteStudentDialog.error.description', {
                    message: state.result?.kind === 'error' ? state.result.message : '',
                  })}
            </Text>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-row justify-end gap-3 px-0 pt-2">
        {state.step === 'email' ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={state.handleClose}
            >
              {t('inviteStudentDialog.actions.cancel')}
            </Button>
            <Button
              type="button"
              variant="darkblue"
              onClick={state.advanceFromEmail}
              disabled={!state.canAdvanceFromEmail}
              className="gap-2"
            >
              <Send
                className="size-4 shrink-0"
                aria-hidden
              />
              {state.needsClassroomPicker
                ? t('inviteStudentDialog.actions.next')
                : t('inviteStudentDialog.actions.send')}
            </Button>
          </>
        ) : state.step === 'classroom' ? (
          <Button
            type="button"
            variant="outline"
            onClick={state.handleClose}
            disabled={state.isSubmitting}
          >
            {t('inviteStudentDialog.actions.cancel')}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={state.handleInviteAnother}
              className="gap-2"
            >
              <Mail
                className="size-4 shrink-0"
                aria-hidden
              />
              {t('inviteStudentDialog.actions.inviteAnother')}
            </Button>
            <Button
              type="button"
              variant="darkblue"
              onClick={state.handleClose}
            >
              {t('inviteStudentDialog.actions.done')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
