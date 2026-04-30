import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'

import {
  useCommandAttendanceDialog,
  type CommandAttendanceMode,
} from '../hooks/useCommandAttendanceDialog'

export type CommandAttendanceDialogProps = {
  mode: CommandAttendanceMode
  open: boolean
  onRequestClose: () => void
}

export function CommandAttendanceDialog({
  mode,
  open,
  onRequestClose,
}: CommandAttendanceDialogProps) {
  const { t } = useTranslation('features.commandPalette')
  const state = useCommandAttendanceDialog({ mode, open, onRequestClose })

  const titleKey = mode === 'start' ? 'attendanceDialog.titleStart' : 'attendanceDialog.titleEnd'

  return (
    <Card className="mx-auto w-full max-w-md border-0 bg-transparent shadow-none">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0">
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle>{t('attendanceDialog.errorTitle')}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        {state.isLoading ? (
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('attendanceDialog.loading')}
          </Text>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label>{t('attendanceDialog.classroom')}</Label>
          {state.classrooms.length === 0 && !state.isLoading ? (
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('attendanceDialog.noClassrooms')}
            </Text>
          ) : (
            <Select
              value={state.selectedClassroomId || undefined}
              onValueChange={state.setSelectedClassroomId}
              disabled={state.isLoading || state.classrooms.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('attendanceDialog.classroomPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {state.classrooms.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                  >
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {mode === 'start' && state.selectedClassroomId ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>{t('attendanceDialog.course')}</Label>
              {state.courses.length === 0 ? (
                <Text
                  as="p"
                  variant="body"
                  color="muted"
                >
                  {t('attendanceDialog.noCourses')}
                </Text>
              ) : (
                <Select
                  value={state.selectedCourseId || undefined}
                  onValueChange={state.setSelectedCourseId}
                  disabled={state.isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendanceDialog.coursePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {state.courses.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                      >
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <FieldInput
              value={state.title}
              onValueChange={state.setTitle}
              label={t('attendanceDialog.sessionTitle')}
              placeholder={t('attendanceDialog.sessionTitlePlaceholder')}
              disabled={state.isSubmitting}
              showClearButton={false}
            />
            <FieldInput
              type="date"
              value={state.sessionDate}
              onValueChange={state.setSessionDate}
              label={t('attendanceDialog.sessionDate')}
              disabled={state.isSubmitting}
              showClearButton={false}
            />
            <FieldInput
              type="datetime-local"
              value={state.startsAt}
              onValueChange={state.setStartsAt}
              label={t('attendanceDialog.startsAt')}
              disabled={state.isSubmitting}
              showClearButton={false}
            />
            <FieldInput
              type="datetime-local"
              value={state.endsAt}
              onValueChange={state.setEndsAt}
              label={t('attendanceDialog.endsAtOptional')}
              disabled={state.isSubmitting}
              showClearButton={false}
            />
          </>
        ) : null}

        {mode === 'end' && state.selectedClassroomId ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>{t('attendanceDialog.session')}</Label>
              {state.sessions.length === 0 ? (
                <Text
                  as="p"
                  variant="body"
                  color="muted"
                >
                  {t('attendanceDialog.noSessions')}
                </Text>
              ) : (
                <Select
                  value={state.selectedSessionId || undefined}
                  onValueChange={state.setSelectedSessionId}
                  disabled={state.isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendanceDialog.sessionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {state.sessions.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                      >
                        {(s.title ?? t('attendanceDialog.untitledSession')) + ` · ${s.sessionDate}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <FieldInput
              type="datetime-local"
              value={state.closeEndsAt}
              onValueChange={state.setCloseEndsAt}
              label={t('attendanceDialog.closeEndsAt')}
              disabled={state.isSubmitting}
              showClearButton={false}
            />
          </>
        ) : null}
      </CardContent>
      <CardFooter className="mt-4 flex gap-2 px-0">
        <Button
          type="button"
          variant="darkblue"
          className="flex-1"
          disabled={!state.canSubmit || state.isSubmitting || state.isLoading}
          onClick={() => void state.handleSubmit()}
        >
          {state.isSubmitting
            ? t('attendanceDialog.submitting')
            : mode === 'start'
              ? t('attendanceDialog.submitStart')
              : t('attendanceDialog.submitEnd')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRequestClose}
          disabled={state.isSubmitting}
        >
          {t('attendanceDialog.cancel')}
        </Button>
      </CardFooter>
    </Card>
  )
}
