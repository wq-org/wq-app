import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { DateRangePicker, StepperProgressBarTitles } from '@/components/shared'

import type { ProgrammeProgressionType } from '../types/programme.types'
import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { YearSelectPopover } from '../components/YearSelectPopover'
import { suggestTermCode, yearRangeInclusive } from '../utils/termCode'

const WIZARD_STEP_COUNT = 3

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6] as const

type OfferingDraft = {
  id: string
  academicYear: number
  termCode: string
  status: ProgrammeOfferingStatus
  dateRange: DateRange | undefined
}

function createEmptyOffering(): OfferingDraft {
  const y = new Date().getFullYear()
  return {
    id: crypto.randomUUID(),
    academicYear: y,
    termCode: suggestTermCode(y),
    status: 'draft',
    dateRange: undefined,
  }
}

export function InstitutionFacultiesCreate() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const [wizardStep, setWizardStep] = useState(1)

  const [facultyName, setFacultyName] = useState('')
  const [facultyDescription, setFacultyDescription] = useState('')

  const [programmeName, setProgrammeName] = useState('')
  const [programmeDescription, setProgrammeDescription] = useState('')
  const [durationYears, setDurationYears] = useState<number>(3)
  const [progressionType, setProgressionType] = useState<ProgrammeProgressionType>('year_group')

  const [offerings, setOfferings] = useState<OfferingDraft[]>(() => [createEmptyOffering()])

  const academicYearsOffering = useMemo(() => yearRangeInclusive(1990, 2060), [])
  const progressionOptions = useMemo(
    (): readonly ProgrammeProgressionType[] => ['year_group', 'stage'],
    [],
  )

  const wizardSteps = useMemo(
    () =>
      [
        { title: t('faculties.wizard.steps.faculty') },
        { title: t('faculties.wizard.steps.programme') },
        { title: t('faculties.wizard.steps.programmeOffering') },
      ] as const,
    [t],
  )

  const programmeDisplayName =
    programmeName.trim() || t('faculties.wizard.programme.placeholderName')

  const handleBackToFaculties = () => {
    navigate('/institution_admin/faculties')
  }

  function handleWizardPrevious() {
    setWizardStep((prev) => Math.max(1, prev - 1))
  }

  function handleWizardNext() {
    setWizardStep((prev) => Math.min(WIZARD_STEP_COUNT, prev + 1))
  }

  function handleFinish() {
    // Submit / API wiring later
  }

  function updateOffering(id: string, patch: Partial<OfferingDraft>) {
    setOfferings((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if (patch.academicYear != null && patch.termCode === undefined) {
          next.termCode = suggestTermCode(patch.academicYear)
        }
        return next
      }),
    )
  }

  function addOffering() {
    setOfferings((rows) => [...rows, createEmptyOffering()])
  }

  function removeOffering(id: string) {
    setOfferings((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)))
  }

  const renderWizardStep = (_step: { title: string }, index: number) => {
    if (index === 0) {
      return (
        <div className="w-full">
          <FieldCard>
            <FieldInput
              label={t('faculties.wizard.fields.nameLabel')}
              placeholder={t('faculties.wizard.fields.namePlaceholder')}
              value={facultyName}
              onValueChange={setFacultyName}
            />
            <FieldTextarea
              label={t('faculties.wizard.fields.descriptionLabel')}
              placeholder={t('faculties.wizard.fields.descriptionPlaceholder')}
              value={facultyDescription}
              onValueChange={setFacultyDescription}
              rows={5}
            />
          </FieldCard>
        </div>
      )
    }

    if (index === 1) {
      return (
        <div className="w-full">
          <FieldCard className="flex flex-col gap-6">
            <FieldInput
              label={t('faculties.wizard.programme.nameLabel')}
              placeholder={t('faculties.wizard.programme.namePlaceholder')}
              value={programmeName}
              onValueChange={setProgrammeName}
            />
            <FieldTextarea
              label={t('faculties.wizard.programme.descriptionLabel')}
              placeholder={t('faculties.wizard.programme.descriptionPlaceholder')}
              value={programmeDescription}
              onValueChange={setProgrammeDescription}
              rows={5}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>{t('faculties.wizard.programme.durationLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-between font-normal"
                    >
                      {t('faculties.wizard.programme.durationValue', { count: durationYears })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-1"
                    align="start"
                  >
                    <ul className="flex flex-col">
                      {DURATION_OPTIONS.map((n) => (
                        <li key={n}>
                          <button
                            type="button"
                            className="hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm"
                            onClick={() => setDurationYears(n)}
                          >
                            {t('faculties.wizard.programme.durationValue', { count: n })}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('faculties.wizard.programme.progressionLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-between font-normal"
                    >
                      {t(`faculties.wizard.programme.progression.${progressionType}`)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto min-w-[var(--radix-popover-trigger-width)] p-1"
                    align="start"
                  >
                    <ul className="flex flex-col">
                      {progressionOptions.map((opt) => (
                        <li key={opt}>
                          <button
                            type="button"
                            className="hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm"
                            onClick={() => setProgressionType(opt)}
                          >
                            {t(`faculties.wizard.programme.progression.${opt}`)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </FieldCard>
        </div>
      )
    }

    return (
      <div className="flex w-full flex-col gap-4">
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('faculties.wizard.offering.intro')}
        </Text>

        {offerings.map((row) => (
          <FieldCard
            key={row.id}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant="indigo"
                size="sm"
              >
                {programmeDisplayName}
              </Badge>
              {offerings.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => removeOffering(row.id)}
                >
                  {t('faculties.wizard.offering.remove')}
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`ay-${row.id}`}>
                  {t('faculties.wizard.offering.academicYearLabel')}
                </Label>
                <YearSelectPopover
                  label={t('faculties.wizard.offering.academicYearLabel')}
                  value={row.academicYear}
                  years={academicYearsOffering}
                  onChange={(y) => updateOffering(row.id, { academicYear: y })}
                  triggerClassName="w-full"
                />
              </div>

              <FieldInput
                id={`tc-${row.id}`}
                label={t('faculties.wizard.offering.termCodeLabel')}
                placeholder={t('faculties.wizard.offering.termCodePlaceholder')}
                value={row.termCode}
                onValueChange={(termCode) => updateOffering(row.id, { termCode })}
                hideSeparator
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Switch
                checked={row.status === 'active'}
                onCheckedChange={(on) =>
                  updateOffering(row.id, { status: on ? 'active' : 'draft' })
                }
                id={`st-${row.id}`}
              />
              <Label
                htmlFor={`st-${row.id}`}
                className="cursor-pointer"
              >
                {row.status === 'active'
                  ? t('faculties.wizard.offering.statusActive')
                  : t('faculties.wizard.offering.statusDraft')}
              </Label>
            </div>

            <DateRangePicker
              label={t('faculties.wizard.offering.dateRangeLabel')}
              value={row.dateRange}
              onChange={(dateRange) => updateOffering(row.id, { dateRange })}
              placeholder={t('faculties.wizard.offering.dateRangePlaceholder')}
            />
          </FieldCard>
        ))}

        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={addOffering}
        >
          {t('faculties.wizard.offering.addAnother')}
        </Button>
      </div>
    )
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-2 pb-12 pt-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            type="button"
            className="w-fit gap-2 px-0"
            onClick={handleBackToFaculties}
          >
            <ArrowLeft className="size-4" />
            {t('faculties.wizard.backToList')}
          </Button>
          <div>
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('faculties.create')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.createSubtitle')}
            </Text>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <StepperProgressBarTitles
            steps={wizardSteps}
            value={wizardStep}
            defaultValue={1}
            onValueChange={setWizardStep}
            className="mx-auto max-w-4xl space-y-8"
            renderContent={renderWizardStep}
          />

          <div className="mx-auto flex w-full max-w-4xl flex-wrap justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleWizardPrevious}
              disabled={wizardStep <= 1}
            >
              {t('faculties.wizard.actions.previous')}
            </Button>

            {wizardStep < WIZARD_STEP_COUNT ? (
              <Button
                type="button"
                variant="darkblue"
                onClick={handleWizardNext}
              >
                {t('faculties.wizard.actions.next')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="darkblue"
                onClick={handleFinish}
              >
                {t('faculties.wizard.actions.finish')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
