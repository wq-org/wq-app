import { useEffect, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { createProgrammeOffering, listProgrammeOfferings } from '../api/programmeOfferingsApi'
import type {
  ProgrammeOfferingRecord,
  ProgrammeOfferingStatus,
} from '../types/programme-offering.types'
import { clampAcademicYear, deriveSuggestedTermCode, normalizeTermCode } from '../utils/termCode'

type UseCreateProgrammeOfferingDialogParams = {
  open: boolean
  institutionId: string | null
  programmeId: string
  /** Programme title — used with {@link buildTermCode} to derive span codes (e.g. MD-2028/31). */
  programmeName?: string | null
  /** Standard duration in years; drives the end year segment of the suggested term code. */
  programmeDurationYears?: number | null
  onCreated: (offering: ProgrammeOfferingRecord) => void
}

function getNextAcademicYearFromOfferings(
  offerings: readonly ProgrammeOfferingRecord[],
  fallbackYear: number,
): number {
  const relevantOfferings = offerings.filter((offering) => offering.status !== 'archived')
  if (relevantOfferings.length === 0) return fallbackYear

  const maxKnownYear = relevantOfferings.reduce((maxYear, offering) => {
    const startsAtYear = offering.starts_at ? new Date(offering.starts_at).getFullYear() : null
    const candidateYear = Number.isFinite(startsAtYear)
      ? Number(startsAtYear)
      : offering.academic_year
    return Math.max(maxYear, candidateYear)
  }, fallbackYear - 1)

  return clampAcademicYear(maxKnownYear + 1)
}

export function useCreateProgrammeOfferingDialog({
  open,
  institutionId,
  programmeId,
  programmeName,
  programmeDurationYears,
  onCreated,
}: UseCreateProgrammeOfferingDialogParams) {
  const initialYear = clampAcademicYear(new Date().getFullYear())

  const [suggestedAcademicYear, setSuggestedAcademicYear] = useState<number>(initialYear)
  const [academicYear, setAcademicYear] = useState<number>(initialYear)
  const [termCode, setTermCodeState] = useState<string>(() =>
    deriveSuggestedTermCode(programmeName, initialYear, programmeDurationYears),
  )
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // While the user hasn't manually edited the term code, it tracks
  // deriveSuggestedTermCode(programmeName, academicYear, duration). The first manual edit
  // flips this off and the field becomes user-controlled.
  const isAutoDerivedRef = useRef(true)
  const prevProgrammeIdRef = useRef(programmeId)

  const setTermCode = (next: string) => {
    isAutoDerivedRef.current = false
    setTermCodeState(next)
  }

  useEffect(() => {
    if (!open || !institutionId || !programmeId) return
    let cancelled = false

    void (async () => {
      try {
        const existingOfferings = await listProgrammeOfferings(programmeId)
        if (cancelled) return

        const fallbackYear = clampAcademicYear(new Date().getFullYear())
        const nextAcademicYear = getNextAcademicYearFromOfferings(existingOfferings, fallbackYear)

        setSuggestedAcademicYear(nextAcademicYear)
        setAcademicYear(nextAcademicYear)
        if (isAutoDerivedRef.current) {
          setTermCodeState(
            deriveSuggestedTermCode(programmeName, nextAcademicYear, programmeDurationYears),
          )
        }
      } catch {
        if (!cancelled) {
          const fallbackYear = clampAcademicYear(new Date().getFullYear())
          setSuggestedAcademicYear(fallbackYear)
          setAcademicYear(fallbackYear)
          if (isAutoDerivedRef.current) {
            setTermCodeState(
              deriveSuggestedTermCode(programmeName, fallbackYear, programmeDurationYears),
            )
          }
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, institutionId, programmeId, programmeName, programmeDurationYears])

  useEffect(() => {
    if (prevProgrammeIdRef.current !== programmeId) {
      prevProgrammeIdRef.current = programmeId
      isAutoDerivedRef.current = true
    }
    if (!isAutoDerivedRef.current) return
    setTermCodeState(deriveSuggestedTermCode(programmeName, academicYear, programmeDurationYears))
  }, [programmeId, programmeName, academicYear, programmeDurationYears])

  const resetForm = () => {
    const y = suggestedAcademicYear
    isAutoDerivedRef.current = true
    prevProgrammeIdRef.current = programmeId
    setAcademicYear(y)
    setTermCodeState(deriveSuggestedTermCode(programmeName, y, programmeDurationYears))
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
      const resolvedTermCode = isAutoDerivedRef.current
        ? deriveSuggestedTermCode(programmeName, academicYear, programmeDurationYears)
        : normalizeTermCode(termCode)

      const created = await createProgrammeOffering({
        institution_id: institutionId,
        programme_id: programmeId,
        academic_year: academicYear,
        term_code: resolvedTermCode.trim() || null,
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
