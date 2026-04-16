import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
  NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM,
  buildFeatureDefinitionCategoryMenuIds,
} from '../config/featureDefinitionCategories'

export type FeatureDefinitionCategoryPopoverProps = {
  id: string
  value: string
  onValueChange: (next: string) => void
  disabled?: boolean
  /** Extra categories fetched from the database. */
  dbCategories?: readonly string[]
}

function categoryRowLabel(slug: string, t: (key: string, o?: { defaultValue?: string }) => string) {
  if (!slug) {
    return t('featureDefinitions.categories.none')
  }
  if (slug === NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM) {
    return t('featureDefinitions.categories.new_category')
  }
  return t(`featureDefinitions.categories.${slug}`, { defaultValue: slug })
}

export function FeatureDefinitionCategoryPopover({
  id,
  value,
  onValueChange,
  disabled = false,
  dbCategories = [],
}: FeatureDefinitionCategoryPopoverProps) {
  const { t } = useTranslation('features.admin')
  const [open, setOpen] = useState(false)

  const menuIds = useMemo(
    () => buildFeatureDefinitionCategoryMenuIds(value, dbCategories),
    [value, dbCategories],
  )
  const selectedTrimmed = value.trim()
  const triggerText = categoryRowLabel(selectedTrimmed, t)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-10 w-full min-h-10 justify-between border-input bg-transparent px-3 py-2 font-normal shadow-xs',
            !selectedTrimmed && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{triggerText}</span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-1"
        align="start"
      >
        <div
          className="flex max-h-72 flex-col gap-0.5 overflow-y-auto"
          role="listbox"
        >
          {menuIds.map((slug) => {
            const selected = slug === '' ? selectedTrimmed === '' : selectedTrimmed === slug
            const handleSelect = () => {
              onValueChange(slug)
              setOpen(false)
            }
            return (
              <button
                key={slug === '' ? '__none__' : slug}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-none',
                  'hover:bg-accent hover:text-accent-foreground',
                  selected && 'bg-accent/60',
                )}
                onClick={handleSelect}
              >
                <Check className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
                <span className="truncate">{categoryRowLabel(slug, t)}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
