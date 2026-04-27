import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, University } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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
import { createFaculty } from '../api/facultiesApi'
import { CreateFacultyDialog } from '../components/CreateFacultyDialog'
import { FacultyCardList } from '../components/FacultyCardList'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFaculties } from '../hooks/useFaculties'

const InstitutionFaculties = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [facultyName, setFacultyName] = useState('')
  const [facultyDescription, setFacultyDescription] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { faculties, isLoading, error: loadError, reload } = useFaculties(institutionId)

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

  const resetCreateForm = () => {
    setFacultyName('')
    setFacultyDescription('')
    setValidationError(null)
  }

  const handleOpenCreateDialog = () => {
    resetCreateForm()
    setIsCreateDialogOpen(true)
  }

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      resetCreateForm()
    }
  }

  const handleSubmitCreateFaculty = async () => {
    const trimmedName = facultyName.trim()
    if (!trimmedName) {
      setValidationError(t('faculties.createDialog.validation.nameRequired'))
      return
    }
    if (!institutionId) {
      toast.error(t('faculties.createDialog.errorNoInstitution'))
      return
    }

    setValidationError(null)
    setIsCreating(true)
    try {
      await createFaculty({
        institution_id: institutionId,
        name: trimmedName,
        description: facultyDescription.trim() || null,
      })
      setIsCreateDialogOpen(false)
      resetCreateForm()
      reload()
    } catch (createError) {
      toast.error(
        createError instanceof Error
          ? createError.message
          : t('faculties.createDialog.errorGeneric'),
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenFaculty = (facultyId: string) => {
    navigate(`/institution_admin/faculties/${facultyId}/programmes`)
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <CreateFacultyDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
        name={facultyName}
        onNameChange={setFacultyName}
        description={facultyDescription}
        onDescriptionChange={setFacultyDescription}
        validationError={validationError}
        isSubmitting={isCreating}
        onSubmit={() => void handleSubmitCreateFaculty()}
      />
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
              onClick={handleOpenCreateDialog}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.createFaculty')}</Text>
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
                onClick={handleOpenCreateDialog}
              >
                {t('faculties.createFaculty')}
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
