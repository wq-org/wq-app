import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Text } from '@/components/ui/text'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'
import { HelpPopover } from './HelpPopover'
import { generateClassGroupSuggestions } from '../utils/termCode'

// Two rows visible in collapsed state (flex-direction:column + max-height layout).
// Each badge row is ~28px tall with gap-2; 2 rows × 28px + 1 × 8px gap ≈ 64px.
const COLLAPSED_HEIGHT_PX = 64
// The first 12 items (year groups 1+2, letters A–F) are visible without scrolling.
const INITIAL_VISIBLE_COUNT = 12

type ClassGroupStepProps = {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  termCode?: string
}

export function ClassGroupStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  termCode,
}: ClassGroupStepProps) {
  const { t } = useTranslation('features.institution-admin')
  const [isExpanded, setIsExpanded] = useState(false)

  // --- Compute before render ---
  const suggestions = termCode ? generateClassGroupSuggestions(termCode) : []
  const canExpand = suggestions.length > INITIAL_VISIBLE_COUNT
  const visibleSuggestions = isExpanded ? suggestions : suggestions.slice(0, INITIAL_VISIBLE_COUNT)
  const hasSuggestions = suggestions.length > 0
  const collapsedHeight = `${COLLAPSED_HEIGHT_PX}px`

  const handleToggleExpand = () => setIsExpanded((prev) => !prev)

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.classGroup.intro')}
      </Text>

      <div className="flex justify-end">
        <HelpPopover
          title={t('faculties.wizard.help.classGroup.title')}
          sectionDefinitionLabel={t('faculties.wizard.help.sectionLabels.definition')}
          sectionExampleLabel={t('faculties.wizard.help.sectionLabels.example')}
          sectionExampleValuesLabel={t('faculties.wizard.help.sectionLabels.exampleValues')}
          sectionReasonLabel={t('faculties.wizard.help.sectionLabels.reason')}
          definition={t('faculties.wizard.help.classGroup.definition')}
          exampleTitle={t('faculties.wizard.help.classGroup.exampleTitle')}
          exampleValues={
            t('faculties.wizard.help.classGroup.exampleValues', {
              returnObjects: true,
            }) as string[]
          }
        />
      </div>

      <FieldCard className="flex flex-col gap-6">
        {hasSuggestions && (
          <div className="flex flex-col gap-3">
            <Text
              as="p"
              variant="small"
              color="muted"
            >
              {t('faculties.wizard.classGroup.suggestionsLabel')}
            </Text>

            {/*
             * Horizontal-scroll grid: items are pre-ordered so that
             * flex-direction:column + max-height of 2 rows creates:
             *   Row 0: PREFIX-1A  PREFIX-1B … PREFIX-1F  [PREFIX-3A … on expand]
             *   Row 1: PREFIX-2A  PREFIX-2B … PREFIX-2F  [PREFIX-4A … on expand]
             * BlurredScrollArea fades the right edge when year-groups 3+4 are visible.
             */}
            <RadioGroup
              value={name}
              onValueChange={onNameChange}
            >
              <BlurredScrollArea
                orientation="horizontal"
                className="w-full"
              >
                <div
                  className={cn(
                    'flex flex-col flex-wrap gap-2 pb-1 transition-[max-height] duration-300',
                  )}
                  style={{
                    maxHeight: isExpanded ? `${COLLAPSED_HEIGHT_PX * 2 + 24}px` : collapsedHeight,
                  }}
                >
                  {visibleSuggestions.map((suggestion) => {
                    const isSelected = name === suggestion
                    return (
                      <label
                        key={suggestion}
                        className="cursor-pointer"
                      >
                        <RadioGroupItem
                          value={suggestion}
                          className="sr-only"
                        />
                        <Badge
                          variant={isSelected ? 'default' : 'secondary'}
                          size="sm"
                          className={cn(
                            'cursor-pointer transition-colors select-none',
                            !isSelected && 'hover:bg-secondary/80',
                          )}
                        >
                          {suggestion}
                        </Badge>
                      </label>
                    )
                  })}
                </div>
              </BlurredScrollArea>
            </RadioGroup>

            {canExpand && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start gap-1 text-xs text-muted-foreground"
                onClick={handleToggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-3.5" />
                    {t('faculties.wizard.classGroup.showLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    {t('faculties.wizard.classGroup.showMore')}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <FieldInput
          label={t('faculties.wizard.classGroup.nameLabel')}
          placeholder={t('faculties.wizard.classGroup.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />
        <FieldTextarea
          label={t('faculties.wizard.classGroup.descriptionLabel')}
          placeholder={t('faculties.wizard.classGroup.descriptionPlaceholder')}
          value={description}
          onValueChange={onDescriptionChange}
          rows={3}
        />
      </FieldCard>
    </div>
  )
}
