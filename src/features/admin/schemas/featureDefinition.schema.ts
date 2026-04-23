import { z } from 'zod'
import { FEATURE_KEY_PATTERN } from '../types/featureDefinitions.types'
import {
  NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM,
  isReservedFeatureDefinitionCategorySlug,
  normalizeFeatureDefinitionCategorySlug,
} from '../config/featureDefinitionCategories'
import { normalizeFeatureKey } from '../utils/featureDefinitionKey'

export function buildFeatureDefinitionSchema(mode: 'create' | 'edit') {
  return z
    .object({
      key:
        mode === 'create'
          ? z
              .string()
              .min(1, 'Key is required')
              .refine(
                (k) => {
                  const norm = normalizeFeatureKey(k)
                  return norm.length > 0 && FEATURE_KEY_PATTERN.test(norm)
                },
                { message: 'Invalid key format' },
              )
          : z.string(),
      name: z.string().min(1, 'Name is required'),
      description: z.string(),
      category: z.string().min(1, 'Category is required'),
      customCategoryName: z.string(),
      valueType: z.enum(['boolean', 'integer', 'bigint', 'text']),
      defaultEnabled: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.category.trim() === NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM) {
        const norm = normalizeFeatureDefinitionCategorySlug(data.customCategoryName)
        if (!norm) {
          ctx.addIssue({
            path: ['customCategoryName'],
            code: 'custom',
            message: 'Category name is required',
          })
        } else if (isReservedFeatureDefinitionCategorySlug(norm)) {
          ctx.addIssue({
            path: ['customCategoryName'],
            code: 'custom',
            message: 'Reserved category slug',
          })
        }
      }
    })
}

export type FeatureDefinitionSchemaValues = z.infer<ReturnType<typeof buildFeatureDefinitionSchema>>
