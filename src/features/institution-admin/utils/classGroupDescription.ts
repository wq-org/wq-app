/**
 * Auto-fill sentences for class group description (DE / EN).
 * Not i18n keys: stable templates; UI language via `language`.
 */

export type BuildSuggestedClassGroupDescriptionInput = {
  language: string
  classGroupName: string
  cohortYear: number | null
  programmeName: string
  facultyName: string
}

export function buildSuggestedClassGroupDescription({
  language,
  classGroupName,
  cohortYear,
  programmeName,
  facultyName,
}: BuildSuggestedClassGroupDescriptionInput): string {
  const cg = classGroupName.trim()
  const prog = programmeName.trim()
  const fac = facultyName.trim()

  if (!cg || cohortYear == null || !Number.isFinite(cohortYear) || !prog || !fac) {
    return ''
  }

  const year = Math.trunc(Number(cohortYear))
  const isGerman = language.toLowerCase().startsWith('de')

  if (isGerman) {
    return `Das ist die Klassengruppe ${cg} vom Jahrgang ${year} des Programms ${prog} der Fakultät ${fac}.`
  }

  return `This is the class group ${cg} for cohort year ${year} in the programme ${prog} of the faculty ${fac}.`
}
