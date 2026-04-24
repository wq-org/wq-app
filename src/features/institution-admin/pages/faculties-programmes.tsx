import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { FacultyProgrammeCardList } from '../components/FacultyProgrammeCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultiesProgrammes } from '../hooks/useFacultiesProgrammes'

export function InstitutionFacultiesProgrammes() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')

  const {
    programmes,
    facultyNames,
    isLoading,
    error: loadError,
  } = useFacultiesProgrammes(institutionId)

  const items = useMemo(() => {
    return programmes.map((programme) => ({
      programme,
      facultyName:
        facultyNames.get(programme.faculty_id) ??
        t('faculties.pages.programmes.card.unknownFaculty'),
    }))
  }, [programmes, facultyNames, t])

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchProgrammeName: row.programme.name ?? '',
        searchProgrammeDescription: row.programme.description ?? '',
        searchFacultyName: row.facultyName ?? '',
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchProgrammeName',
    'searchProgrammeDescription',
    'searchFacultyName',
  ]).map(({ programme, facultyName }) => ({ programme, facultyName }))

  const handleOpenProgramme = (facultyId: string, programmeId: string) => {
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(facultyId)}/programmes/${encodeURIComponent(programmeId)}`,
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
              {t('faculties.pages.programmes.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.programmes.subtitle')}
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
          label={t('faculties.pages.programmes.searchLabel')}
          placeholder={t('faculties.pages.programmes.searchPlaceholder')}
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
        ) : programmes.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            {t('faculties.pages.programmes.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className="animate-in fade-in-0 slide-in-from-bottom-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GraduationCap className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.programmes.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('faculties.pages.programmes.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2">
            <FacultyProgrammeCardList
              items={filteredItems}
              onOpenProgramme={(programmeId) => {
                const selected = filteredItems.find((item) => item.programme.id === programmeId)
                if (!selected) return
                handleOpenProgramme(selected.programme.faculty_id, programmeId)
              }}
            />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
