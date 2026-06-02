/**
 * Default cohort description sentences (DE / EN), same style as {@link buildSuggestedProgrammeDescription}.
 * Not i18n strings: stable templates for auto-fill; UI language via `language`.
 */

export type BuildSuggestedCohortDescriptionInput = {
  language: string
  cohortName: string
  programmeName: string
  facultyName: string
}

export function buildSuggestedCohortDescription({
  language,
  cohortName,
  programmeName,
  facultyName,
}: BuildSuggestedCohortDescriptionInput): string {
  const cohort = cohortName.trim()
  const programme = programmeName.trim()
  const faculty = facultyName.trim()
  if (!cohort || !programme || !faculty) return ''

  const isGerman = language.toLowerCase().startsWith('de')

  if (isGerman) {
    return `Das ist der Jahrgang ${cohort} von dem Programm ${programme} der Fakultät ${faculty}.`
  }

  return `This is the cohort ${cohort} for the programme ${programme} in the faculty ${faculty}.`
}
