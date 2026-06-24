/**
 * Recursively strips PostgreSQL-incompatible NUL (`U+0000`) characters from
 * every string inside a value. PDF text extraction often produces NULs that
 * PostgreSQL rejects on JSONB writes with error code `22P05`.
 *
 * Returns a new value when stripping changed anything, otherwise returns the
 * input by reference so unchanged trees stay referentially stable.
 */
const NUL_CHAR = String.fromCharCode(0)
const NUL_PATTERN = new RegExp(NUL_CHAR, 'g')

export function stripNulChars<T>(value: T): T {
  if (typeof value === 'string') {
    return (value.includes(NUL_CHAR) ? value.replace(NUL_PATTERN, '') : value) as T
  }
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((item) => {
      const sanitized = stripNulChars(item)
      if (sanitized !== item) changed = true
      return sanitized
    })
    return (changed ? next : value) as T
  }
  if (value && typeof value === 'object') {
    let changed = false
    const next: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      const sanitized = stripNulChars(entry)
      if (sanitized !== entry) changed = true
      next[key] = sanitized
    }
    return (changed ? (next as T) : value) as T
  }
  return value
}
