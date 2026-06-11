export function formatNoteTime(updatedAt: string, locale: string): string {
  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return ''

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffSec = Math.floor((date.getTime() - Date.now()) / 1000)
  const absSec = Math.abs(diffSec)

  if (absSec < 60) return rtf.format(Math.round(diffSec), 'second')
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
  if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
  if (absSec < 604800) return rtf.format(Math.round(diffSec / 86400), 'day')
  if (absSec < 2592000) return rtf.format(Math.round(diffSec / 604800), 'week')

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}
