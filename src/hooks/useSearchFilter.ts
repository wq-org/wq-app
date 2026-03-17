import { useMemo } from 'react'

export function useSearchFilter<T>(
  items: readonly T[],
  query: string,
  fields: readonly (keyof T)[],
): T[] {
  return useMemo(() => {
    if (!query.trim()) {
      return [...items]
    }

    const normalizedQuery = query.trim().toLowerCase()

    return items.filter((item) =>
      fields.some((field) => {
        const value = item[field]

        if (typeof value !== 'string') {
          return false
        }

        return value.toLowerCase().includes(normalizedQuery)
      }),
    )
  }, [items, query, fields])
}
