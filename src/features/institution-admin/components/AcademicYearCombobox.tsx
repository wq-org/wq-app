import { useTranslation } from 'react-i18next'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { ACADEMIC_YEAR_OPTIONS, clampAcademicYear } from '../utils/termCode'

type AcademicYearComboboxProps = {
  value: number
  onValueChange: (year: number) => void
  disabled?: boolean
  className?: string
  /** Shown in the input when no year is selected (optional). */
  placeholder?: string
}

export function AcademicYearCombobox({
  value,
  onValueChange,
  disabled,
  className,
  placeholder,
}: AcademicYearComboboxProps) {
  const { t } = useTranslation('features.institution-admin')
  const resolved = clampAcademicYear(value)

  return (
    <Combobox
      value={resolved}
      onValueChange={(v) => {
        const y = typeof v === 'number' ? v : Number(v)
        if (Number.isFinite(y)) onValueChange(clampAcademicYear(y))
      }}
      items={[...ACADEMIC_YEAR_OPTIONS]}
      itemToStringLabel={(item) => String(item)}
      filter={(item, query) => {
        const q = query.trim()
        if (!q) return true
        return String(item).includes(q)
      }}
      autoHighlight
    >
      <ComboboxInput
        className={cn('w-full max-w-[min(100%,12rem)]', className)}
        placeholder={placeholder ?? String(resolved)}
        disabled={disabled}
        showClear={false}
      />
      <ComboboxContent onWheel={(event) => event.stopPropagation()}>
        <ComboboxEmpty>{t('components.academicYearCombobox.empty')}</ComboboxEmpty>
        <ScrollArea className="h-60 w-full p-1">
          <ComboboxList className="max-h-none overflow-visible p-0">
            {(item: number) => (
              <ComboboxItem
                key={item}
                value={item}
              >
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  )
}
