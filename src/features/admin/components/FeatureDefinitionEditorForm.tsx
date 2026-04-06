import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
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

import type { FeatureDefinition } from '../types/featureDefinitions.types'
import { ENTITLEMENT_VALUE_TYPES, FEATURE_KEY_PATTERN } from '../types/featureDefinitions.types'

const FIELD_LABEL_CLASS = 'text-sm font-medium leading-none'

export type FeatureDefinitionEditorFormValues = {
  key: string
  name: string
  description: string
  category: string
  valueType: (typeof ENTITLEMENT_VALUE_TYPES)[number]
  defaultEnabled: boolean
}

export type FeatureDefinitionEditorFormProps = {
  mode: 'create' | 'edit'
  initial: FeatureDefinition | null
  saving: boolean
  onSubmit: (values: FeatureDefinitionEditorFormValues) => Promise<void>
  onCancel: () => void
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
}: FeatureDefinitionEditorFormProps) {
  const { t } = useTranslation('features.admin')
  const [values, setValues] = useState(emptyForm)
  const [keyError, setKeyError] = useState<string | null>(null)

  const keyInputId = useId()
  const nameInputId = useId()
  const categoryInputId = useId()
  const descriptionInputId = useId()
  const valueTypeTriggerId = useId()

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
  }, [mode, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create') {
      const trimmedKey = values.key.trim()
      if (!trimmedKey || !FEATURE_KEY_PATTERN.test(trimmedKey)) {
        setKeyError(t('featureDefinitions.validation.keyInvalid'))
        return
      }
      setKeyError(null)
    }

    if (!values.name.trim()) {
      return
    }

    await onSubmit({
      key: values.key.trim(),
      name: values.name.trim(),
      description: values.description,
      category: values.category,
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
      onSubmit={handleSubmit}
    >
      <FieldCard className="py-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={keyInputId}
              className={FIELD_LABEL_CLASS}
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
            {mode === 'edit' ? (
              <p className="text-xs text-muted-foreground">
                {t('featureDefinitions.form.keyReadOnlyHint')}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={nameInputId}
              className={FIELD_LABEL_CLASS}
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
              className={FIELD_LABEL_CLASS}
            >
              {categoryLabel}
            </Label>
            <FeatureDefinitionCategoryPopover
              id={categoryInputId}
              value={values.category}
              onValueChange={(next) => setValues((v) => ({ ...v, category: next }))}
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={descriptionInputId}
              className={FIELD_LABEL_CLASS}
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
              disabled={saving}
              hideSeparator
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={valueTypeTriggerId}
              className={FIELD_LABEL_CLASS}
            >
              {valueTypeLabel}
            </Label>
            <Select
              value={values.valueType}
              onValueChange={(v) =>
                setValues((prev) => ({
                  ...prev,
                  valueType: v as (typeof ENTITLEMENT_VALUE_TYPES)[number],
                }))
              }
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
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="min-w-0 space-y-1">
              <Label
                htmlFor={saving ? undefined : 'fd-editor-default'}
                className={FIELD_LABEL_CLASS}
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
                onCheckedChange={(checked) => setValues((v) => ({ ...v, defaultEnabled: checked }))}
              />
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
          disabled={saving || !values.name.trim()}
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
