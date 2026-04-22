import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, University } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { FacultyCardList } from '../components/FacultyCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { FacultySummary } from '../types/faculty.types'
import { listFacultiesByInstitution } from '../api/facultiesApi'

const InstitutionFaculties = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const [faculties, setFaculties] = useState<readonly FacultySummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const institutionId = getUserInstitutionId()

  const searchableFaculties = faculties.map((faculty) => ({
    ...faculty,
    searchName: faculty.name ?? '',
    searchDescription: faculty.description ?? '',
  }))

  const filteredFaculties = useSearchFilter(searchableFaculties, searchQuery, [
    'searchName',
    'searchDescription',
  ]).map((faculty) => ({
    id: faculty.id,
    name: faculty.name,
    description: faculty.description,
  }))

  const handleCreateFaculty = () => {
    navigate('/institution_admin/faculties/create')
  }

  const handleOpenFaculty = (facultyId: string) => {
    void facultyId
    /* Placeholder until faculty detail route exists */
  }

  useEffect(() => {
    if (!institutionId) {
      setFaculties([])
      return
    }

    let isCancelled = false

    const loadFaculties = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const rows = await listFacultiesByInstitution(institutionId)
        if (!isCancelled) {
          setFaculties(rows)
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load faculties')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadFaculties()

    return () => {
      isCancelled = true
    }
  }, [institutionId])

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div>
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('faculties.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.subtitle')}
            </Text>
          </div>

          <div className="flex justify-end">
            <Button
              variant="darkblue"
              type="button"
              className="gap-2"
              onClick={handleCreateFaculty}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.create')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label="Search faculties"
          placeholder="Search by name or description..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="max-w-xl"
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
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
          >
            {loadError}
          </Text>
        ) : filteredFaculties.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <University />
              </EmptyMedia>
              <EmptyTitle>No Faculties available </EmptyTitle>
              <EmptyDescription>Create or reset the filter to see faculties</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={handleCreateFaculty}
              >
                {t('faculties.create')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <FacultyCardList
            faculties={filteredFaculties}
            onOpenFaculty={handleOpenFaculty}
          />
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionFaculties }
