import {
  resolveClassGroupTitlePrefix,
  suggestNextClassGroupTitle,
} from '@/features/institution-admin/utils/classGroupCreateSuggestion'

export type InstitutionWizardStructureHintParts = {
  prefix: string
  exampleCode: string
}

/**
 * Preview of how class-group codes might look once programmes exist, using the same
 * prefix logic as institution-admin structure flows (institution name stands in for programme title).
 */
export function getInstitutionWizardStructureHintParts(
  institutionDisplayName: string,
): InstitutionWizardStructureHintParts | null {
  const trimmed = institutionDisplayName.trim()
  if (!trimmed) return null

  const prefix = resolveClassGroupTitlePrefix({
    cohort: null,
    programmeOfferings: [],
    programmeName: trimmed,
  }).trim()

  if (!prefix) return null

  const exampleCode = suggestNextClassGroupTitle({ prefix, existingNames: [] })
  if (!exampleCode) return null

  return { prefix, exampleCode }
}
