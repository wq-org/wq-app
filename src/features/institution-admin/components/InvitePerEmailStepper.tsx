import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { GraduationCap, Mail, MoveLeft, Send, UserRoundX, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { SelectTabs, StepperProgressBarTitles, type TabItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'

import { useUser } from '@/contexts/user'

import {
  sendBulkTeacherStudentInvites,
  type BulkInviteItem,
} from '../api/institutionUserInvitesApi'
import { parseBulkEmailTokens } from '../utils'

type InviteEmailRoleTabId = 'teacher' | 'student'

function isInviteEmailRoleTabId(tabId: string): tabId is InviteEmailRoleTabId {
  return tabId === 'teacher' || tabId === 'student'
}

export type InvitePerEmailStepperProps = {
  onExit: () => void
}

export function InvitePerEmailStepper({ onExit }: InvitePerEmailStepperProps) {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { profile } = useUser()

  const institutionId = profile?.institution?.id ?? null
  const institutionName = profile?.institution?.name ?? null

  const [activeStep, setActiveStep] = useState(1)
  const [inviteRoleTabId, setInviteRoleTabId] = useState<InviteEmailRoleTabId>('teacher')
  const [teacherEmailBulkText, setTeacherEmailBulkText] = useState('')
  const [studentEmailBulkText, setStudentEmailBulkText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [failedInvites, setFailedInvites] = useState<{ email: string; message: string }[]>([])
  const confettiDoneRef = useRef(false)

  const teacherEmails = useMemo(
    () => parseBulkEmailTokens(teacherEmailBulkText),
    [teacherEmailBulkText],
  )
  const studentEmails = useMemo(
    () => parseBulkEmailTokens(studentEmailBulkText),
    [studentEmailBulkText],
  )

  const invitePayload = useMemo((): readonly BulkInviteItem[] => {
    const teachers = teacherEmails.map((email) => ({
      email,
      role: 'teacher' as const,
    }))
    const students = studentEmails.map((email) => ({
      email,
      role: 'student' as const,
    }))
    return [...teachers, ...students]
  }, [teacherEmails, studentEmails])

  const wizardSteps = useMemo(
    () => [
      { title: t('inviteUsers.emailWizard.steps.enterAddresses') },
      { title: t('inviteUsers.emailWizard.steps.reviewRecipients') },
      { title: t('inviteUsers.emailWizard.steps.success') },
    ],
    [t],
  )

  const inviteRoleTabs = useMemo(
    (): readonly TabItem[] => [
      { id: 'teacher', icon: GraduationCap, title: t('users.roles.teacher') },
      { id: 'student', icon: Users, title: t('users.roles.student') },
    ],
    [t],
  )

  useEffect(() => {
    if (activeStep !== 3 || confettiDoneRef.current) return
    confettiDoneRef.current = true
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [activeStep])

  function handleInviteRoleTabChange(tabId: string) {
    if (isInviteEmailRoleTabId(tabId)) setInviteRoleTabId(tabId)
  }

  function handleGoToReviewStep() {
    setFailedInvites([])
    setActiveStep(2)
  }

  function handleBackToAddressStep() {
    setFailedInvites([])
    setActiveStep(1)
  }

  async function handleSend(subset: readonly BulkInviteItem[]) {
    if (!institutionId || subset.length === 0) return

    setIsSending(true)
    setFailedInvites([])
    try {
      const result = await sendBulkTeacherStudentInvites({
        institutionId,
        institutionName,
        items: subset,
      })
      if (result.failed.length === 0) {
        setActiveStep(3)
      } else {
        setFailedInvites(result.failed)
      }
    } finally {
      setIsSending(false)
    }
  }

  async function handleSendAllFromReview() {
    await handleSend(invitePayload)
  }

  async function handleRetryFailedOnly() {
    const failedEmails = new Set(failedInvites.map((f) => f.email))
    const subset = invitePayload.filter((item) => failedEmails.has(item.email))
    await handleSend(subset)
  }

  const hasAnyEmails = teacherEmails.length > 0 || studentEmails.length > 0
  const disableSend = !institutionId || invitePayload.length === 0 || isSending

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="ghost"
        className="w-fit px-0 text-muted-foreground hover:text-foreground"
        onClick={onExit}
      >
        <MoveLeft
          className="mr-2 size-4 shrink-0"
          aria-hidden
        />
        {t('inviteUsers.emailWizard.changeMethod')}
      </Button>

      <StepperProgressBarTitles
        steps={wizardSteps}
        value={activeStep}
        defaultValue={1}
        onValueChange={setActiveStep}
        colorVariant="default"
        className="max-w-3xl space-y-8"
        renderContent={(_, index) => {
          if (index === 0) {
            return (
              <div className="flex w-full flex-col gap-6">
                <Text
                  variant="small"
                  className="text-muted-foreground"
                >
                  {t('inviteUsers.emailWizard.separatorHint')}
                </Text>

                <SelectTabs
                  tabs={inviteRoleTabs}
                  activeTabId={inviteRoleTabId}
                  onTabChange={handleInviteRoleTabChange}
                />

                {inviteRoleTabId === 'teacher' ? (
                  <FieldTextarea
                    key="invite-teacher-emails"
                    label={t('inviteUsers.emailWizard.teachersEmailsLabel')}
                    placeholder={t('inviteUsers.emailWizard.teachersPlaceholder')}
                    value={teacherEmailBulkText}
                    onValueChange={setTeacherEmailBulkText}
                    rows={8}
                    className="pb-0"
                  />
                ) : (
                  <FieldTextarea
                    key="invite-student-emails"
                    label={t('inviteUsers.emailWizard.studentsEmailsLabel')}
                    placeholder={t('inviteUsers.emailWizard.studentsPlaceholder')}
                    value={studentEmailBulkText}
                    onValueChange={setStudentEmailBulkText}
                    rows={8}
                    className="pb-0"
                  />
                )}

                <div className="flex justify-end border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="darkblue"
                    disabled={!hasAnyEmails}
                    onClick={handleGoToReviewStep}
                  >
                    {t('inviteUsers.emailWizard.nextButton')}
                  </Button>
                </div>
              </div>
            )
          }

          if (index === 1) {
            return (
              <div className="flex w-full flex-col gap-6">
                {failedInvites.length > 0 ? (
                  <Card className="border-destructive/40 bg-destructive/5">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                      <UserRoundX
                        className="size-10 shrink-0 text-destructive"
                        aria-hidden
                      />
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-destructive">
                          {t('inviteUsers.emailWizard.errorTitle')}
                        </CardTitle>
                        <Text
                          variant="small"
                          className="text-muted-foreground"
                        >
                          {t('inviteUsers.emailWizard.errorDescription')}
                        </Text>
                        <ul className="list-inside list-disc text-sm text-foreground">
                          {failedInvites.map((f) => (
                            <li key={f.email}>
                              <span className="font-medium">{f.email}</span> — {f.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardHeader>
                  </Card>
                ) : null}

                <Card className="gap-0 py-5 shadow-sm">
                  <CardHeader className="gap-1 px-6 pb-4 pt-0">
                    <CardTitle className="text-lg">
                      {t('inviteUsers.emailWizard.reviewCardTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    {teacherEmails.map((email) => (
                      <div
                        key={`teacher:${email}`}
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2"
                      >
                        <Text
                          variant="body"
                          className="min-w-0 flex-1 break-all text-foreground"
                        >
                          {email}
                        </Text>
                        <Badge
                          variant="secondary"
                          className="shrink-0"
                        >
                          {t('users.roles.teacher')}
                        </Badge>
                      </div>
                    ))}
                    {studentEmails.map((email) => (
                      <div
                        key={`student:${email}`}
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2"
                      >
                        <Text
                          variant="body"
                          className="min-w-0 flex-1 break-all text-foreground"
                        >
                          {email}
                        </Text>
                        <Badge
                          variant="secondary"
                          className="shrink-0"
                        >
                          {t('users.roles.student')}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {!institutionId ? (
                  <Text
                    variant="small"
                    className="text-destructive"
                  >
                    {t('inviteUsers.emailWizard.missingInstitution')}
                  </Text>
                ) : null}

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
                    disabled={disableSend}
                    onClick={
                      failedInvites.length > 0 ? handleRetryFailedOnly : handleSendAllFromReview
                    }
                  >
                    <Send
                      className="size-4 shrink-0"
                      aria-hidden
                    />
                    {failedInvites.length > 0
                      ? t('inviteUsers.emailWizard.retryFailedButton')
                      : t('inviteUsers.emailWizard.sendButton')}
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div className="flex w-full flex-col items-center gap-6 text-center">
              <div
                className="text-5xl"
                aria-hidden
              >
                🎉
              </div>
              <div className="space-y-2">
                <Text
                  variant="h3"
                  as="h2"
                  className="font-semibold"
                >
                  {t('inviteUsers.emailWizard.successTitle')}
                </Text>
                <Text
                  variant="body"
                  className="text-muted-foreground"
                >
                  {t('inviteUsers.emailWizard.successDescription')}
                </Text>
              </div>
              <Button
                type="button"
                variant="darkblue"
                className="mt-2"
                onClick={() => navigate('/institution_admin/users')}
              >
                <Mail
                  className="mr-2 size-4 shrink-0"
                  aria-hidden
                />
                {t('inviteUsers.emailWizard.viewUsersButton')}
              </Button>
            </div>
          )
        }}
      />
    </div>
  )
}
