import { useTranslation } from 'react-i18next'
import { Archive } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { YearSelectPopover } from './YearSelectPopover'
import type { ProgrammeRecord } from '../types/programme.types'
import { PROGRAMME_DURATION_YEAR_OPTIONS } from '../utils/programmeDurationYears'

const settingsEnterMotion =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

type ProgrammeSettingsProps = {
  isLoading: boolean
  isSaving: boolean
  loadError: string | null
  selectedProgramme: ProgrammeRecord | null
  draftProgrammeName: string
  draftProgrammeDescription: string
  draftProgrammeDurationYears: number
  hasUnsavedSettingsChanges: boolean
  onProgrammeNameChange: (value: string) => void
  onProgrammeDescriptionChange: (value: string) => void
  onProgrammeDurationYearsChange: (value: number) => void
  onSaveChanges: () => void
  onArchiveProgramme: () => void
  isArchiving: boolean
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

export function ProgrammeSettings({
  isLoading,
  isSaving,
  loadError,
  selectedProgramme,
  draftProgrammeName,
  draftProgrammeDescription,
  draftProgrammeDurationYears,
  hasUnsavedSettingsChanges,
  onProgrammeNameChange,
  onProgrammeDescriptionChange,
  onProgrammeDurationYearsChange,
  onSaveChanges,
  onArchiveProgramme,
  isArchiving,
}: ProgrammeSettingsProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const isArchived = selectedProgramme?.deleted_at != null

  if (isLoading) {
    return (
      <div className={`flex min-h-40 items-center justify-center ${settingsEnterMotion}`}>
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
        className={settingsEnterMotion}
      >
        {loadError}
      </Text>
    )
  }

  if (!selectedProgramme) {
    return (
      <Text
        as="p"
        variant="body"
        color="muted"
        className={settingsEnterMotion}
      >
        {t('faculties.pages.programmeOfferings.programmeNotFound')}
      </Text>
    )
  }

  return (
    <div className={`flex flex-col gap-6 ${settingsEnterMotion}`}>
      <div className="flex flex-col gap-4">
        <FieldInput
          label={t('faculties.pages.programmeOfferings.settings.fields.nameLabel')}
          value={draftProgrammeName}
          onValueChange={onProgrammeNameChange}
          placeholder={t('faculties.pages.programmeOfferings.settings.fields.namePlaceholder')}
        />
        <FieldTextarea
          label={t('faculties.pages.programmeOfferings.settings.fields.descriptionLabel')}
          value={draftProgrammeDescription}
          onValueChange={onProgrammeDescriptionChange}
          placeholder={t(
            'faculties.pages.programmeOfferings.settings.fields.descriptionPlaceholder',
          )}
          rows={4}
        />
        <div className="grid gap-2">
          <Text
            as="p"
            variant="small"
            className="font-medium"
          >
            {t('faculties.pages.programmeOfferings.settings.fields.durationYearsLabel')}
          </Text>
          <YearSelectPopover
            label={t('faculties.pages.programmeOfferings.settings.fields.durationYearsLabel')}
            value={draftProgrammeDurationYears}
            years={PROGRAMME_DURATION_YEAR_OPTIONS}
            onChange={onProgrammeDurationYearsChange}
            className="w-full sm:w-48"
          />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col items-start gap-5">
        <Badge variant={isArchived ? 'error' : 'green'}>
          {isArchived
            ? t('faculties.pages.programmeOfferings.settings.status.archived')
            : t('faculties.pages.programmeOfferings.settings.status.active')}
        </Badge>
        <Badge variant="secondary">{`created_at: ${formatMetadataDate(selectedProgramme.created_at, i18n.language)}`}</Badge>
        <Badge variant="secondary">{`updated_at: ${formatMetadataDate(selectedProgramme.updated_at, i18n.language)}`}</Badge>
        <Badge variant={isArchived ? 'error' : 'secondary'}>
          {`deleted_at: ${formatMetadataDate(selectedProgramme.deleted_at, i18n.language)}`}
        </Badge>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <HoldConfirmButton
            onConfirm={onArchiveProgramme}
            variant="orange"
            icon={<Archive className="size-4 shrink-0" />}
            disabled={isArchived || isArchiving}
          >
            {isArchiving
              ? t('faculties.pages.programmeOfferings.settings.archiving')
              : t('faculties.pages.programmeOfferings.settings.archive')}
          </HoldConfirmButton>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSaveChanges}
            disabled={!hasUnsavedSettingsChanges || isSaving}
          >
            {t('faculties.pages.programmeOfferings.settings.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  )
}
