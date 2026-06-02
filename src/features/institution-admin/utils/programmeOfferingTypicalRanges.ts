import { addDays, addMonths, format } from 'date-fns'

/** April (Frühjahrskurs) start month; matches Create programme offering dialog. */
const SPRING_START_MONTH_INDEX = 3
/** October (Herbstkurs) start month. */
const AUTUMN_START_MONTH_INDEX = 9

export type TypicalTrainingRange = {
  start: Date
  end: Date
  /** `dd.MM.yyyy - dd.MM.yyyy` for button labels */
  label: string
}

function buildRangeForStartMonth(
  academicYear: number,
  durationMonths: number,
  startMonthIndex: number,
): TypicalTrainingRange {
  const start = new Date(academicYear, startMonthIndex, 1)
  const end = addDays(addMonths(start, durationMonths), -1)
  return {
    start,
    end,
    label: `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`,
  }
}

/**
 * Typical Ausbildungsjahr spans for spring (April) and autumn (October) intakes,
 * using programme duration in years (same rules as create-offering dialog).
 */
export function typicalSpringAutumnRanges(
  academicYear: number,
  programmeDurationYears: number | null | undefined,
): { spring: TypicalTrainingRange; autumn: TypicalTrainingRange } {
  const resolvedYears =
    programmeDurationYears != null && programmeDurationYears > 0 ? programmeDurationYears : 1
  const durationMonths = Math.round(resolvedYears * 12)

  return {
    spring: buildRangeForStartMonth(academicYear, durationMonths, SPRING_START_MONTH_INDEX),
    autumn: buildRangeForStartMonth(academicYear, durationMonths, AUTUMN_START_MONTH_INDEX),
  }
}
