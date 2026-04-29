import { useEffect, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { createProgrammeOffering } from '../api/programmeOfferingsApi'
import type {
  ProgrammeOfferingRecord,
  ProgrammeOfferingStatus,
} from '../types/programme-offering.types'
import { clampAcademicYear, deriveSuggestedTermCode } from '../utils/termCode'

type UseCreateProgrammeOfferingDialogParams = {
  institutionId: string | null
  programmeId: string
  /** Programme title — used with {@link buildTermCode} to derive `PREFIX-YEAR` (e.g. GVM-2026). */
  programmeName?: string | null
  onCreated: (offering: ProgrammeOfferingRecord) => void
}

export function useCreateProgrammeOfferingDialog({
  institutionId,
  programmeId,
  programmeName,
  onCreated,
}: UseCreateProgrammeOfferingDialogParams) {
  const initialYear = clampAcademicYear(new Date().getFullYear())

  const [academicYear, setAcademicYear] = useState<number>(initialYear)
  const [termCode, setTermCodeState] = useState<string>(() =>
    deriveSuggestedTermCode(programmeName, initialYear),
  )
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // While the user hasn't manually edited the term code, it tracks
  // buildTermCode(programmeName, academicYear). The first manual edit
  // flips this off and the field becomes user-controlled.
  const isAutoDerivedRef = useRef(true)
  const prevProgrammeIdRef = useRef(programmeId)

  const setTermCode = (next: string) => {
    isAutoDerivedRef.current = false
    setTermCodeState(next)
  }

  useEffect(() => {
    if (prevProgrammeIdRef.current !== programmeId) {
      prevProgrammeIdRef.current = programmeId
      isAutoDerivedRef.current = true
    }
    if (!isAutoDerivedRef.current) return
    setTermCodeState(deriveSuggestedTermCode(programmeName, academicYear))
  }, [programmeId, programmeName, academicYear])

  const resetForm = () => {
    const y = clampAcademicYear(new Date().getFullYear())
    isAutoDerivedRef.current = true
    prevProgrammeIdRef.current = programmeId
    setAcademicYear(y)
    setTermCodeState(deriveSuggestedTermCode(programmeName, y))
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
