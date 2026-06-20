export const INSTITUTION_TYPE_KEYS = [
  'vocationalSchool',
  'nursingSchool',
  'clinic',
  'educationCenter',
  'university',
  'companyTraining',
  'other',
] as const

export type InstitutionTypeKey = (typeof INSTITUTION_TYPE_KEYS)[number]

export const EXISTING_SYSTEM_KEYS = [
  'taskCards',
  'padlet',
  'edumaps',
  'microsoft365Education',
  'googleWorkspaceEducation',
  'appleSchoolManager',
  'moodle',
  'mebis',
  'logineo',
  'itslearning',
  'hpiSchulcloudLandescloud',
  'ilias',
  'other',
] as const

export type ExistingSystemKey = (typeof EXISTING_SYSTEM_KEYS)[number]

export const EXISTING_SYSTEM_OTHER_KEY = 'other' as const

export const YES_NO_VALUES = ['yes', 'no'] as const

export type YesNoValue = (typeof YES_NO_VALUES)[number]
