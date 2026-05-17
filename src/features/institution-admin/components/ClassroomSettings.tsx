import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'

import type { ClassroomRecord } from '../types/classroom.types'

type ClassroomSettingsProps = {
  classroom: ClassroomRecord
  isSaving: boolean
  saveError: string | null
  onSaveTitle: (nextTitle: string) => Promise<void> | void
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
  isSaving,
  saveError,
  onSaveTitle,
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
      <FieldInput
        label={t('classrooms.settings.titleLabel')}
        value={draftTitle}
        onValueChange={setDraftTitle}
        placeholder={t('classrooms.settings.titlePlaceholder')}
      />

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
