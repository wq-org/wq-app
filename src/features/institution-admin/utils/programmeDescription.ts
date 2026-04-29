import { formatProgrammeDurationYearLabel } from './programmeDurationYears'

type BuildProgrammeDescriptionInput = {
  language: string
  programmeName: string
  facultyName: string
  durationYears: number | null
}

export function buildSuggestedProgrammeDescription({
  language,
  programmeName,
  facultyName,
  durationYears,
}: BuildProgrammeDescriptionInput): string {
  const trimmedProgrammeName = programmeName.trim()
  if (!trimmedProgrammeName) return ''

  const trimmedFacultyName = facultyName.trim()
  const isGerman = language.toLowerCase().startsWith('de')

  if (isGerman) {
    if (durationYears == null) {
      return `Das ist das Programm ${trimmedProgrammeName} der Fakultät ${trimmedFacultyName}.`
    }
    return `Das ist das Programm ${trimmedProgrammeName} der Fakultät ${trimmedFacultyName}, welches ${formatProgrammeDurationYearLabel(durationYears)} Jahre andauert.`
  }

  if (durationYears == null) {
    return `This is the programme ${trimmedProgrammeName} of the faculty ${trimmedFacultyName}.`
  }
  return `This is the programme ${trimmedProgrammeName} of the faculty ${trimmedFacultyName}, which lasts ${formatProgrammeDurationYearLabel(durationYears)} years.`
}
