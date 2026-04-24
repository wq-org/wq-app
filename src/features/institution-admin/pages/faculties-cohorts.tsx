import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { listCohortsByInstitution } from '../api/cohortsApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import { CohortCardList } from '../components/CohortCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function InstitutionFacultiesCohorts() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()

  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const programmeMap = useMemo(() => {
    const map = new Map<string, ProgrammeRecord>()
    for (const p of programmes) map.set(p.id, p)
    return map
  }, [programmes])

  const items = useMemo(
    () =>
      cohorts.map((cohort) => ({
        cohort,
        programmeName:
          programmeMap.get(cohort.programme_id)?.name?.trim() ||
          t('faculties.pages.cohorts.card.unknownProgramme'),
      })),
    [cohorts, programmeMap, t],
  )

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchCohortName: row.cohort.name ?? '',
        searchCohortDescription: row.cohort.description ?? '',
        searchProgrammeName: row.programmeName,
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchCohortName',
    'searchCohortDescription',
    'searchProgrammeName',
  ]).map(({ cohort, programmeName }) => ({ cohort, programmeName }))

  const handleOpenCohort = (cohortId: string) => {
    const selected = filteredItems.find((item) => item.cohort.id === cohortId)
    if (!selected) return
    const programme = programmeMap.get(selected.cohort.programme_id)
    if (!programme) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(programme.faculty_id)}/programmes/${encodeURIComponent(programme.id)}/cohorts/${encodeURIComponent(cohortId)}`,
    )
  }

  const handleCreateStructure = () => {
    navigate('/institution_admin/faculties/create')
  }

  useEffect(() => {
    if (!institutionId) {
      setCohorts([])
      setProgrammes([])
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [cohortRows, programmeRows] = await Promise.all([
          listCohortsByInstitution(institutionId),
          listProgrammesByInstitution(institutionId),
        ])

        if (cancelled) return

        setProgrammes(programmeRows)
        setCohorts(cohortRows)
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : t('faculties.pages.cohorts.loadError'),
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
  }, [institutionId, t])

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('faculties.pages.cohorts.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.cohorts.subtitle')}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={handleCreateStructure}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.create')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('faculties.pages.cohorts.searchLabel')}
          placeholder={t('faculties.pages.cohorts.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="max-w-xl animate-in fade-in-0 slide-in-from-bottom-2"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center animate-in fade-in-0 slide-in-from-bottom-2">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : loadError ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            className="animate-in fade-in-0 slide-in-from-bottom-2"
          >
            {loadError}
          </Text>
        ) : cohorts.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            {t('faculties.pages.cohorts.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className="animate-in fade-in-0 slide-in-from-bottom-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.cohorts.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('faculties.pages.cohorts.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2">
            <CohortCardList
              items={filteredItems}
              onOpenCohort={handleOpenCohort}
            />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
