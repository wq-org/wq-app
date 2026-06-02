/** Whole minutes from `now` until `expiresAt`, at least 1 while still valid. */
export function minutesUntilExpiry(expiresAt: Date, nowMs = Date.now()): number {
  const msRemaining = expiresAt.getTime() - nowMs
  return Math.max(1, Math.ceil(msRemaining / 60_000))
}

const MINUTES_PER_DAY = 24 * 60

/**
 * Human-readable time until expiry using days, hours, and minutes as needed
 * (e.g. "14 days", "1 day and 5 hours", "30 minutes", "1 hour and 30 minutes").
 */
export function linkExpiryDurationPhrase(expiresAt: Date, nowMs = Date.now()): string {
  const totalMinutes = minutesUntilExpiry(expiresAt, nowMs)
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY)
  const remAfterDays = totalMinutes % MINUTES_PER_DAY
  const hours = Math.floor(remAfterDays / 60)
  const minutes = remAfterDays % 60

  const parts: string[] = []
  if (days > 0) parts.push(days === 1 ? '1 day' : `${days} days`)
  if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`)
  if (minutes > 0) parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`)

  if (parts.length === 0) {
    return 'This link expires in less than a minute.'
  }

  let inner: string
  if (parts.length === 1) inner = parts[0]
  else if (parts.length === 2) inner = `${parts[0]} and ${parts[1]}`
  else inner = `${parts[0]}, ${parts[1]} and ${parts[2]}`

  return `This link expires in ${inner}.`
}
