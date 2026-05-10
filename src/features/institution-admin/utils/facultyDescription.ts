type BuildFacultyDescriptionInput = {
  language: string
  facultyName: string
}

/** Same DE/EN split pattern as {@link buildSuggestedProgrammeDescription}. */
export function buildSuggestedFacultyDescription({
  language,
  facultyName,
}: BuildFacultyDescriptionInput): string {
  const trimmed = facultyName.trim()
  if (!trimmed) return ''

  const isGerman = language.toLowerCase().startsWith('de')
  if (isGerman) {
    return `Das ist die Fakultät ${trimmed}.`
  }
  return `This is the faculty ${trimmed}.`
}
