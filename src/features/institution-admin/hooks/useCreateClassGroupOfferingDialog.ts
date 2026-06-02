import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { createClassGroupOffering } from '../api/classGroupOfferingsApi'
import { listCohortOfferings } from '../api/cohortOfferingsApi'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'

type UseCreateClassGroupOfferingDialogParams = {
  institutionId: string | null
  cohortId: string
  classGroupId: string
  open: boolean
  onCreated: (offering: ClassGroupOfferingRecord) => void
}

export function useCreateClassGroupOfferingDialog({
  institutionId,
  cohortId,
  classGroupId,
  open,
  onCreated,
}: UseCreateClassGroupOfferingDialogParams) {
  const [cohortOfferings, setCohortOfferings] = useState<readonly CohortOfferingRecord[]>([])
  const [selectedCohortOfferingId, setSelectedCohortOfferingId] = useState<string>('')
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !cohortId) {
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const rows = await listCohortOfferings(cohortId)
        if (cancelled) return
        setCohortOfferings(rows)
        setSelectedCohortOfferingId((previous) => previous || rows[0]?.id || '')
      } catch (loadError) {
        if (!cancelled) {
          setCohortOfferings([])
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load cohort offerings',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, cohortId])

  const resetForm = () => {
    setSelectedCohortOfferingId('')
    setStatus('active')
    setDateRange(undefined)
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!institutionId || !classGroupId || !selectedCohortOfferingId) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createClassGroupOffering({
        institution_id: institutionId,
        cohort_offering_id: selectedCohortOfferingId,
        class_group_id: classGroupId,
        status,
        starts_at: dateRange?.from ? dateRange.from.toISOString() : null,
        ends_at: dateRange?.to ? dateRange.to.toISOString() : null,
      })
      onCreated(created)
      resetForm()
      return true
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to create class group offering',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    cohortOfferings,
    selectedCohortOfferingId,
    setSelectedCohortOfferingId,
    status,
    setStatus,
    dateRange,
    setDateRange,
    isLoading,
    isSubmitting,
    error,
    resetForm,
    handleSubmit,
  }
}
