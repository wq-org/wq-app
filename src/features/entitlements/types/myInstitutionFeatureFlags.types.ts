/** One row from `public.list_my_institution_feature_flags()` (PostgREST snake_case). */
export type ListMyInstitutionFeatureFlagRow = {
  plan_code: string | null
  feature_id: string
  feature_key: string
  feature_name: string
  feature_description: string
  feature_category: string
  value_type: string
  default_enabled: boolean
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: number | string | null
  text_value: string | null
  source: string
}
