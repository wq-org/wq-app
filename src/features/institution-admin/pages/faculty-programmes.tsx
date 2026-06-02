import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SelectTabs, showUnsavedChangesToast, type TabItem } from '@/components/shared'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { updateFaculty } from '../api/facultiesApi'
import { createProgramme } from '../api/programmesApi'
import { CreateProgrammeDialog } from '../components/CreateProgrammeDialog'
import { FacultyOverview } from '../components/FacultyOverview'
import { FacultySettings } from '../components/FacultySettings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultyProgrammes } from '../hooks/useFacultyProgrammes'

type FacultyTabId = 'overview' | 'settings'

export function InstitutionFacultyProgrammes() {
  const { t } = useTranslation('features.institution-admin')
  const { facultyId: facultyIdParam } = useParams<{ facultyId: string }>()
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const [activeTabId, setActiveTabId] = useState<FacultyTabId>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFacultyId, setCreateFacultyId] = useState('')
  const [createProgrammeName, setCreateProgrammeName] = useState('')
  const [createProgrammeDescription, setCreateProgrammeDescription] = useState('')
  const [createDurationYears, setCreateDurationYears] = useState<number | null>(null)
  const [isCreatingProgramme, setIsCreatingProgramme] = useState(false)

  const [draftFacultyName, setDraftFacultyName] = useState('')
  const [draftFacultyDescription, setDraftFacultyDescription] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const {
    faculty,
    programmes,
    isLoading,
    error: loadError,
    reload,
  } = useFacultyProgrammes(institutionId, facultyIdParam)

  const facultyDisplayName = faculty?.name?.trim() || t('faculties.card.untitled')
  const facultyDisplayDescription =
    faculty?.description?.trim() || t('faculties.pages.facultyProgrammes.noFacultyDescription')

  const searchableProgrammes = useMemo(
    () =>
      programmes.map((programme) => ({
        programme,
        facultyName: facultyDisplayName,
        searchName: programme.name ?? '',
        searchDescription: programme.description ?? '',
      })),
    [facultyDisplayName, programmes],
  )

  const filteredProgrammeItems = useSearchFilter(searchableProgrammes, searchQuery, [
    'searchName',
    'searchDescription',
  ]).map(({ programme, facultyName }) => ({ programme, facultyName }))

  const facultyOptionForDialog = useMemo(() => {
    if (!faculty || !facultyIdParam) return []
    return [{ id: faculty.id, name: facultyDisplayName }]
  }, [faculty, facultyDisplayName, facultyIdParam])

  const createProgrammeValidationError = useMemo(() => {
    if (!createProgrammeName.trim()) {
      return t('faculties.pages.programmes.createDialog.validation.titleRequired')
    }
    return null
  }, [createProgrammeName, t])

  const hasUnsavedSettingsChanges = useMemo(() => {
    if (!faculty) return false
    return (
      draftFacultyName.trim() !== faculty.name.trim() ||
      draftFacultyDescription.trim() !== (faculty.description?.trim() ?? '')
    )
  }, [draftFacultyDescription, draftFacultyName, faculty])

  const resetCreateProgrammeForm = () => {
    setCreateFacultyId('')
    setCreateProgrammeName('')
    setCreateProgrammeDescription('')
    setCreateDurationYears(null)
  }

  const handleOpenCreateProgrammeDialog = () => {
    if (!facultyIdParam || !faculty) return
    resetCreateProgrammeForm()
    setCreateFacultyId(facultyIdParam)
    setIsCreateDialogOpen(true)
  }

  const handleCreateProgrammeDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      resetCreateProgrammeForm()
    }
  }

  const handleSubmitCreateProgramme = async () => {
    const trimmedTitle = createProgrammeName.trim()
    if (!trimmedTitle) {
      return
    }
    if (!institutionId || !facultyIdParam) {
      toast.error(t('faculties.createDialog.errorNoInstitution'))
      return
    }

    setIsCreatingProgramme(true)
    try {
      await createProgramme({
        institution_id: institutionId,
        faculty_id: facultyIdParam,
        name: trimmedTitle,
        description: createProgrammeDescription.trim() || null,
        duration_years: createDurationYears,
        progression_type: null,
      })
      setIsCreateDialogOpen(false)
      resetCreateProgrammeForm()
      reload()
    } catch (createError) {
      toast.error(
        createError instanceof Error
          ? createError.message
          : t('faculties.pages.programmes.createDialog.errorGeneric'),
      )
    } finally {
      setIsCreatingProgramme(false)
    }
  }

  const handleOpenProgramme = (programmeId: string) => {
    if (!facultyIdParam) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(facultyIdParam)}/programmes/${encodeURIComponent(programmeId)}`,
    )
  }

  const handleSaveFacultySettings = async () => {
    if (!faculty || !facultyIdParam || !institutionId) return

    const trimmedName = draftFacultyName.trim()
    if (!trimmedName) {
      setSettingsError(t('faculties.pages.facultyProgrammes.settings.validation.nameRequired'))
      return
    }

    setIsSavingSettings(true)
    setSettingsError(null)
    try {
      await updateFaculty({
        institution_id: institutionId,
        faculty_id: facultyIdParam,
        name: trimmedName,
        description: draftFacultyDescription.trim() || null,
      })
      reload()
      toast.success(t('faculties.pages.facultyProgrammes.settings.saveSuccess'))
    } catch (error) {
      setSettingsError(
        error instanceof Error
          ? error.message
          : t('faculties.pages.facultyProgrammes.settings.saveError'),
      )
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleTabChange = (nextTabId: string) => {
    const resolvedTab = nextTabId as FacultyTabId
    if (resolvedTab === activeTabId) return

    if (activeTabId === 'settings' && hasUnsavedSettingsChanges) {
      showUnsavedChangesToast({
        t: (key) => t(`faculties.pages.facultyProgrammes.${key}`),
        onStay: () => {},
        onContinue: () => setActiveTabId(resolvedTab),
      })
      return
    }

    setActiveTabId(resolvedTab)
  }

  useEffect(() => {
    if (!faculty) {
      setDraftFacultyName('')
      setDraftFacultyDescription('')
      return
    }

    setDraftFacultyName(faculty.name ?? '')
    setDraftFacultyDescription(faculty.description ?? '')
    setSettingsError(null)
  }, [faculty])

  const tabs = useMemo<readonly TabItem[]>(
    () => [
      {
        id: 'overview',
        icon: LayoutGrid,
        title: t('faculties.pages.facultyProgrammes.tabs.overview'),
      },
      {
        id: 'settings',
        icon: Settings,
        title: t('faculties.pages.facultyProgrammes.tabs.settings'),
      },
    ],
    [t],
  )

  if (!facultyIdParam) {
    return (
      <InstitutionAdminWorkspaceShell>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4">
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('faculties.pages.facultyProgrammes.missingFacultyId')}
          </Text>
        </div>
      </InstitutionAdminWorkspaceShell>
    )
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <CreateProgrammeDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateProgrammeDialogOpenChange}
        facultyOptions={facultyOptionForDialog}
        facultyId={createFacultyId}
        onFacultyIdChange={setCreateFacultyId}
        facultyReadOnly
        name={createProgrammeName}
        onNameChange={setCreateProgrammeName}
        description={createProgrammeDescription}
        onDescriptionChange={setCreateProgrammeDescription}
        durationYears={createDurationYears}
        onDurationYearsChange={setCreateDurationYears}
        validationError={createProgrammeValidationError}
        submitError={null}
        isSubmitting={isCreatingProgramme}
        onSubmit={() => void handleSubmitCreateProgramme()}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/institution_admin/faculties">{t('faculties.title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{facultyDisplayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4">
          <div className="flex max-w-2xl flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {facultyDisplayName}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {facultyDisplayDescription}
            </Text>
          </div>
        </div>

        <SelectTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
        />

        {activeTabId === 'overview' ? (
          <FacultyOverview
            facultyName={facultyDisplayName}
            facultyDescription={facultyDisplayDescription}
            isLoading={isLoading}
            loadError={loadError}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            items={filteredProgrammeItems}
            isSearchActive={searchQuery.trim().length > 0}
            onAddProgramme={handleOpenCreateProgrammeDialog}
            onOpenProgramme={handleOpenProgramme}
          />
        ) : (
          <FacultySettings
            isLoading={isLoading}
            isSaving={isSavingSettings}
            loadError={loadError}
            selectedFaculty={faculty}
            draftFacultyName={draftFacultyName}
            draftFacultyDescription={draftFacultyDescription}
            hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
            validationError={
              faculty
                ? draftFacultyName.trim()
                  ? null
                  : t('faculties.pages.facultyProgrammes.settings.validation.nameRequired')
                : null
            }
            saveError={settingsError}
            onFacultyNameChange={setDraftFacultyName}
            onFacultyDescriptionChange={setDraftFacultyDescription}
            onSaveChanges={handleSaveFacultySettings}
          />
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
