import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { ClassGroupCardList } from '../components/ClassGroupCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultiesClassGroups } from '../hooks/useFacultiesClassGroups'
import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function InstitutionFacultiesClassGroups() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')

  const {
    classGroups,
    cohorts,
    programmes,
    isLoading,
    error: loadError,
  } = useFacultiesClassGroups(institutionId)

  const cohortMap = useMemo(() => {
    const map = new Map<string, CohortRecord>()
    for (const c of cohorts) map.set(c.id, c)
    return map
  }, [cohorts])

  const programmeMap = useMemo(() => {
    const map = new Map<string, ProgrammeRecord>()
    for (const p of programmes) map.set(p.id, p)
    return map
  }, [programmes])

  const items = useMemo(
    () =>
      classGroups.map((classGroup) => ({
        classGroup,
        cohortName:
          cohortMap.get(classGroup.cohort_id)?.name?.trim() ||
          t('faculties.pages.classGroups.card.unknownCohort'),
      })),
    [classGroups, cohortMap, t],
  )

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchClassGroupName: row.classGroup.name ?? '',
        searchClassGroupDescription: row.classGroup.description ?? '',
        searchCohortName: row.cohortName,
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchClassGroupName',
    'searchClassGroupDescription',
    'searchCohortName',
  ]).map(({ classGroup, cohortName }) => ({ classGroup, cohortName }))

  const handleOpenClassGroup = (classGroupId: string) => {
    const selected = filteredItems.find((item) => item.classGroup.id === classGroupId)
    if (!selected) return
    const cohort = cohortMap.get(selected.classGroup.cohort_id)
    if (!cohort) return
    const programme = programmeMap.get(cohort.programme_id)
    if (!programme) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(programme.faculty_id)}/programmes/${encodeURIComponent(programme.id)}/cohorts/${encodeURIComponent(cohort.id)}/class-groups/${encodeURIComponent(classGroupId)}`,
    )
  }

  const handleCreateStructure = () => {
    navigate('/institution_admin/faculties/create')
  }

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
              {t('faculties.pages.classGroups.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.classGroups.subtitle')}
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
          label={t('faculties.pages.classGroups.searchLabel')}
          placeholder={t('faculties.pages.classGroups.searchPlaceholder')}
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
        ) : classGroups.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            {t('faculties.pages.classGroups.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className="animate-in fade-in-0 slide-in-from-bottom-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayoutGrid className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.classGroups.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('faculties.pages.classGroups.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2">
            <ClassGroupCardList
              items={filteredItems}
              onOpenClassGroup={handleOpenClassGroup}
            />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
