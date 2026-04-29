import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { updateCohortOffering } from '../api/cohortOfferingsApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type {
  ProgrammeOfferingRecord,
  ProgrammeOfferingStatus,
} from '../types/programme-offering.types'

type UseEditCohortOfferingDialogParams = {
  programmeId: string
  offering: CohortOfferingRecord | null
  open: boolean
  onUpdated: (offering: CohortOfferingRecord) => void
}

export function useEditCohortOfferingDialog({
  programmeId,
  offering,
  open,
  onUpdated,
}: UseEditCohortOfferingDialogParams) {
  const [programmeOfferings, setProgrammeOfferings] = useState<readonly ProgrammeOfferingRecord[]>(
    [],
  )
  const [selectedProgrammeOfferingId, setSelectedProgrammeOfferingId] = useState<string>('')
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !programmeId) {
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const rows = await listProgrammeOfferings(programmeId)
        if (cancelled) return
        setProgrammeOfferings(rows)
      } catch (loadError) {
        if (!cancelled) {
          setProgrammeOfferings([])
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load programme offerings',
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
  }, [open, programmeId])

  useEffect(() => {
    if (!open || !offering) return
    setSelectedProgrammeOfferingId(offering.programme_offering_id)
    setStatus(offering.status === 'active' ? 'active' : 'draft')
    setDateRange({
      from: offering.starts_at ? new Date(offering.starts_at) : undefined,
      to: offering.ends_at ? new Date(offering.ends_at) : undefined,
    })
    setError(null)
  }, [open, offering])

  const handleSubmit = async (): Promise<boolean> => {
    if (!offering || !selectedProgrammeOfferingId) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const updated = await updateCohortOffering({
        offeringId: offering.id,
        programme_offering_id: selectedProgrammeOfferingId,
        status,
        starts_at: dateRange?.from ? dateRange.from.toISOString() : null,
        ends_at: dateRange?.to ? dateRange.to.toISOString() : null,
      })

      const matchedProgrammeOffering = programmeOfferings.find(
        (po) => po.id === selectedProgrammeOfferingId,
      )
      const decorated: CohortOfferingRecord = matchedProgrammeOffering
        ? {
            ...updated,
            programme_offering: {
              academic_year: matchedProgrammeOffering.academic_year,
              term_code: matchedProgrammeOffering.term_code,
            },
          }
        : updated

      onUpdated(decorated)
      return true
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to update cohort offering',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    programmeOfferings,
    selectedProgrammeOfferingId,
    setSelectedProgrammeOfferingId,
    status,
    setStatus,
    dateRange,
    setDateRange,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
  }
}
