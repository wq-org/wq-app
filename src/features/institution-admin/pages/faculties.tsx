import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

import { FacultyList } from '../components/FacultyList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { FacultySummary } from '../types/faculty.types'

const MOCK_FACULTIES: readonly FacultySummary[] = []

const InstitutionFaculties = () => {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()

  const faculties = useMemo(() => MOCK_FACULTIES, [])

  const handleCreateFaculty = () => {
    navigate('/institution_admin/faculties/create')
  }

  const handleOpenFaculty = (facultyId: string) => {
    void facultyId
    /* Placeholder until faculty detail route exists */
  }

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

        <FacultyList
          faculties={faculties}
          onOpenFaculty={handleOpenFaculty}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionFaculties }
