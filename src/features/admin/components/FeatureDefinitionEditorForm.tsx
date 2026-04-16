import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { FeatureDefinitionCategoryPopover } from './FeatureDefinitionCategoryPopover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import type { FeatureDefinitionEditorFormProps } from '../types/featureDefinitions.types'
import { ENTITLEMENT_VALUE_TYPES } from '../types/featureDefinitions.types'
import {
  NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM,
  normalizeFeatureDefinitionCategorySlug,
} from '../config/featureDefinitionCategories'
import { normalizeFeatureKey } from '../utils/featureDefinitionKey'
import {
  buildFeatureDefinitionSchema,
  type FeatureDefinitionSchemaValues,
} from '../schemas/featureDefinition.schema'

export function FeatureDefinitionEditorForm({
  mode,
  initial,
  saving,
  onSubmit,
  onCancel,
  focusCategoryField = false,
  dbCategories = [],
}: FeatureDefinitionEditorFormProps) {
  const { t } = useTranslation('features.admin')
  const didFocusCategoryRef = useRef(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FeatureDefinitionSchemaValues>({
    resolver: zodResolver(buildFeatureDefinitionSchema(mode)),
    defaultValues:
      mode === 'edit' && initial
        ? {
            key: initial.key,
            name: initial.name ?? '',
            description: initial.description ?? '',
            category: initial.category ?? '',
            customCategoryName: '',
            valueType: initial.valueType,
            defaultEnabled: initial.defaultEnabled,
          }
        : {
            key: '',
            name: '',
            description: '',
            category: '',
            customCategoryName: '',
            valueType: 'boolean',
            defaultEnabled: false,
          },
  })

  const categoryValue = watch('category')
  const keyValue = watch('key')
  const valueType = watch('valueType')

  useEffect(() => {
    if (!focusCategoryField || mode !== 'create' || didFocusCategoryRef.current) return
    didFocusCategoryRef.current = true
    const handle = window.setTimeout(() => {
      document.getElementById('fd-editor-category')?.focus()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [focusCategoryField, mode])

  const isNewCategoryFlow = categoryValue.trim() === NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM
  const normalizedKey = normalizeFeatureKey(keyValue)
  const isBoolean = valueType === 'boolean'

  const handleFormSubmit = async (values: FeatureDefinitionSchemaValues) => {
    const categoryForSave = isNewCategoryFlow
      ? normalizeFeatureDefinitionCategorySlug(values.customCategoryName)
      : values.category.trim()

    await onSubmit({
      key: mode === 'create' ? normalizeFeatureKey(values.key) : values.key.trim(),
      name: values.name.trim(),
      description: values.description,
      category: categoryForSave,
      valueType: values.valueType,
      defaultEnabled: values.defaultEnabled,
    })
  }

  const keyLabel = t('featureDefinitions.form.key')
  const nameLabel = t('featureDefinitions.form.name')
  const categoryLabel = t('featureDefinitions.form.category')
  const descriptionLabel = t('featureDefinitions.form.descriptionField')
  const valueTypeLabel = t('featureDefinitions.form.valueType')

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <FieldCard className="py-5">
        <div className="flex flex-col gap-6">
          {/* Key */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="fd-editor-key"
              className="text-sm font-medium leading-none"
            >
              {keyLabel}
            </Label>
            <Controller
              name="key"
              control={control}
              render={({ field }) => (
                <FieldInput
                  id="fd-editor-key"
                  label={keyLabel}
                  placeholder={t('featureDefinitions.form.keyPlaceholder')}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mode === 'edit' || saving}
                  autoComplete="off"
                  required={mode === 'create'}
                />
              )}
            />
            {errors.key ? (
              <p
                id="fd-editor-key-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.key.message}
              </p>
            ) : null}
            {mode === 'create' && normalizedKey ? (
              <Text
                as="p"
                variant="small"
                color="muted"
                className="text-xs"
              >
                {t('featureDefinitions.form.storedKey')}{' '}
                <span className="font-mono">{normalizedKey}</span>
              </Text>
            ) : null}
            {mode === 'edit' ? (
              <p className="text-xs text-muted-foreground">
                {t('featureDefinitions.form.keyReadOnlyHint')}
              </p>
            ) : null}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="fd-editor-name"
              className="text-sm font-medium leading-none"
            >
              {nameLabel}
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FieldInput
                  id="fd-editor-name"
                  label={nameLabel}
                  placeholder={t('featureDefinitions.form.namePlaceholder')}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={saving}
                  required
                />
              )}
            />
            {errors.name ? (
              <p
                id="fd-editor-name-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.name.message}
              </p>
            ) : null}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="fd-editor-category"
              className="text-sm font-medium leading-none"
            >
              {categoryLabel}
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FeatureDefinitionCategoryPopover
                  id="fd-editor-category"
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={saving}
                  dbCategories={dbCategories}
                />
              )}
            />
            {errors.category ? (
              <p
                id="fd-editor-category-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.category.message}
              </p>
            ) : null}
            {isNewCategoryFlow ? (
              <div className="flex flex-col gap-2 pt-1">
                <Controller
                  name="customCategoryName"
                  control={control}
                  render={({ field }) => (
                    <FieldInput
                      id="fd-editor-custom-category"
                      label={t('featureDefinitions.form.customCategoryLabel')}
                      placeholder={t('featureDefinitions.form.customCategoryPlaceholder')}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={saving}
                      autoComplete="off"
                      required
                    />
                  )}
                />
                {errors.customCategoryName ? (
                  <p
                    id="fd-editor-custom-category-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.customCategoryName.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="fd-editor-description"
              className="text-sm font-medium leading-none"
            >
              {descriptionLabel}
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <FieldTextarea
                  id="fd-editor-description"
                  label={descriptionLabel}
                  placeholder={t('featureDefinitions.form.descriptionPlaceholder')}
                  value={field.value}
                  onValueChange={field.onChange}
                  rows={3}
                  hideSeparator={false}
                  disabled={saving}
                />
              )}
            />
          </div>

          {/* Value Type */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="fd-editor-value-type"
              className="text-sm font-medium leading-none"
            >
              {valueTypeLabel}
            </Label>
            <Controller
              name="valueType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                  }}
                  disabled={saving}
                >
                  <SelectTrigger
                    id="fd-editor-value-type"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITLEMENT_VALUE_TYPES.map((vt) => (
                      <SelectItem
                        key={vt}
                        value={vt}
                      >
                        {t(`featureDefinitions.valueTypes.${vt}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              {t(`featureDefinitions.form.valueTypeHints.${valueType}`)}
            </p>
          </div>

          {/* Default Enabled (boolean only) */}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            {isBoolean ? (
              <>
                <div className="min-w-0 space-y-1">
                  <Label
                    htmlFor={saving ? undefined : 'fd-editor-default'}
                    className="text-sm font-medium leading-none"
                  >
                    {t('featureDefinitions.form.defaultEnabled')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('featureDefinitions.form.defaultEnabledHint')}
                  </p>
                </div>
                {saving ? (
                  <div
                    className="flex h-[1.15rem] w-8 shrink-0 items-center justify-center"
                    aria-busy="true"
                    aria-label={t('featureDefinitions.form.saving')}
                  >
                    <Spinner
                      size="xs"
                      variant="gray"
                      speed={1750}
                    />
                  </div>
                ) : (
                  <Controller
                    name="defaultEnabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="fd-editor-default"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('featureDefinitions.form.nonBooleanHint')}
              </p>
            )}
          </div>
        </div>
      </FieldCard>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          {t('featureDefinitions.form.cancel')}
        </Button>
        <Button
          type="submit"
          variant="darkblue"
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Spinner
              size="xs"
              variant="darkblue"
              speed={1750}
              className="shrink-0"
            />
          ) : null}
          {mode === 'create'
            ? t('featureDefinitions.form.create')
            : t('featureDefinitions.form.save')}
        </Button>
      </div>
    </form>
  )
}
