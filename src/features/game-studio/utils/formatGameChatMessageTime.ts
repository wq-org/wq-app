/**
 * Formats an ISO timestamp (or parseable date string) for chat bubbles.
 * DE: "10. Juni, 20:57 Uhr" — EN: "10 June, 8:57 PM"
 */
export function formatGameChatMessageTime(value: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const isDe = locale.toLowerCase().startsWith('de')

  if (isDe) {
    const day = new Intl.DateTimeFormat('de-DE', { day: 'numeric' }).format(date)
    const month = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(date)
    const time = new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
    return `${day}. ${month}, ${time} Uhr`
  }

  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date)
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return `${day} ${month}, ${time}`
}
