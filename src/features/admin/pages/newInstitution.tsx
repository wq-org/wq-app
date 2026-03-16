import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { InstitutionInformationForm } from '../components/InstitutionInformationForm'
import { createInstitution } from '../api/institutionApi'
import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'
import type { InstitutionFormData } from '../types/institution.types'

const NewInstitution = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const [loading, setLoading] = useState(false)

  const role = getRole()

  const handleSubmit = async (data: InstitutionFormData) => {
    setLoading(true)
    try {
      await createInstitution(data)
      toast.success('Institution Created', {
        description: 'The institution has been created successfully.',
      })
      navigate(`/${role}/institution`)
    } catch (err) {
      toast.error('Failed to Create Institution', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/${role}/institution`)
  }

  if (loading) {
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
