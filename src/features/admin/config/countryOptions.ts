import countryOptionsData from './countries.json'

export type CountryOption = {
  code: string
  en: string
  de: string
}

/**
 * EU member states + UK + Switzerland.
 * Sorted alphabetically by English name.
 */
export const COUNTRY_OPTIONS: readonly CountryOption[] =
  countryOptionsData as readonly CountryOption[]

/** Returns the localized label for a country option. */
export function getCountryLabel(country: CountryOption, lang: string): string {
  return lang.startsWith('de') ? country.de : country.en
}

/** Returns a search string that matches both English and German names and the code. */
export function getCountrySearchLabel(country: CountryOption): string {
  return `${country.en} ${country.de} ${country.code}`
}

/**
 * Typeahead match for country combobox rows: item values are localized labels, but the query
 * is matched against English, German, and ISO code (e.g. "germ", "deut", "DE").
 */
export function countryItemMatchesSearchQuery(itemDisplayValue: string, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true
  const country = findCountryByValue(itemDisplayValue)
  const haystack = (
    country ? getCountrySearchLabel(country) : itemDisplayValue.trim()
  ).toLowerCase()
  return haystack.includes(trimmed.toLowerCase())
}

/** Finds a country option by code (case-insensitive). */
export function findCountryByCode(code: string): CountryOption | undefined {
  const upper = code.toUpperCase()
  return COUNTRY_OPTIONS.find((c) => c.code === upper)
}

/** Finds a country option by code or localized label. */
export function findCountryByValue(value: string): CountryOption | undefined {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined

  return COUNTRY_OPTIONS.find(
    (country) =>
      country.code.toLowerCase() === normalized ||
      country.en.toLowerCase() === normalized ||
      country.de.toLowerCase() === normalized,
  )
}

/** Returns the locale-specific display value for a stored country string. */
export function getCountryDisplayValue(value: string, lang: string): string {
  const country = findCountryByValue(value)
  return country ? getCountryLabel(country, lang) : value.trim()
}
