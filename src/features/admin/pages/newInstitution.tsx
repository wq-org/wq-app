import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboardLayout from '@/features/admin/components/AdminDashboardLayout'
import InstitutionInformationForm from '../components/InstitutionInformationForm'
import { createInstitution } from '../api/institutionApi'
import { useUser } from '@/contexts/user'
import Spinner from '@/components/ui/spinner'
import type { InstitutionFormData } from '../types/institution.types'

export default function NewInstitution() {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const role = getRole()

  const handleSubmit = async (data: InstitutionFormData) => {
    setLoading(true)
    setError(null)
    try {
      await createInstitution(data)
      navigate(`/${role}/institution`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create institution')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/${role}/institution`)
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col items-center gap-4 py-8">
        {error && (
          <div
            role="alert"
            className="w-full max-w-3xl rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <InstitutionInformationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </AdminDashboardLayout>
  )
}
