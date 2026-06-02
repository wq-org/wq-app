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

import { useCreateClassGroupOfferingDialog } from '../hooks/useCreateClassGroupOfferingDialog'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'

type CreateClassGroupOfferingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string | null
  cohortId: string
  classGroupId: string
  onCreated: (offering: ClassGroupOfferingRecord) => void
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

function formatCohortOfferingLabel(offering: CohortOfferingRecord, locale: string): string {
  const dateLocale = locale.startsWith('de') ? de : enUS
  const formatStr = 'd. MMMM yyyy'
  const parts: string[] = []
  if (offering.programme_offering) {
    parts.push(String(offering.programme_offering.academic_year))
    if (offering.programme_offering.term_code) {
      parts.push(offering.programme_offering.term_code)
    }
  }
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
  return parts.length > 0 ? parts.join(' · ') : offering.id
}

export function CreateClassGroupOfferingDialog({
  open,
  onOpenChange,
  institutionId,
  cohortId,
  classGroupId,
  onCreated,
}: CreateClassGroupOfferingDialogProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const [startsAtOpen, setStartsAtOpen] = useState(false)
  const [endsAtOpen, setEndsAtOpen] = useState(false)

  const {
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
  } = useCreateClassGroupOfferingDialog({
    institutionId,
    cohortId,
    classGroupId,
    open,
    onCreated,
  })

  const cohortOfferingLabels = useMemo(
    () => cohortOfferings.map((co) => formatCohortOfferingLabel(co, i18n.language)),
    [cohortOfferings, i18n.language],
  )

  const cohortOfferingIdByLabel = useMemo(() => {
    const map = new Map<string, string>()
    cohortOfferings.forEach((co, index) => {
      map.set(cohortOfferingLabels[index], co.id)
    })
    return map
  }, [cohortOfferingLabels, cohortOfferings])

  const selectedCohortOfferingLabel = useMemo(() => {
    const index = cohortOfferings.findIndex((co) => co.id === selectedCohortOfferingId)
    return index >= 0 ? cohortOfferingLabels[index] : ''
  }, [cohortOfferingLabels, cohortOfferings, selectedCohortOfferingId])

  const validationError = useMemo(() => {
    if (!selectedCohortOfferingId) {
      return t('faculties.pages.classGroupOfferings.createDialog.validation.cohortOfferingRequired')
    }
    return null
  }, [selectedCohortOfferingId, t])

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

  const handleCohortOfferingSelect = (value: string | null) => {
    if (!value) {
      setSelectedCohortOfferingId('')
      return
    }
    const id = cohortOfferingIdByLabel.get(value)
    if (id) {
      setSelectedCohortOfferingId(id)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.classGroupOfferings.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.classGroupOfferings.createDialog.description')}
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
                {t('faculties.pages.classGroupOfferings.createDialog.fields.cohortOfferingLabel')}
              </Label>
              <Combobox
                value={selectedCohortOfferingLabel || null}
                onValueChange={handleCohortOfferingSelect}
                items={cohortOfferingLabels}
                itemToStringLabel={(item) => String(item)}
                filter={(item, query) =>
                  String(item).toLowerCase().includes(query.trim().toLowerCase())
                }
                autoHighlight
              >
                <ComboboxInput
                  placeholder={t(
                    'faculties.pages.classGroupOfferings.createDialog.fields.cohortOfferingPlaceholder',
                  )}
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {t(
                      'faculties.pages.classGroupOfferings.createDialog.fields.cohortOfferingEmpty',
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
                  {t('faculties.pages.classGroupOfferings.createDialog.fields.startsAtLabel')}
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
                          {t(
                            'faculties.pages.classGroupOfferings.createDialog.fields.datePlaceholder',
                          )}
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
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  {t('faculties.pages.classGroupOfferings.createDialog.fields.endsAtLabel')}
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
                          {t(
                            'faculties.pages.classGroupOfferings.createDialog.fields.datePlaceholder',
                          )}
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
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Switch
                checked={status === 'active'}
                onCheckedChange={(on) => setStatus(on ? 'active' : 'draft')}
              />
              <Label className="cursor-pointer">
                {status === 'active'
                  ? t('faculties.pages.classGroupOfferings.createDialog.fields.statusActive')
                  : t('faculties.pages.classGroupOfferings.createDialog.fields.statusDraft')}
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
            {t('faculties.pages.classGroupOfferings.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('faculties.pages.classGroupOfferings.createDialog.creating')
              : t('faculties.pages.classGroupOfferings.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
