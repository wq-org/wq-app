import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, addMonths, format, isSameDay } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { CalendarIcon, CalendarSync, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { CalendarWithPresets } from '@/components/shared'

import { useCreateCohortOfferingDialog } from '../hooks/useCreateCohortOfferingDialog'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

type CreateCohortOfferingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string | null
  programmeId: string
  cohortId: string
  onCreated: (offering: CohortOfferingRecord) => void
}

const END_DATE_PRESET_OFFSETS = [
  { kind: 'days' as const, value: 0 },
  { kind: 'days' as const, value: 1 },
  { kind: 'days' as const, value: 3 },
  { kind: 'days' as const, value: 7 },
  { kind: 'days' as const, value: 14 },
  { kind: 'months' as const, value: 3 },
  { kind: 'months' as const, value: 6 },
]

const getDateWithOffset = (baseDate: Date, offset: (typeof END_DATE_PRESET_OFFSETS)[number]) =>
  offset.kind === 'days' ? addDays(baseDate, offset.value) : addMonths(baseDate, offset.value)

const mapEndDatePresetToStartDate = (
  selectedDate: Date | undefined,
  startDate: Date | undefined,
) => {
  if (!selectedDate || !startDate) return selectedDate
  const today = new Date()
  const matched = END_DATE_PRESET_OFFSETS.find((offset) =>
    isSameDay(selectedDate, getDateWithOffset(today, offset)),
  )
  return matched ? getDateWithOffset(startDate, matched) : selectedDate
}

type ProgrammeOfferingDateWindow =
  | { kind: 'no_selection' }
  | { kind: 'no_po_dates' }
  | { kind: 'window'; fromLabel: string; toLabel: string }

function formatProgrammeOfferingLabel(offering: ProgrammeOfferingRecord, locale: string): string {
  const dateLocale = locale.startsWith('de') ? de : enUS
  const formatStr = 'd. MMMM yyyy'
  const parts: string[] = [String(offering.academic_year)]
  if (offering.term_code) parts.push(offering.term_code)
  parts.push(offering.status)
  if (offering.starts_at || offering.ends_at) {
    const startLabel = offering.starts_at
      ? format(new Date(offering.starts_at), formatStr, { locale: dateLocale })
      : '–'
    const endLabel = offering.ends_at
      ? format(new Date(offering.ends_at), formatStr, { locale: dateLocale })
      : '–'
    parts.push(`${startLabel} – ${endLabel}`)
  }
  return parts.join(' · ')
}

function programmeOfferingDateHintText(
  window: ProgrammeOfferingDateWindow,
  role: 'starts' | 'ends',
  t: (key: string, options?: Record<string, string>) => string,
): string {
  switch (window.kind) {
    case 'no_selection':
      return t(
        'faculties.pages.cohortOfferings.createDialog.fields.selectProgrammeOfferingForDateHints',
      )
    case 'no_po_dates':
      return t('faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingDatesNotSet')
    case 'window': {
      const key =
        role === 'starts'
          ? 'faculties.pages.cohortOfferings.createDialog.fields.startsAtProgrammeOfferingHint'
          : 'faculties.pages.cohortOfferings.createDialog.fields.endsAtProgrammeOfferingHint'
      return t(key, { from: window.fromLabel, to: window.toLabel })
    }
  }
}

