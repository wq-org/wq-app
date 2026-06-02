import type { DateRange } from 'react-day-picker'

export function getDateRangeForYear(academicYear: number): DateRange {
  return {
    from: new Date(academicYear, 8, 1), // September 1
    to: new Date(academicYear + 1, 7, 31), // August 31 next year
  }
}

export function getProgrammeDisplayInfo(
  name: string,
  durationYears: number,
): { displayName: string; yearLabels: readonly string[] } {
  const displayName = name.trim() || 'Programme'
  const yearLabels = Array.from({ length: durationYears }, (_, i) => `Year ${i + 1}`)
  return { displayName, yearLabels }
}
