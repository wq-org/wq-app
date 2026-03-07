export interface RelativeUpdatedTimeLabels {
  updatedRecently: string
  updatedWithRelative: (relativeValue: string) => string
}

export function formatRelativeUpdatedTime(
  updatedAt?: string,
  createdAt?: string,
  locale?: string,
  labels?: RelativeUpdatedTimeLabels,
): string {
  const sourceDate = updatedAt ?? createdAt
  const updatedRecentlyLabel = labels?.updatedRecently ?? 'Updated recently'
  const withRelativeLabel =
    labels?.updatedWithRelative ?? ((relativeValue) => `Updated ${relativeValue}`)

  if (!sourceDate) {
    return updatedRecentlyLabel
  }

  const date = new Date(sourceDate)
  if (Number.isNaN(date.getTime())) {
    return updatedRecentlyLabel
  }

  const diffMs = date.getTime() - Date.now()
  const absMs = Math.abs(diffMs)

  const thresholds = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
  ] as const

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  for (const threshold of thresholds) {
    if (absMs >= threshold.ms) {
      const value = Math.round(diffMs / threshold.ms)
      return withRelativeLabel(formatter.format(value, threshold.unit))
    }
  }

  const seconds = Math.round(diffMs / 1000)
  return withRelativeLabel(formatter.format(seconds, 'second'))
}