export function CreateCohortOfferingDialog({
  open,
  onOpenChange,
  institutionId,
  programmeId,
  cohortId,
  onCreated,
}: CreateCohortOfferingDialogProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const [startsAtOpen, setStartsAtOpen] = useState(false)
  const [endsAtOpen, setEndsAtOpen] = useState(false)

  const {
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
  } = useCreateCohortOfferingDialog({ institutionId, programmeId, cohortId, open, onCreated })

  const programmeOfferingLabels = useMemo(
    () =>
      programmeOfferings.map((po) => {
        const base = formatProgrammeOfferingLabel(po, i18n.language)
        if (po.status === 'archived') {
          return `${base} (${t('faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingArchivedSuffix')})`
        }
        if (linkedProgrammeOfferingIds.has(po.id)) {
          return `${base} (${t('faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingAlreadyLinkedSuffix')})`
        }
        return base
      }),
    [i18n.language, programmeOfferings, linkedProgrammeOfferingIds, t],
  )

  const isProgrammeOfferingOptionDisabled = (po: ProgrammeOfferingRecord) =>
    po.status === 'archived' || linkedProgrammeOfferingIds.has(po.id)

  const programmeOfferingIdByLabel = useMemo(() => {
    const map = new Map<string, string>()
    programmeOfferings.forEach((po, index) => {
      map.set(programmeOfferingLabels[index], po.id)
    })
    return map
  }, [programmeOfferingLabels, programmeOfferings])

  const selectedProgrammeOfferingLabel = useMemo(() => {
    const index = programmeOfferings.findIndex((po) => po.id === selectedProgrammeOfferingId)
    return index >= 0 ? programmeOfferingLabels[index] : ''
  }, [programmeOfferingLabels, programmeOfferings, selectedProgrammeOfferingId])

  const selectedProgrammeOffering = useMemo(
    () =>
      selectedProgrammeOfferingId
        ? (programmeOfferings.find((p) => p.id === selectedProgrammeOfferingId) ?? null)
        : null,
    [programmeOfferings, selectedProgrammeOfferingId],
  )

  const canApplyProgrammeOfferingDates = Boolean(
    selectedProgrammeOffering?.starts_at ?? selectedProgrammeOffering?.ends_at,
  )

  const programmeOfferingDateWindow = useMemo((): ProgrammeOfferingDateWindow => {
    if (!selectedProgrammeOffering) {
      return { kind: 'no_selection' }
    }
    const po = selectedProgrammeOffering
    if (!po.starts_at && !po.ends_at) {
      return { kind: 'no_po_dates' }
    }
    const dateLocale = i18n.language.startsWith('de') ? de : enUS
    const formatStr = 'd. MMMM yyyy'
    const fromLabel = po.starts_at
      ? format(new Date(po.starts_at), formatStr, { locale: dateLocale })
      : '—'
    const toLabel = po.ends_at
      ? format(new Date(po.ends_at), formatStr, { locale: dateLocale })
      : '—'
    return { kind: 'window', fromLabel, toLabel }
  }, [selectedProgrammeOffering, i18n.language])

  const startsAtProgrammeOfferingHint = useMemo(
    () => programmeOfferingDateHintText(programmeOfferingDateWindow, 'starts', t),
    [programmeOfferingDateWindow, t],
  )

  const endsAtProgrammeOfferingHint = useMemo(
    () => programmeOfferingDateHintText(programmeOfferingDateWindow, 'ends', t),
    [programmeOfferingDateWindow, t],
  )

  const selectableProgrammeOfferings = useMemo(
    () =>
      programmeOfferings.filter(
        (po) => po.status !== 'archived' && !linkedProgrammeOfferingIds.has(po.id),
      ),
    [programmeOfferings, linkedProgrammeOfferingIds],
  )

  const validationError = useMemo(() => {
    if (programmeOfferings.length > 0 && selectableProgrammeOfferings.length === 0) {
      return t(
        'faculties.pages.cohortOfferings.createDialog.validation.noSelectableProgrammeOffering',
      )
    }
    if (!selectedProgrammeOfferingId) {
      return t('faculties.pages.cohortOfferings.createDialog.validation.programmeOfferingRequired')
    }
    return null
  }, [
    programmeOfferings.length,
    selectableProgrammeOfferings.length,
    selectedProgrammeOfferingId,
    t,
  ])

  const canSubmit = !validationError && !isSubmitting && !isLoading

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  const handleCreate = async () => {
    const created = await handleSubmit()
    if (created) {
      onOpenChange(false)
    }
  }

  const handleProgrammeOfferingSelect = (value: string | null) => {
    if (!value) {
      setSelectedProgrammeOfferingId('')
      return
    }
    const id = programmeOfferingIdByLabel.get(value)
    const po = id ? programmeOfferings.find((p) => p.id === id) : undefined
    if (id && po && !isProgrammeOfferingOptionDisabled(po)) {
      setSelectedProgrammeOfferingId(id)
    }
  }

  const handleApplyProgrammeOfferingDates = () => {
    if (!selectedProgrammeOffering) return
    const from = selectedProgrammeOffering.starts_at
      ? new Date(selectedProgrammeOffering.starts_at)
      : undefined
    const to = selectedProgrammeOffering.ends_at
      ? new Date(selectedProgrammeOffering.ends_at)
      : undefined
    setDateRange({ from, to })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.cohortOfferings.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.cohortOfferings.createDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>
                {t('faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingLabel')}
              </Label>
              <Combobox
                value={selectedProgrammeOfferingLabel || null}
                onValueChange={handleProgrammeOfferingSelect}
                items={programmeOfferingLabels}
                itemToStringLabel={(item) => String(item)}
                filter={(item, query) =>
                  String(item).toLowerCase().includes(query.trim().toLowerCase())
                }
                autoHighlight
              >
                <ComboboxInput
                  placeholder={t(
                    'faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingPlaceholder',
                  )}
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {t(
                      'faculties.pages.cohortOfferings.createDialog.fields.programmeOfferingEmpty',
                    )}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => {
                      const id = programmeOfferingIdByLabel.get(item)
                      const po = id ? programmeOfferings.find((p) => p.id === id) : undefined
                      const disabled = po ? isProgrammeOfferingOptionDisabled(po) : false
                      return (
                        <ComboboxItem
                          key={item}
                          value={item}
                          disabled={disabled}
                        >
                          {item}
                        </ComboboxItem>
                      )
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  {t('faculties.pages.cohortOfferings.createDialog.fields.startsAtLabel')}
                </Label>
                <Popover
                  open={startsAtOpen}
                  onOpenChange={setStartsAtOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
                      {dateRange?.from ? (
                        format(dateRange.from, 'MMM d, yyyy')
                      ) : (
                        <span className="text-muted-foreground">
                          {t('faculties.pages.cohortOfferings.createDialog.fields.datePlaceholder')}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-3"
                    align="start"
                  >
                    <CalendarWithPresets
                      compact
                      value={dateRange?.from}
                      onChange={(date) => {
                        setDateRange({
                          from: date,
                          to:
                            date && dateRange?.to && dateRange.to < date
                              ? undefined
                              : dateRange?.to,
                        })
                        setStartsAtOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <Info
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span>{startsAtProgrammeOfferingHint}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  {t('faculties.pages.cohortOfferings.createDialog.fields.endsAtLabel')}
                </Label>
                <Popover
                  open={endsAtOpen}
                  onOpenChange={setEndsAtOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
                      {dateRange?.to ? (
                        format(dateRange.to, 'MMM d, yyyy')
                      ) : (
                        <span className="text-muted-foreground">
                          {t('faculties.pages.cohortOfferings.createDialog.fields.datePlaceholder')}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-3"
                    align="start"
                  >
                    <CalendarWithPresets
                      compact
                      value={dateRange?.to ?? dateRange?.from ?? new Date()}
                      disabled={dateRange?.from ? { before: dateRange.from } : undefined}
                      onChange={(date) => {
                        const resolved = mapEndDatePresetToStartDate(date, dateRange?.from)
                        setDateRange({ from: dateRange?.from, to: resolved })
                        setEndsAtOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <Info
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span>{endsAtProgrammeOfferingHint}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="teal"
                size="sm"
                disabled={!canApplyProgrammeOfferingDates}
                onClick={handleApplyProgrammeOfferingDates}
              >
                <CalendarSync />
                {t(
                  'faculties.pages.cohortOfferings.createDialog.fields.applyProgrammeOfferingDates',
                )}
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Switch
                checked={status === 'active'}
                onCheckedChange={(on) => setStatus(on ? 'active' : 'draft')}
              />
              <Label className="cursor-pointer">
                {status === 'active'
                  ? t('faculties.pages.cohortOfferings.createDialog.fields.statusActive')
                  : t('faculties.pages.cohortOfferings.createDialog.fields.statusDraft')}
              </Label>
            </div>

            {validationError ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {validationError}
              </Text>
            ) : null}

            {error ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {error}
              </Text>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            {t('faculties.pages.cohortOfferings.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('faculties.pages.cohortOfferings.createDialog.creating')
              : t('faculties.pages.cohortOfferings.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
