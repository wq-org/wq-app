import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, addMonths, format, isSameDay } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

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

import { useEditCohortOfferingDialog } from '../hooks/useEditCohortOfferingDialog'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

type EditCohortOfferingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  programmeId: string
  offering: CohortOfferingRecord | null
  onUpdated: (offering: CohortOfferingRecord) => void
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

export function EditCohortOfferingDialog({
  open,
  onOpenChange,
  programmeId,
  offering,
  onUpdated,
}: EditCohortOfferingDialogProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const [startsAtOpen, setStartsAtOpen] = useState(false)
  const [endsAtOpen, setEndsAtOpen] = useState(false)

  const {
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
  } = useEditCohortOfferingDialog({ programmeId, offering, open, onUpdated })

  const programmeOfferingLabels = useMemo(
    () => programmeOfferings.map((po) => formatProgrammeOfferingLabel(po, i18n.language)),
    [i18n.language, programmeOfferings],
  )

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

  const validationError = useMemo(() => {
    if (!selectedProgrammeOfferingId) {
      return t('faculties.pages.cohortOfferings.createDialog.validation.programmeOfferingRequired')
    }
    return null
  }, [selectedProgrammeOfferingId, t])

  const canSubmit = Boolean(offering) && !validationError && !isSubmitting && !isLoading

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const handleSave = async () => {
    const ok = await handleSubmit()
    if (ok) {
      onOpenChange(false)
    }
  }

  const handleProgrammeOfferingSelect = (value: string | null) => {
    if (!value) {
      setSelectedProgrammeOfferingId('')
      return
    }
    const id = programmeOfferingIdByLabel.get(value)
    if (id) {
      setSelectedProgrammeOfferingId(id)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.cohortOfferings.editDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.cohortOfferings.editDialog.description')}
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
                    {(item: string) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </ComboboxItem>
                    )}
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
              </div>
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
            {t('faculties.pages.cohortOfferings.editDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('faculties.pages.cohortOfferings.editDialog.saving')
              : t('faculties.pages.cohortOfferings.editDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
