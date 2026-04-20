import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { StepperProgressBarTitles } from '@/components/shared'
import type { ProgrammeProgressionType } from '../types/programme.types'
import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { WizardBreadcrumb } from '../components/WizardBreadcrumb'
import { FacultyStep } from '../components/FacultyStep'
import { ProgrammeStep } from '../components/ProgrammeStep'
import { ProgrammeOfferingStep } from '../components/ProgrammeOfferingStep'
import { CohortStep } from '../components/CohortStep'
import { CohortOfferingStep } from '../components/CohortOfferingStep'
import { ClassGroupStep } from '../components/ClassGroupStep'
import { ClassGroupOfferingStep } from '../components/ClassGroupOfferingStep'
import { suggestTermCode } from '../utils/termCode'

type BaseOfferingDraft = {
  id: string
  status: ProgrammeOfferingStatus
  dateRange: DateRange | undefined
}

function createBaseOffering(): BaseOfferingDraft {
  return { id: crypto.randomUUID(), status: 'draft', dateRange: undefined }
}

const WIZARD_STEP_COUNT = 7

type OfferingDraft = {
  id: string
  academicYear: number
  termCode: string
  status: ProgrammeOfferingStatus
  dateRange: DateRange | undefined
}

function createEmptyOffering(): OfferingDraft {
  const currentYear = new Date().getFullYear()
  return {
    id: crypto.randomUUID(),
    academicYear: currentYear,
    termCode: suggestTermCode(currentYear),
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

  const [cohortName, setCohortName] = useState('')
  const [cohortAcademicYear, setCohortAcademicYear] = useState<number>(new Date().getFullYear())
  const [cohortOfferings, setCohortOfferings] = useState<BaseOfferingDraft[]>(() => [
    createBaseOffering(),
  ])

  const [classGroupName, setClassGroupName] = useState('')
  const [classGroupDescription, setClassGroupDescription] = useState('')
  const [classGroupOfferings, setClassGroupOfferings] = useState<BaseOfferingDraft[]>(() => [
    createBaseOffering(),
  ])

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
        { title: t('faculties.wizard.steps.cohort') },
        { title: t('faculties.wizard.steps.cohortOffering') },
        { title: t('faculties.wizard.steps.classGroup') },
        { title: t('faculties.wizard.steps.classGroupOffering') },
      ] as const,
    [t],
  )

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

  function updateCohortOffering(id: string, patch: Partial<BaseOfferingDraft>) {
    setCohortOfferings((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addCohortOffering() {
    setCohortOfferings((rows) => [...rows, createBaseOffering()])
  }

  function removeCohortOffering(id: string) {
    setCohortOfferings((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)))
  }

  function updateClassGroupOffering(id: string, patch: Partial<BaseOfferingDraft>) {
    setClassGroupOfferings((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addClassGroupOffering() {
    setClassGroupOfferings((rows) => [...rows, createBaseOffering()])
  }

  function removeClassGroupOffering(id: string) {
    setClassGroupOfferings((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)))
  }

  const breadcrumbChain = useMemo(
    () => [facultyName, programmeName, cohortName, classGroupName],
    [facultyName, programmeName, cohortName, classGroupName],
  )

  const renderWizardStep = (_step: { title: string }, index: number) => {
    // Show the chain of names defined in prior steps (skip empty values)
    const priorItems = breadcrumbChain.slice(0, index).filter(Boolean)

    let stepContent: ReactNode

    switch (index) {
      case 0:
        stepContent = (
          <FacultyStep
            name={facultyName}
            onNameChange={setFacultyName}
            description={facultyDescription}
            onDescriptionChange={setFacultyDescription}
          />
        )
        break

      case 1:
        stepContent = (
          <ProgrammeStep
            name={programmeName}
            onNameChange={setProgrammeName}
            description={programmeDescription}
            onDescriptionChange={setProgrammeDescription}
            durationYears={durationYears}
            onDurationChange={setDurationYears}
            progressionType={progressionType}
            onProgressionTypeChange={setProgressionType}
            progressionOptions={progressionOptions}
          />
        )
        break

      case 2:
        stepContent = (
          <ProgrammeOfferingStep
            offerings={offerings}
            onUpdateOffering={updateOffering}
            onAddOffering={addOffering}
            onRemoveOffering={removeOffering}
            programmeName={programmeName}
            durationYears={durationYears}
          />
        )
        break

      case 3:
        stepContent = (
          <CohortStep
            name={cohortName}
            onNameChange={setCohortName}
            academicYear={cohortAcademicYear}
            onAcademicYearChange={setCohortAcademicYear}
          />
        )
        break

      case 4:
        stepContent = (
          <CohortOfferingStep
            offerings={cohortOfferings}
            onUpdateOffering={updateCohortOffering}
            onAddOffering={addCohortOffering}
            onRemoveOffering={removeCohortOffering}
          />
        )
        break

      case 5:
        stepContent = (
          <ClassGroupStep
            name={classGroupName}
            onNameChange={setClassGroupName}
            description={classGroupDescription}
            onDescriptionChange={setClassGroupDescription}
          />
        )
        break

      case 6:
        stepContent = (
          <ClassGroupOfferingStep
            offerings={classGroupOfferings}
            onUpdateOffering={updateClassGroupOffering}
            onAddOffering={addClassGroupOffering}
            onRemoveOffering={removeClassGroupOffering}
          />
        )
        break

      default:
        return null
    }

    return (
      <div className="flex w-full flex-col gap-4">
        <WizardBreadcrumb items={priorItems} />
        {stepContent}
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
