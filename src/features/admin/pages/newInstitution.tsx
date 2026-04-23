import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useUser } from '@/contexts/user'
import type { NewInstitutionWizardValues } from '../types/institution.types'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { NewInstitutionWizard } from '../components/NewInstitutionWizard'
import { useInstitutions } from '../hooks/useInstitutions'

const NewInstitution = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { addInstitutionFromWizard } = useInstitutions()

  const role = getRole()

  const handleCreate = async (values: NewInstitutionWizardValues) => {
    try {
      const result = await addInstitutionFromWizard(values)
      toast.success(t('institutions.toasts.createSuccess'), {
        description: t('institutions.toasts.createSuccessDescription'),
      })
      return result
    } catch (err) {
      toast.error(t('institutions.toasts.createError'), {
        description: err instanceof Error ? err.message : t('institutions.toasts.unexpectedError'),
      })
      throw err
    }
  }

  const handleCancel = () => navigate(`/${role}/institution`)
  const handleFinished = () => navigate(`/${role}/institution`)

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col items-center gap-4 py-8">
        <NewInstitutionWizard
          onCreate={handleCreate}
          onCancel={handleCancel}
          onFinished={handleFinished}
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export { NewInstitution }
