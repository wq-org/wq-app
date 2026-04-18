import { useMemo, useState } from 'react'
import { GraduationCap, MoveLeft, Send, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SelectTabs, StepperProgressBarTitles, type TabItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'

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
  const [activeStep, setActiveStep] = useState(1)
  const [inviteRoleTabId, setInviteRoleTabId] = useState<InviteEmailRoleTabId>('teacher')
  const [teacherEmailBulkText, setTeacherEmailBulkText] = useState('')
  const [studentEmailBulkText, setStudentEmailBulkText] = useState('')

  const teacherEmails = useMemo(
    () => parseBulkEmailTokens(teacherEmailBulkText),
    [teacherEmailBulkText],
  )
  const studentEmails = useMemo(
    () => parseBulkEmailTokens(studentEmailBulkText),
    [studentEmailBulkText],
  )

  const wizardSteps = useMemo(
    () => [
      { title: t('inviteUsers.emailWizard.steps.enterAddresses') },
      { title: t('inviteUsers.emailWizard.steps.reviewRecipients') },
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

  function handleInviteRoleTabChange(tabId: string) {
    if (isInviteEmailRoleTabId(tabId)) setInviteRoleTabId(tabId)
  }

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
        colorVariant="default"
        className="max-w-3xl space-y-8"
        renderContent={(_, index) => {
          if (index === 0) {
            const hasAnyEmails = teacherEmails.length > 0 || studentEmails.length > 0

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

          return (
            <div className="flex w-full flex-col gap-6">
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
