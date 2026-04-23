import { useState, useEffect } from 'react'
import {
  bootstrapInstitutionFromWizard,
  createInstitution,
  fetchInstitutions,
  resendInstitutionAdminInviteEmail,
  updateInstitution,
} from '../api/institutionApi'
import type {
  BootstrapInstitutionFromWizardResult,
  Institution,
  InstitutionFormData,
  InstitutionUpdateValues,
  NewInstitutionWizardValues,
} from '../types/institution.types'

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInstitutions()
      .then(setInstitutions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const addInstitution = async (data: InstitutionFormData): Promise<Institution> => {
    const institution = await createInstitution(data)
    setInstitutions((prev) => [institution, ...prev])
    return institution
  }

  const addInstitutionFromWizard = async (
    values: NewInstitutionWizardValues,
  ): Promise<BootstrapInstitutionFromWizardResult> => {
    const result = await bootstrapInstitutionFromWizard(values)
    setInstitutions((prev) => [result.institution, ...prev])
    return result
  }

  const editInstitution = async (
    institutionId: string,
    values: InstitutionUpdateValues,
  ): Promise<Institution> => {
    const updated = await updateInstitution(institutionId, values)
    setInstitutions((prev) => prev.map((item) => (item.id === institutionId ? updated : item)))
    return updated
  }

  const resendInviteEmail = async (institutionId: string): Promise<void> => {
    await resendInstitutionAdminInviteEmail(institutionId)
  }

  return {
    institutions,
    isLoading,
    error,
    addInstitution,
    addInstitutionFromWizard,
    editInstitution,
    resendInviteEmail,
  }
}
