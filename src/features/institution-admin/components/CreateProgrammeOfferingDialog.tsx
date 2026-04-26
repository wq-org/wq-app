import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, addMonths, format, isSameDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

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
import { cn } from '@/lib/utils'
import { CalendarWithPresets } from '@/components/shared'

import { useCreateProgrammeOfferingDialog } from '../hooks/useCreateProgrammeOfferingDialog'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { isValidTermCode, normalizeTermCode, yearRangeInclusive } from '../utils/termCode'
import { YearSelectPopover } from './YearSelectPopover'

type CreateProgrammeOfferingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string | null
  programmeId: string
  onCreated: (offering: ProgrammeOfferingRecord) => void
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

export function CreateProgrammeOfferingDialog({
  open,
  onOpenChange,
  institutionId,
  programmeId,
  onCreated,
}: CreateProgrammeOfferingDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const [startsAtOpen, setStartsAtOpen] = useState(false)
  const [endsAtOpen, setEndsAtOpen] = useState(false)

  const {
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
  } = useCreateProgrammeOfferingDialog({ institutionId, programmeId, onCreated })

  const academicYears = useMemo(() => yearRangeInclusive(1990, 2060), [])

  const validationError = useMemo(() => {
    if (!Number.isFinite(academicYear)) {
      return t('faculties.pages.programmeOfferings.createDialog.validation.academicYearRequired')
    }
    return null
  }, [academicYear, t])

  const canSubmit = !validationError && !isSubmitting

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

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.programmeOfferings.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.programmeOfferings.createDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label>
              {t('faculties.pages.programmeOfferings.createDialog.fields.academicYearLabel')}
            </Label>
            <YearSelectPopover
              label={t('faculties.pages.programmeOfferings.createDialog.fields.academicYearLabel')}
              value={academicYear}
              years={academicYears}
              onChange={setAcademicYear}
              className="w-auto self-start"
            />
          </div>

          <div className="flex flex-col gap-1">
            <FieldInput
              label={t('faculties.pages.programmeOfferings.createDialog.fields.termCodeLabel')}
              placeholder={t(
                'faculties.pages.programmeOfferings.createDialog.fields.termCodePlaceholder',
              )}
              value={termCode}
              onValueChange={(raw) => setTermCode(normalizeTermCode(raw))}
            />
            <p
              className={cn(
                'text-xs transition-opacity duration-150',
                termCode && !isValidTermCode(termCode)
                  ? 'text-muted-foreground opacity-100'
                  : 'pointer-events-none select-none opacity-0',
              )}
            >
              {t('faculties.pages.programmeOfferings.createDialog.fields.termCodeHint')}
            </p>
          </div>

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
                  className="w-auto p-3"
                  align="start"
                >
                  <CalendarWithPresets
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
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            {t('faculties.pages.programmeOfferings.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('faculties.pages.programmeOfferings.createDialog.creating')
              : t('faculties.pages.programmeOfferings.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
