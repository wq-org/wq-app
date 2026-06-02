import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import type { ClassGroupRecord } from '../types/class-group.types'

type ClassGroupSettingsProps = {
  isLoading: boolean
  isSaving: boolean
  loadError: string | null
  selectedClassGroup: ClassGroupRecord | null
  draftClassGroupName: string
  draftClassGroupDescription: string
  hasUnsavedSettingsChanges: boolean
  onClassGroupNameChange: (value: string) => void
  onClassGroupDescriptionChange: (value: string) => void
  onSaveChanges: () => void
}

function formatMetadataDate(value: string | null | undefined, locale: string): string {
  if (!value) return 'null'
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ClassGroupSettings({
  isLoading,
  isSaving,
  loadError,
  selectedClassGroup,
  draftClassGroupName,
  draftClassGroupDescription,
  hasUnsavedSettingsChanges,
  onClassGroupNameChange,
  onClassGroupDescriptionChange,
  onSaveChanges,
}: ClassGroupSettingsProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <Text
        as="p"
        variant="small"
        color="danger"
      >
        {loadError}
      </Text>
    )
  }

  if (!selectedClassGroup) {
    return (
      <Text
        as="p"
        variant="body"
        color="muted"
      >
        {t('faculties.pages.classGroupOfferings.classGroupNotFound')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FieldInput
          label={t('faculties.pages.classGroupOfferings.settings.fields.nameLabel')}
          value={draftClassGroupName}
          onValueChange={onClassGroupNameChange}
          placeholder={t('faculties.pages.classGroupOfferings.settings.fields.namePlaceholder')}
        />
        <FieldTextarea
          label={t('faculties.pages.classGroupOfferings.settings.fields.descriptionLabel')}
          value={draftClassGroupDescription}
          onValueChange={onClassGroupDescriptionChange}
          placeholder={t(
            'faculties.pages.classGroupOfferings.settings.fields.descriptionPlaceholder',
          )}
          rows={4}
        />
      </div>
      <div className="flex flex-col items-start gap-5">
        <Badge variant="secondary">{`created_at: ${formatMetadataDate(selectedClassGroup.created_at, i18n.language)}`}</Badge>
        <Badge variant="secondary">{`updated_at: ${formatMetadataDate(selectedClassGroup.updated_at, i18n.language)}`}</Badge>
        <Badge variant="secondary">{`deleted_at: ${formatMetadataDate(selectedClassGroup.deleted_at, i18n.language)}`}</Badge>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="darkblue"
          onClick={onSaveChanges}
          disabled={!hasUnsavedSettingsChanges || isSaving}
        >
          {t('faculties.pages.classGroupOfferings.settings.saveChanges')}
        </Button>
      </div>
    </div>
  )
}
