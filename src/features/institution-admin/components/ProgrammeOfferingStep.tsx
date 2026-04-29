import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, addMonths, format, isSameDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { CalendarWithPresets } from '@/components/shared'
import { AcademicYearCombobox } from './AcademicYearCombobox'
import { HelpPopover } from './HelpPopover'
import { deriveSuggestedTermCode, isValidTermCode, normalizeTermCode } from '../utils/termCode'
import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'

type OfferingDraft = {
  id: string
  academicYear: number
  termCode: string
  status: ProgrammeOfferingStatus
  dateRange: DateRange | undefined
}

type ProgrammeOfferingStepProps = {
  offerings: OfferingDraft[]
  onUpdateOffering: (id: string, patch: Partial<OfferingDraft>) => void
  onAddOffering: () => void
  onRemoveOffering: (id: string) => void
  programmeName?: string
  durationYears?: number
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
  const matchedOffset = END_DATE_PRESET_OFFSETS.find((offset) =>
    isSameDay(selectedDate, getDateWithOffset(today, offset)),
  )

  return matchedOffset ? getDateWithOffset(startDate, matchedOffset) : selectedDate
}

export function ProgrammeOfferingStep({
  offerings,
  onUpdateOffering,
  onAddOffering,
  onRemoveOffering,
  programmeName,
}: ProgrammeOfferingStepProps) {
  const { t } = useTranslation('features.institution-admin')
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const manualTermCodeRowIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const row of offerings) {
      if (manualTermCodeRowIdsRef.current.has(row.id)) continue
      const next = deriveSuggestedTermCode(programmeName, row.academicYear)
      if (row.termCode !== next) {
        onUpdateOffering(row.id, { termCode: next })
      }
    }
  }, [offerings, onUpdateOffering, programmeName])

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.offering.intro')}
      </Text>

      <div className="flex justify-end">
        <HelpPopover
          title={t('faculties.wizard.help.programmeOffering.title')}
          sectionDefinitionLabel={t('faculties.wizard.help.sectionLabels.definition')}
          sectionExampleLabel={t('faculties.wizard.help.sectionLabels.example')}
          sectionExampleValuesLabel={t('faculties.wizard.help.sectionLabels.exampleValues')}
          sectionReasonLabel={t('faculties.wizard.help.sectionLabels.reason')}
          definition={t('faculties.wizard.help.programmeOffering.definition')}
          exampleTitle={t('faculties.wizard.help.programmeOffering.exampleTitle')}
          exampleValues={
            t('faculties.wizard.help.programmeOffering.exampleValues', {
              returnObjects: true,
            }) as string[]
          }
        />
      </div>

      {offerings.map((row) => (
        <FieldCard
          key={row.id}
          className="flex flex-col gap-4"
        >
          {offerings.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => onRemoveOffering(row.id)}
              >
                {t('faculties.wizard.offering.remove')}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('faculties.wizard.offering.academicYearLabel')}</Label>
              <AcademicYearCombobox
                value={row.academicYear}
                onValueChange={(y) => onUpdateOffering(row.id, { academicYear: y })}
                placeholder={t('faculties.wizard.offering.academicYearPlaceholder')}
                className="self-start sm:w-48"
              />
            </div>

            <div className="flex flex-col gap-1">
              <FieldInput
                label={t('faculties.wizard.offering.termCodeLabel')}
                placeholder={t('faculties.wizard.offering.termCodePlaceholder')}
                value={row.termCode}
                onValueChange={(raw) => {
                  manualTermCodeRowIdsRef.current.add(row.id)
                  onUpdateOffering(row.id, { termCode: normalizeTermCode(raw) })
                }}
              />
              {/* Show format hint only when the code exists but doesn't match the pattern */}
              <p
                className={cn(
                  'text-xs transition-opacity duration-150',
                  row.termCode && !isValidTermCode(row.termCode)
                    ? 'text-muted-foreground opacity-100'
                    : 'opacity-0 pointer-events-none select-none',
                )}
              >
                {t('faculties.wizard.offering.termCodeHint')}
              </p>
            </div>
          </div>

          {/* Start / end date pickers */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t('faculties.wizard.offering.startsAtLabel')}</Label>
              <Popover
                open={openPopover === `${row.id}-from`}
                onOpenChange={(open) => setOpenPopover(open ? `${row.id}-from` : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
                    {row.dateRange?.from ? (
                      format(row.dateRange.from, 'MMM d, yyyy')
                    ) : (
                      <span className="text-muted-foreground">
                        {t('faculties.wizard.offering.datePlaceholder')}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3"
                  align="start"
                >
                  <CalendarWithPresets
                    value={row.dateRange?.from}
                    onChange={(date) => {
                      onUpdateOffering(row.id, {
                        dateRange: {
                          from: date,
                          to:
                            date && row.dateRange?.to && row.dateRange.to < date
                              ? undefined
                              : row.dateRange?.to,
                        },
                      })
                      setOpenPopover(null)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('faculties.wizard.offering.endsAtLabel')}</Label>
              <Popover
                open={openPopover === `${row.id}-to`}
                onOpenChange={(open) => setOpenPopover(open ? `${row.id}-to` : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" />
                    {row.dateRange?.to ? (
                      format(row.dateRange.to, 'MMM d, yyyy')
                    ) : (
                      <span className="text-muted-foreground">
                        {t('faculties.wizard.offering.datePlaceholder')}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3"
                  align="start"
                >
                  <CalendarWithPresets
                    value={row.dateRange?.to ?? row.dateRange?.from ?? new Date()}
                    disabled={row.dateRange?.from ? { before: row.dateRange.from } : undefined}
                    onChange={(date) => {
                      const resolvedEndDate = mapEndDatePresetToStartDate(date, row.dateRange?.from)
                      onUpdateOffering(row.id, {
                        dateRange: { from: row.dateRange?.from, to: resolvedEndDate },
                      })
                      setOpenPopover(null)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Switch
              checked={row.status === 'active'}
              onCheckedChange={(on) =>
                onUpdateOffering(row.id, { status: on ? 'active' : 'draft' })
              }
            />
            <Label className="cursor-pointer">
              {row.status === 'active'
                ? t('faculties.wizard.offering.statusActive')
                : t('faculties.wizard.offering.statusDraft')}
            </Label>
          </div>
        </FieldCard>
      ))}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={onAddOffering}
      >
        {t('faculties.wizard.offering.addAnother')}
      </Button>
    </div>
  )
}
