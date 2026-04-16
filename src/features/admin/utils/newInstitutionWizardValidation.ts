import type { NewInstitutionWizardValues } from '../types/institution.types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type NewInstitutionWizardValidationKey =
  | 'wizard.validation.nameRequired'
  | 'wizard.validation.slugRequired'
  | 'wizard.validation.typeRequired'
  | 'wizard.validation.adminEmailInvalid'
  | 'wizard.validation.legalNameRequired'
  | 'wizard.validation.billingEmailInvalid'
  | 'wizard.validation.countryRequired'

export function validateNewInstitutionWizardStep(
  step: 1 | 2,
  values: NewInstitutionWizardValues,
): NewInstitutionWizardValidationKey | null {
  if (step === 1) {
    if (!values.name.trim()) return 'wizard.validation.nameRequired'
    if (!values.slug.trim()) return 'wizard.validation.slugRequired'
    if (!values.type) return 'wizard.validation.typeRequired'
    if (!EMAIL_RE.test(values.adminEmail.trim())) return 'wizard.validation.adminEmailInvalid'
    return null
  }

  if (step === 2) {
    if (!values.legalName.trim()) return 'wizard.validation.legalNameRequired'
    if (!EMAIL_RE.test(values.billingEmail.trim())) return 'wizard.validation.billingEmailInvalid'
    if (!values.country.trim()) return 'wizard.validation.countryRequired'
    return null
  }

  return null
}
