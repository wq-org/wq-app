import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import { FacultyProgrammeCardList } from '../components/FacultyProgrammeCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { FacultySummary } from '../types/faculty.types'

export function InstitutionFacultyProgrammes() {
  const { t } = useTranslation('features.institution-admin')
  const { facultyId: facultyIdParam } = useParams<{ facultyId: string }>()
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const [faculty, setFaculty] = useState<FacultySummary | null>(null)
  const [programmes, setProgrammes] = useState<Awaited<ReturnType<typeof listProgrammesByFaculty>>>(
    [],
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

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

  const handleAddProgramme = () => {
    if (!facultyIdParam) return
    navigate(`/institution_admin/faculties/create?facultyId=${encodeURIComponent(facultyIdParam)}`)
  }

  const handleOpenProgramme = (programmeId: string) => {
    if (!facultyIdParam) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(facultyIdParam)}/programmes/${encodeURIComponent(programmeId)}`,
    )
  }

  useEffect(() => {
    if (!institutionId || !facultyIdParam) {
      setFaculty(null)
      setProgrammes([])
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const faculties = await listFacultiesByInstitution(institutionId)
        const match = faculties.find((f) => f.id === facultyIdParam) ?? null
        if (!match) {
          if (!cancelled) {
            setFaculty(null)
            setProgrammes([])
            setLoadError(t('faculties.pages.facultyProgrammes.facultyNotFound'))
          }
          return
        }

        const programmeRows = await listProgrammesByFaculty(facultyIdParam)

        if (!cancelled) {
          setFaculty(match)
          setProgrammes([...programmeRows])
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : t('faculties.pages.facultyProgrammes.loadError'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [institutionId, facultyIdParam, t])

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
              variant="darkblue"
              type="button"
              className="gap-2"
              onClick={handleAddProgramme}
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

        <div className="flex animate-in fade-in-0 slide-in-from-bottom-3 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
          <Button
            variant="darkblue"
            type="button"
            className="shrink-0 gap-2 self-start"
            onClick={handleAddProgramme}
            disabled={!faculty}
          >
            <Plus className="size-4" />
            <Text as="span">{t('faculties.pages.facultyProgrammes.addProgramme')}</Text>
          </Button>
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
