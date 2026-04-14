export const ENTITLEMENT_VALUE_TYPES = ['boolean', 'integer', 'bigint', 'text'] as const

/** Lowercase snake_case machine key: letter, then letters/digits/underscores. */
export const FEATURE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/

export type EntitlementValueType = (typeof ENTITLEMENT_VALUE_TYPES)[number]

/** Row shape from `feature_definitions` (PostgREST). */
export type FeatureDefinitionRow = {
  id: string
  key: string
  name: string | null
  description: string | null
  category: string | null
  value_type: EntitlementValueType
  default_enabled: boolean
  created_at: string
  updated_at: string
}

export type FeatureDefinition = {
  id: string
  key: string
  name: string
  description: string | null
  category: string | null
  valueType: EntitlementValueType
  defaultEnabled: boolean
  updatedAt: string
}

export type FeatureDefinitionInsert = {
  key: string
  name: string
  description: string | null
  category: string | null
  value_type: EntitlementValueType
  default_enabled: boolean
}

export type FeatureDefinitionUpdate = {
  name: string
  description: string | null
  category: string | null
  value_type: EntitlementValueType
  default_enabled: boolean
}

export type FeatureDefinitionFormValues = {
  key: string
  name: string
  description: string
  category: string
  valueType: EntitlementValueType
  defaultEnabled: boolean
}

export type FeatureDefinitionEditorFormValues = {
  key: string
  name: string
  description: string
  category: string
  valueType: EntitlementValueType
  defaultEnabled: boolean
}

export type FeatureDefinitionEditorFormProps = {
  mode: 'create' | 'edit'
  initial: FeatureDefinition | null
  saving: boolean
  onSubmit: (values: FeatureDefinitionEditorFormValues) => Promise<void>
  onCancel: () => void
  /** When creating, focus the category control once (e.g. after “Add category” from the list). */
  focusCategoryField?: boolean
  /** Extra categories fetched from the database. */
  dbCategories?: readonly string[]
}
