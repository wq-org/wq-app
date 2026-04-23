import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  COUNTRY_OPTIONS,
  countryItemMatchesSearchQuery,
  findCountryByValue,
  getCountryDisplayValue,
  getCountryLabel,
} from '../config/countryOptions'

type CountryComboboxProps = {
  value: string
  onValueChange: (country: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CountryCombobox({
  value,
  onValueChange,
  placeholder,
  disabled,
}: CountryComboboxProps) {
  const { i18n, t } = useTranslation('features.admin')
  const lang = i18n.language

  const selectedOption = useMemo(() => (value ? findCountryByValue(value) : undefined), [value])
  const countryItems = useMemo(() => COUNTRY_OPTIONS.map((c) => getCountryLabel(c, lang)), [lang])

  return (
    <Combobox
      value={selectedOption ? getCountryDisplayValue(selectedOption.code, lang) : value}
      onValueChange={(v) => onValueChange(getCountryDisplayValue((v as string) ?? '', lang))}
      items={countryItems}
      itemToStringLabel={(item) => {
        const country = findCountryByValue(String(item))
        return country ? getCountryLabel(country, lang) : String(item)
      }}
      filter={(item, query) => countryItemMatchesSearchQuery(String(item), query)}
      autoHighlight
    >
      <ComboboxInput
        placeholder={selectedOption ? getCountryLabel(selectedOption, lang) : placeholder}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>{t('form.address.countryNoResults')}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => {
            const country = findCountryByValue(item)
            return (
              <ComboboxItem
                key={country?.code ?? item}
                value={item}
              >
                {item}
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
