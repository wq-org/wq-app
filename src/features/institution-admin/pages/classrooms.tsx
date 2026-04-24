import { useEffect, useMemo, useState } from 'react'
import { DoorOpen, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { listClassGroupsByInstitution } from '../api/classGroupsApi'
import { listClassroomsByInstitution } from '../api/classroomsApi'
import { ClassroomCardList } from '../components/ClassroomCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { ClassroomRecord } from '../types/classroom.types'

const contentEnter = 'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export function InstitutionClassrooms() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const [classrooms, setClassrooms] = useState<readonly ClassroomRecord[]>([])
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const classGroupNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of classGroups) {
      map.set(row.id, row.name?.trim() || '')
    }
    return map
  }, [classGroups])

  const searchableItems = useMemo(
    () =>
      classrooms.map((classroom) => {
        const classGroupName =
          classGroupNameById.get(classroom.class_group_id)?.trim() ||
          t('classrooms.card.unknownClassGroup')
        const statusLabel =
          classroom.status === 'active'
            ? t('classrooms.card.statusActive')
            : t('classrooms.card.statusInactive')
        return {
          classroom,
          classGroupName,
          searchTitle: classroom.title ?? '',
          searchGroup: classGroupName,
          searchStatus: statusLabel,
        }
      }),
    [classGroupNameById, classrooms, t],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchTitle',
    'searchGroup',
    'searchStatus',
  ]).map(({ classroom, classGroupName }) => ({ classroom, classGroupName }))

  const handleAddClassroom = () => {
    // Placeholder: create-classroom flow wired in a follow-up.
  }

  useEffect(() => {
    if (!institutionId) {
      setClassrooms([])
      setClassGroups([])
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [classroomRows, classGroupRows] = await Promise.all([
          listClassroomsByInstitution(institutionId),
          listClassGroupsByInstitution(institutionId),
        ])

        if (cancelled) return

        setClassrooms(classroomRows)
        setClassGroups(classGroupRows)
      } catch (error) {
        if (!cancelled) {
          setClassrooms([])
          setClassGroups([])
          setLoadError(error instanceof Error ? error.message : t('classrooms.loadError'))
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
              {t('classrooms.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('classrooms.subtitle')}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={handleAddClassroom}
            >
              <Plus className="size-4" />
              <Text as="span">{t('classrooms.addClassroom')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('classrooms.searchLabel')}
          placeholder={t('classrooms.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className={`max-w-xl ${contentEnter}`}
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
            className={contentEnter}
          >
            {loadError}
          </Text>
        ) : classrooms.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className={contentEnter}
          >
            {t('classrooms.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className={contentEnter}>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <DoorOpen className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('classrooms.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className={contentEnter}>
            <ClassroomCardList items={filteredItems} />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
