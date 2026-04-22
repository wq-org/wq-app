import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { CalendarWithPresets } from '@/components/shared'
import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'

type CohortOfferingDraft = {
  id: string
  status: ProgrammeOfferingStatus
  dateRange: DateRange | undefined
}

type CohortOfferingStepProps = {
  offerings: CohortOfferingDraft[]
  onUpdateOffering: (id: string, patch: Partial<CohortOfferingDraft>) => void
  onAddOffering: () => void
  onRemoveOffering: (id: string) => void
}

export function CohortOfferingStep({
  offerings,
  onUpdateOffering,
  onAddOffering,
  onRemoveOffering,
}: CohortOfferingStepProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.cohortOffering.intro')}
      </Text>

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
                {t('faculties.wizard.cohortOffering.remove')}
              </Button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t('faculties.wizard.cohortOffering.startsAtLabel')}</Label>
              <Popover>
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
                        {t('faculties.wizard.cohortOffering.datePlaceholder')}
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
                    onChange={(date) =>
                      onUpdateOffering(row.id, {
                        dateRange: {
                          from: date,
                          to:
                            date && row.dateRange?.to && row.dateRange.to < date
                              ? undefined
                              : row.dateRange?.to,
                        },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('faculties.wizard.cohortOffering.endsAtLabel')}</Label>
              <Popover>
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
                        {t('faculties.wizard.cohortOffering.datePlaceholder')}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3"
                  align="start"
                >
                  <CalendarWithPresets
                    value={row.dateRange?.to}
                    disabled={row.dateRange?.from ? { before: row.dateRange.from } : undefined}
                    onChange={(date) =>
                      onUpdateOffering(row.id, {
                        dateRange: { from: row.dateRange?.from, to: date },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Switch
              checked={row.status === 'active'}
              onCheckedChange={(on) =>
                onUpdateOffering(row.id, { status: on ? 'active' : 'draft' })
              }
            />
            <Label className="cursor-pointer">
              {row.status === 'active'
                ? t('faculties.wizard.cohortOffering.statusActive')
                : t('faculties.wizard.cohortOffering.statusDraft')}
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
        {t('faculties.wizard.cohortOffering.addAnother')}
      </Button>
    </div>
  )
}
