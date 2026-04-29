import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { createCohortOffering, listCohortOfferings } from '../api/cohortOfferingsApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type {
  ProgrammeOfferingRecord,
  ProgrammeOfferingStatus,
} from '../types/programme-offering.types'

type UseCreateCohortOfferingDialogParams = {
  institutionId: string | null
  programmeId: string
  cohortId: string
  open: boolean
  onCreated: (offering: CohortOfferingRecord) => void
}

export function useCreateCohortOfferingDialog({
  institutionId,
  programmeId,
  cohortId,
  open,
  onCreated,
}: UseCreateCohortOfferingDialogParams) {
  const [programmeOfferings, setProgrammeOfferings] = useState<readonly ProgrammeOfferingRecord[]>(
    [],
  )
  const [selectedProgrammeOfferingId, setSelectedProgrammeOfferingId] = useState<string>('')
  const [status, setStatus] = useState<ProgrammeOfferingStatus>('active')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkedProgrammeOfferingIds, setLinkedProgrammeOfferingIds] = useState<ReadonlySet<string>>(
    new Set(),
  )

  useEffect(() => {
    if (!open || !programmeId || !cohortId) {
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [rows, cohortOfferingRows] = await Promise.all([
          listProgrammeOfferings(programmeId),
          listCohortOfferings(cohortId),
        ])
        if (cancelled) return

        const linked = new Set(cohortOfferingRows.map((r) => r.programme_offering_id))
        setLinkedProgrammeOfferingIds(linked)
        setProgrammeOfferings(rows)

        const isSelectable = (po: ProgrammeOfferingRecord) =>
          po.status !== 'archived' && !linked.has(po.id)

        setSelectedProgrammeOfferingId((previous) => {
          if (previous && rows.some((p) => p.id === previous && isSelectable(p))) {
            return previous
          }
          return rows.find(isSelectable)?.id ?? ''
        })
      } catch (loadError) {
        if (!cancelled) {
          setProgrammeOfferings([])
          setLinkedProgrammeOfferingIds(new Set())
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
  }, [open, programmeId, cohortId])

  const resetForm = () => {
    setSelectedProgrammeOfferingId('')
    setStatus('active')
    setDateRange(undefined)
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!institutionId || !cohortId || !selectedProgrammeOfferingId) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createCohortOffering({
        institution_id: institutionId,
        programme_offering_id: selectedProgrammeOfferingId,
        cohort_id: cohortId,
        status,
        starts_at: dateRange?.from ? dateRange.from.toISOString() : null,
        ends_at: dateRange?.to ? dateRange.to.toISOString() : null,
      })

      const matchedProgrammeOffering = programmeOfferings.find(
        (po) => po.id === selectedProgrammeOfferingId,
      )
      const decorated: CohortOfferingRecord = matchedProgrammeOffering
        ? {
            ...created,
            programme_offering: {
              academic_year: matchedProgrammeOffering.academic_year,
              term_code: matchedProgrammeOffering.term_code,
            },
          }
        : created

      onCreated(decorated)
      resetForm()
      return true
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to create cohort offering',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    programmeOfferings,
    linkedProgrammeOfferingIds,
    selectedProgrammeOfferingId,
    setSelectedProgrammeOfferingId,
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
