import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, addMonths, format, isSameDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { CalendarWithPresets } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { updateProgrammeOffering } from '../api/programmeOfferingsApi'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { normalizeTermCode } from '../utils/termCode'
import { AcademicYearCombobox } from './AcademicYearCombobox'

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

type EditProgrammeOfferingsDraftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  offering: ProgrammeOfferingRecord | null
  onUpdated: (offering: ProgrammeOfferingRecord) => void
}

export function EditProgrammeOfferingsDraftDialog({
  open,
  onOpenChange,
  offering,
  onUpdated,
}: EditProgrammeOfferingsDraftDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear())
  const [termCode, setTermCode] = useState('')
  const [status, setStatus] = useState<ProgrammeOfferingRecord['status']>('draft')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [startsAtOpen, setStartsAtOpen] = useState(false)
  const [endsAtOpen, setEndsAtOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const seedFromOffering = () => {
    if (!offering) return
    setAcademicYear(offering.academic_year)
    setTermCode(offering.term_code ?? '')
    setStatus(offering.status)
    setDateRange({
      from: offering.starts_at ? new Date(offering.starts_at) : undefined,
      to: offering.ends_at ? new Date(offering.ends_at) : undefined,
    })
    setError(null)
  }

  useEffect(() => {
    if (!open || !offering) return
    seedFromOffering()
  }, [open, offering?.id])

  const validationError = useMemo(() => {
    if (!Number.isFinite(academicYear)) {
      return t('faculties.pages.programmeOfferings.createDialog.validation.academicYearRequired')
    }
    return null
  }, [academicYear, t])

  const handleSave = async () => {
    if (!offering || validationError) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await updateProgrammeOffering({
        offeringId: offering.id,
        academic_year: academicYear,
        term_code: termCode.trim() || null,
        status,
        starts_at: dateRange?.from ? dateRange.from.toISOString() : null,
        ends_at: dateRange?.to ? dateRange.to.toISOString() : null,
      })
      onUpdated(updated)
      onOpenChange(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update draft offering')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit draft offering</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.programmeOfferings.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label>
              {t('faculties.pages.programmeOfferings.createDialog.fields.academicYearLabel')}
            </Label>
            <AcademicYearCombobox
              value={academicYear}
              onValueChange={setAcademicYear}
              placeholder={t(
                'faculties.pages.programmeOfferings.createDialog.fields.academicYearPlaceholder',
              )}
              className="self-start"
            />
          </div>

          <FieldInput
            label={t('faculties.pages.programmeOfferings.createDialog.fields.termCodeLabel')}
            placeholder={t(
              'faculties.pages.programmeOfferings.createDialog.fields.termCodePlaceholder',
            )}
            value={termCode}
            onValueChange={(raw) => setTermCode(normalizeTermCode(raw))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>
                {t('faculties.pages.programmeOfferings.createDialog.fields.startsAtLabel')}
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
                          'faculties.pages.programmeOfferings.createDialog.fields.datePlaceholder',
                        )}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
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
                          date && dateRange?.to && dateRange.to < date ? undefined : dateRange?.to,
                      })
                      setStartsAtOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                {t('faculties.pages.programmeOfferings.createDialog.fields.endsAtLabel')}
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
                          'faculties.pages.programmeOfferings.createDialog.fields.datePlaceholder',
                        )}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  className="w-auto p-3"
                  align="start"
                >
                  <CalendarWithPresets
                    compact
                    value={dateRange?.to ?? dateRange?.from ?? new Date()}
                    disabled={dateRange?.from ? { before: dateRange.from } : undefined}
                    onChange={(date) => {
                      setDateRange({
                        from: dateRange?.from,
                        to: mapEndDatePresetToStartDate(date, dateRange?.from),
                      })
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
                ? t('faculties.pages.programmeOfferings.createDialog.fields.statusActive')
                : t('faculties.pages.programmeOfferings.createDialog.fields.statusDraft')}
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
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('faculties.pages.programmeOfferings.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSave}
            disabled={Boolean(validationError) || isSubmitting || !offering}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
