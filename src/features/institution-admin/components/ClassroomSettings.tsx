import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Text } from '@/components/ui/text'

import type { ClassroomMember, ClassroomRecord } from '../types/classroom.types'
import { getInitial } from '../utils'

type ClassroomSettingsProps = {
  classroom: ClassroomRecord
  primaryTeacher: ClassroomMember | null
  isSaving: boolean
  saveError: string | null
  onSaveTitle: (nextTitle: string) => Promise<void> | void
  onUnassignMainTeacher: () => Promise<void> | void
  onReassignMainTeacher: () => void
}

function formatMetadataDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ClassroomSettings({
  classroom,
  primaryTeacher,
  isSaving,
  saveError,
  onSaveTitle,
  onUnassignMainTeacher,
  onReassignMainTeacher,
}: ClassroomSettingsProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const [draftTitle, setDraftTitle] = useState(classroom.title)

  useEffect(() => {
    setDraftTitle(classroom.title)
  }, [classroom.title])

  const trimmedDraft = draftTitle.trim()
  const hasUnsavedChanges = trimmedDraft.length > 0 && trimmedDraft !== classroom.title.trim()

  const handleSaveClick = async () => {
    if (!hasUnsavedChanges) return
    await onSaveTitle(trimmedDraft)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FieldInput
          label={t('classrooms.settings.titleLabel')}
          value={draftTitle}
          onValueChange={setDraftTitle}
          placeholder={t('classrooms.settings.titlePlaceholder')}
        />

        <div className="flex flex-col gap-2">
          <Text
            as="p"
            variant="small"
            className="font-semibold"
          >
            {t('classrooms.settings.mainTeacherLabel')}
          </Text>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Avatar size="default">
              {primaryTeacher?.avatarUrl ? (
                <AvatarImage
                  src={primaryTeacher.avatarUrl}
                  alt={primaryTeacher.name}
                />
              ) : null}
              <AvatarFallback>{getInitial(primaryTeacher?.name ?? '')}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <Text
                as="p"
                variant="body"
                className="truncate font-medium"
              >
                {primaryTeacher?.name ?? t('classrooms.settings.mainTeacherUnassigned')}
              </Text>
              {primaryTeacher?.email ? (
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="truncate"
                >
                  {primaryTeacher.email}
                </Text>
              ) : null}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {primaryTeacher ? (
                <HoldToDeleteButton
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  onDelete={() => void onUnassignMainTeacher()}
                >
                  {t('classrooms.settings.unassign')}
                </HoldToDeleteButton>
              ) : null}
              <Button
                type="button"
                variant="darkblue"
                size="sm"
                onClick={onReassignMainTeacher}
                disabled={isSaving}
              >
                {t('classrooms.settings.reassign')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2">
        <Badge variant="secondary">{`created_at: ${formatMetadataDate(classroom.created_at, i18n.language)}`}</Badge>
        <Badge variant="secondary">{`updated_at: ${formatMetadataDate(classroom.updated_at, i18n.language)}`}</Badge>
        <Badge variant="secondary">{`deactivated_at: ${formatMetadataDate(classroom.deactivated_at, i18n.language)}`}</Badge>
      </div>

      {saveError ? (
        <Text
          as="p"
          variant="small"
          color="danger"
        >
          {saveError}
        </Text>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="darkblue"
          onClick={handleSaveClick}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? t('classrooms.settings.saving') : t('classrooms.settings.saveChanges')}
        </Button>
      </div>
    </div>
  )
}
