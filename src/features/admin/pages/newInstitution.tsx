import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'
import type { InstitutionFormData } from '../types/institution.types'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { InstitutionInformationForm } from '../components/InstitutionInformationForm'
import { useInstitutions } from '../hooks/useInstitutions'

const NewInstitution = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { addInstitution } = useInstitutions()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const role = getRole()

  const handleSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true)
    try {
      await addInstitution(data)
      toast.success(t('institutions.toasts.createSuccess'), {
        description: t('institutions.toasts.createSuccessDescription'),
      })
      navigate(`/${role}/institution`)
    } catch (err) {
      toast.error(t('institutions.toasts.createError'), {
        description: err instanceof Error ? err.message : t('institutions.toasts.unexpectedError'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate(`/${role}/institution`)

  if (isSubmitting) {
    return (
      <AdminWorkspaceShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      </AdminWorkspaceShell>
    )
  }

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col items-center gap-4 py-8">
        <InstitutionInformationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export { NewInstitution }
