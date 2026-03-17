export function formatLessonMetaTimestamp(
  updatedAt?: string,
  createdAt?: string,
  locale: string = 'en',
): string | null {
  const source = updatedAt ?? createdAt
  if (!source) return null

  const date = new Date(source)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
