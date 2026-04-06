import { useState, useEffect } from 'react'
import { fetchInstitutions, createInstitution } from '../api/institutionApi'
import type { Institution, InstitutionFormData } from '../types/institution.types'

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

  return { institutions, isLoading, error, addInstitution }
}
