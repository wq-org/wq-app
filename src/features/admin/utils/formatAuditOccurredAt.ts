/**
 * Formats `audit.events.occurred_at` for admin display.
 * DE: day month year (short) + 24h + " Uhr"
 * EN: day month year + 12h AM/PM
 */
export function formatAuditOccurredAt(iso: string, language: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso

  const isDe = language.toLowerCase().startsWith('de')

  if (isDe) {
    const dateStr = new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
    const timeStr = new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
    return `${dateStr} - ${timeStr} Uhr`
  }

  const dateStr = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
  return `${dateStr} - ${timeStr}`
}
