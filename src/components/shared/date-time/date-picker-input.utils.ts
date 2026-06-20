import { format, isValid, parse, parseISO } from 'date-fns'

export const DISPLAY_DATE_FORMAT = 'dd.MM.yyyy'
export const ISO_DATE_FORMAT = 'yyyy-MM-dd'

export function isoToDisplayDate(iso: string | undefined): string {
  if (!iso) return ''
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, DISPLAY_DATE_FORMAT) : ''
}

export function displayDateToIso(display: string): string | undefined {
  const trimmed = display.trim()
  if (!trimmed) return undefined

  const parsed = parse(trimmed, DISPLAY_DATE_FORMAT, new Date())
  if (!isValid(parsed)) return undefined

  return format(parsed, ISO_DATE_FORMAT)
}

export function isoToDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const parsed = parseISO(iso)
  return isValid(parsed) ? parsed : undefined
}
