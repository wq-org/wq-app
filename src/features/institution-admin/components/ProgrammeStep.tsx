import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ProgrammeProgressionType } from '../types/programme.types'
import { ChevronDown } from 'lucide-react'

const DURATION_OPTIONS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
] as const

type ProgrammeStepProps = {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  durationYears: number
  onDurationChange: (value: number) => void
  progressionType: ProgrammeProgressionType
  onProgressionTypeChange: (value: ProgrammeProgressionType) => void
  progressionOptions: readonly ProgrammeProgressionType[]
}

export function ProgrammeStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  durationYears,
  onDurationChange,
  progressionType,
  onProgressionTypeChange,
  progressionOptions,
}: ProgrammeStepProps) {
  const { t } = useTranslation('features.institution-admin')
  const [durationOpen, setDurationOpen] = useState(false)
  const [progressionOpen, setProgressionOpen] = useState(false)

  return (
    <div className="w-full">
      <FieldCard className="flex flex-col gap-6">
        <FieldInput
          label={t('faculties.wizard.programme.nameLabel')}
          placeholder={t('faculties.wizard.programme.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />
        <FieldTextarea
          label={t('faculties.wizard.programme.descriptionLabel')}
          placeholder={t('faculties.wizard.programme.descriptionPlaceholder')}
          value={description}
          onValueChange={onDescriptionChange}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>{t('faculties.wizard.programme.durationLabel')}</Label>
            <div className="self-start">
              <Popover
                open={durationOpen}
                onOpenChange={setDurationOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {t('faculties.wizard.programme.durationValue', { count: durationYears })}
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-1"
                  align="start"
                >
                  <ScrollArea className="h-72 w-30">
                    {DURATION_OPTIONS.map((n) => (
                      <Button
                        type="button"
                        variant="ghost"
                        key={n}
                        className="w-full flex justify-start"
                        onClick={() => {
                          onDurationChange(n)
                          setDurationOpen(false)
                        }}
                      >
                        {t('faculties.wizard.programme.durationValue', { count: n })}
                      </Button>
                    ))}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('faculties.wizard.programme.progressionLabel')}</Label>
            <div className="self-start">
              <Popover
                open={progressionOpen}
                onOpenChange={setProgressionOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {t(`faculties.wizard.programme.progression.${progressionType}`)}
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto min-w-(--radix-popover-trigger-width) p-1"
                  align="start"
                >
                  <ul className="flex flex-col">
                    {progressionOptions.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          className="hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm"
                          onClick={() => {
                            onProgressionTypeChange(opt)
                            setProgressionOpen(false)
                          }}
                        >
                          {t(`faculties.wizard.programme.progression.${opt}`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </FieldCard>
    </div>
  )
}
