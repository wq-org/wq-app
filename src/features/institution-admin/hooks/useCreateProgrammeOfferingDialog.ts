import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { createProgrammeOffering } from '../api/programmeOfferingsApi'
import type {
  ProgrammeOfferingRecord,
  ProgrammeOfferingStatus,
} from '../types/programme-offering.types'

type UseCreateProgrammeOfferingDialogParams = {
  institutionId: string | null
  programmeId: string
  onCreated: (offering: ProgrammeOfferingRecord) => void
}

export function useCreateProgrammeOfferingDialog({
  institutionId,
  programmeId,
  onCreated,
}: UseCreateProgrammeOfferingDialogParams) {
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear())
  const [termCode, setTermCode] = useState<string>('')
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setAcademicYear(new Date().getFullYear())
    setTermCode('')
    setStatus('active')
    setDateRange(undefined)
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!institutionId || !programmeId) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createProgrammeOffering({
        institution_id: institutionId,
        programme_id: programmeId,
        academic_year: academicYear,
        term_code: termCode.trim() || null,
        status,
        starts_at: dateRange?.from ? dateRange.from.toISOString() : null,
        ends_at: dateRange?.to ? dateRange.to.toISOString() : null,
      })
      onCreated(created)
      resetForm()
      return true
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to create programme offering',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    academicYear,
    setAcademicYear,
    termCode,
    setTermCode,
    status,
    setStatus,
    dateRange,
    setDateRange,
    isSubmitting,
    error,
    resetForm,
    handleSubmit,
  }
}
