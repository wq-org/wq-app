import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { createProgramme } from '../api/programmesApi'
import { CreateProgrammeDialog } from '../components/CreateProgrammeDialog'
import { FacultyProgrammeCardList } from '../components/FacultyProgrammeCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultyProgrammes } from '../hooks/useFacultyProgrammes'

export function InstitutionFacultyProgrammes() {
  const { t } = useTranslation('features.institution-admin')
  const { facultyId: facultyIdParam } = useParams<{ facultyId: string }>()
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFacultyId, setCreateFacultyId] = useState('')
  const [createProgrammeName, setCreateProgrammeName] = useState('')
  const [createProgrammeDescription, setCreateProgrammeDescription] = useState('')
  const [createDurationYears, setCreateDurationYears] = useState<number | null>(null)
  const [isCreatingProgramme, setIsCreatingProgramme] = useState(false)

  const {
    faculty,
    programmes,
    isLoading,
    error: loadError,
    reload,
  } = useFacultyProgrammes(institutionId, facultyIdParam)

  const facultyDisplayName = faculty?.name?.trim() || t('faculties.card.untitled')
  const facultyDescription =
    faculty?.description?.trim() || t('faculties.pages.facultyProgrammes.noFacultyDescription')

  const searchableProgrammes = useMemo(
    () =>
      programmes.map((programme) => ({
        programme,
        facultyName: facultyDisplayName,
        searchName: programme.name ?? '',
        searchDescription: programme.description ?? '',
      })),
    [programmes, facultyDisplayName],
  )

  const filteredItems = useSearchFilter(searchableProgrammes, searchQuery, [
    'searchName',
    'searchDescription',
  ]).map(({ programme, facultyName }) => ({ programme, facultyName }))

  const facultyOptionForDialog = useMemo(() => {
    if (!faculty || !facultyIdParam) return []
    return [
      {
        id: faculty.id,
        name: facultyDisplayName,
      },
    ]
  }, [faculty, facultyIdParam, facultyDisplayName])

  const createProgrammeValidationError = useMemo(() => {
    if (!createProgrammeName.trim()) {
      return t('faculties.pages.programmes.createDialog.validation.titleRequired')
    }
    return null
  }, [createProgrammeName, t])

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

  const mainContent = (() => {
    if (!facultyIdParam) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.facultyProgrammes.missingFacultyId')}
        </Text>
      )
    }

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

    if (!faculty) {
      return null
    }

    if (programmes.length > 0 && filteredItems.length === 0) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
          className="animate-in fade-in-0 slide-in-from-bottom-2"
        >
          {t('faculties.pages.facultyProgrammes.noSearchResults')}
        </Text>
      )
    }

    if (filteredItems.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plus className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('faculties.pages.facultyProgrammes.emptyTitle')}</EmptyTitle>
            <EmptyDescription>
              {t('faculties.pages.facultyProgrammes.emptyDescription')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              type="button"
              className="gap-2"
              onClick={handleOpenCreateProgrammeDialog}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.pages.facultyProgrammes.addProgramme')}</Text>
            </Button>
          </EmptyContent>
        </Empty>
      )
    }

    return (
      <FacultyProgrammeCardList
        items={filteredItems}
        onOpenProgramme={handleOpenProgramme}
      />
    )
  })()

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

        <div className="flex animate-in fade-in-0 slide-in-from-bottom-3 flex-col gap-4">
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
              {facultyDescription}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              variant="darkblue"
              type="button"
              className="gap-2"
              onClick={handleOpenCreateProgrammeDialog}
              disabled={!faculty}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.pages.facultyProgrammes.addProgramme')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('faculties.pages.facultyProgrammes.searchLabel')}
          placeholder={t('faculties.pages.facultyProgrammes.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="max-w-xl animate-in fade-in-0 slide-in-from-bottom-2"
          disabled={!faculty || isLoading}
        />

        <div className="animate-in fade-in-0 slide-in-from-bottom-2">{mainContent}</div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
