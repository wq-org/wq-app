import { useEffect, useId, useRef, useState } from 'react'
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

import type {
  FeatureDefinitionEditorFormProps,
  FeatureDefinitionEditorFormValues,
} from '../types/featureDefinitions.types'
import { ENTITLEMENT_VALUE_TYPES, FEATURE_KEY_PATTERN } from '../types/featureDefinitions.types'
import {
  NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM,
  isReservedFeatureDefinitionCategorySlug,
  normalizeFeatureDefinitionCategorySlug,
} from '../config/featureDefinitionCategories'

function normalizeFeatureKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .replace(/^[^a-z]+/, '')
}

const emptyForm: FeatureDefinitionEditorFormValues = {
  key: '',
  name: '',
  description: '',
  category: '',
  valueType: 'boolean',
  defaultEnabled: false,
}

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
  const [values, setValues] = useState(emptyForm)
  const [keyError, setKeyError] = useState<string | null>(null)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const didFocusCategoryRef = useRef(false)

  const keyInputId = useId()
  const nameInputId = useId()
  const categoryInputId = useId()
  const customCategoryInputId = useId()
  const descriptionInputId = useId()
  const valueTypeTriggerId = useId()

  useEffect(() => {
    if (!focusCategoryField || mode !== 'create' || didFocusCategoryRef.current) return
    didFocusCategoryRef.current = true
    const id = categoryInputId
    const handle = window.setTimeout(() => {
      document.getElementById(id)?.focus()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [focusCategoryField, mode, categoryInputId])

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setValues({
        key: initial.key,
        name: initial.name ?? '',
        description: initial.description ?? '',
        category: initial.category ?? '',
        valueType: initial.valueType,
        defaultEnabled: initial.defaultEnabled,
      })
    } else {
      setValues(emptyForm)
    }
    setKeyError(null)
    setCustomCategoryName('')
  }, [mode, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create') {
      const normalized = normalizeFeatureKey(values.key)
      if (!normalized || !FEATURE_KEY_PATTERN.test(normalized)) {
        setKeyError(t('featureDefinitions.validation.keyInvalid'))
        return
      }
      setKeyError(null)
    }

    if (!values.name.trim()) {
      return
    }

    const categoryTrimmed = values.category.trim()
    const isNewCategoryFlow = categoryTrimmed === NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM
    const normalizedCustom = normalizeFeatureDefinitionCategorySlug(customCategoryName)
    if (isNewCategoryFlow) {
      if (!normalizedCustom || isReservedFeatureDefinitionCategorySlug(normalizedCustom)) {
        return
      }
    }

    const categoryForSave = isNewCategoryFlow ? normalizedCustom : values.category.trim()

    await onSubmit({
      key: mode === 'create' ? normalizeFeatureKey(values.key) : values.key.trim(),
      name: values.name.trim(),
      description: values.description,
      category: categoryForSave,
      valueType: values.valueType,
      defaultEnabled: values.defaultEnabled,
    })
  }

  const isBoolean = values.valueType === 'boolean'
  const normalizedKey = normalizeFeatureKey(values.key)

  const keyLabel = t('featureDefinitions.form.key')
  const nameLabel = t('featureDefinitions.form.name')
  const categoryLabel = t('featureDefinitions.form.category')
  const descriptionLabel = t('featureDefinitions.form.descriptionField')
  const valueTypeLabel = t('featureDefinitions.form.valueType')

  const isNewCategoryFlow = values.category.trim() === NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM
  const normalizedCustomCategory = normalizeFeatureDefinitionCategorySlug(customCategoryName)
  const customCategoryMessage = isNewCategoryFlow
    ? !normalizedCustomCategory
      ? t('featureDefinitions.validation.categoryCustomRequired')
      : isReservedFeatureDefinitionCategorySlug(normalizedCustomCategory)
        ? t('featureDefinitions.validation.categoryReservedSlug')
        : null
    : null
  const customCategoryBlocksSave =
    isNewCategoryFlow &&
    (!normalizedCustomCategory || isReservedFeatureDefinitionCategorySlug(normalizedCustomCategory))

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit}
    >
      <FieldCard className="py-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={keyInputId}
              className="text-sm font-medium leading-none"
            >
              {keyLabel}
            </Label>
            <FieldInput
              id={keyInputId}
              label={keyLabel}
              placeholder={t('featureDefinitions.form.keyPlaceholder')}
              value={values.key}
              onValueChange={(next) => {
                setValues((v) => ({ ...v, key: next }))
                setKeyError(null)
              }}
              disabled={mode === 'edit' || saving}
              autoComplete="off"
              required={mode === 'create'}
            />
            {keyError ? <p className="text-sm text-destructive">{keyError}</p> : null}
            {mode === 'create' && normalizedKey ? (
              <Text
                as="p"
                variant="small"
                color="muted"
                className="text-xs"
              >
                Stored key: <span className="font-mono">{normalizedKey}</span>
              </Text>
            ) : null}
            {mode === 'edit' ? (
              <p className="text-xs text-muted-foreground">
                {t('featureDefinitions.form.keyReadOnlyHint')}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={nameInputId}
              className="text-sm font-medium leading-none"
            >
              {nameLabel}
            </Label>
            <FieldInput
              id={nameInputId}
              label={nameLabel}
              placeholder={t('featureDefinitions.form.namePlaceholder')}
              value={values.name}
              onValueChange={(next) => setValues((v) => ({ ...v, name: next }))}
              disabled={saving}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={categoryInputId}
              className="text-sm font-medium leading-none"
            >
              {categoryLabel}
            </Label>
            <FeatureDefinitionCategoryPopover
              id={categoryInputId}
              value={values.category}
              onValueChange={(next) => {
                setValues((v) => ({ ...v, category: next }))
                if (next.trim() !== NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM) {
                  setCustomCategoryName('')
                }
              }}
              disabled={saving}
              dbCategories={dbCategories}
            />
            {isNewCategoryFlow ? (
              <div className="flex flex-col gap-2 pt-1">
                <FieldInput
                  id={customCategoryInputId}
                  label={t('featureDefinitions.form.customCategoryLabel')}
                  placeholder={t('featureDefinitions.form.customCategoryPlaceholder')}
                  value={customCategoryName}
                  onValueChange={setCustomCategoryName}
                  disabled={saving}
                  autoComplete="off"
                  required
                />
                {customCategoryMessage ? (
                  <p className="text-sm text-destructive">{customCategoryMessage}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={descriptionInputId}
              className="text-sm font-medium leading-none"
            >
              {descriptionLabel}
            </Label>
            <FieldTextarea
              id={descriptionInputId}
              label={descriptionLabel}
              placeholder={t('featureDefinitions.form.descriptionPlaceholder')}
              value={values.description}
              onValueChange={(next) => setValues((v) => ({ ...v, description: next }))}
              rows={3}
              hideSeparator={false}
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={valueTypeTriggerId}
              className="text-sm font-medium leading-none"
            >
              {valueTypeLabel}
            </Label>
            <Select
              value={values.valueType}
              onValueChange={(v) => {
                const next = v as (typeof ENTITLEMENT_VALUE_TYPES)[number]
                setValues((prev) => ({
                  ...prev,
                  valueType: next,
                  defaultEnabled: next === 'boolean' ? prev.defaultEnabled : true,
                }))
              }}
              disabled={saving}
            >
              <SelectTrigger
                id={valueTypeTriggerId}
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
            <p className="text-xs text-muted-foreground">
              {t(`featureDefinitions.form.valueTypeHints.${values.valueType}`)}
            </p>
          </div>

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
                  <Switch
                    id="fd-editor-default"
                    checked={values.defaultEnabled}
                    onCheckedChange={(checked) =>
                      setValues((v) => ({ ...v, defaultEnabled: checked }))
                    }
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
          disabled={saving || !values.name.trim() || customCategoryBlocksSave}
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
