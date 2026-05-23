import { Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'

type FeatureDefinitionKeyFieldProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  mode: 'create' | 'edit'
  saving?: boolean
  normalizedKey?: string
  errorMessage?: string
}

export function FeatureDefinitionKeyField({
  id,
  value,
  onValueChange,
  mode,
  saving = false,
  normalizedKey = '',
  errorMessage,
}: FeatureDefinitionKeyFieldProps) {
  const { t } = useTranslation('features.admin')
  const keyLabel = t('featureDefinitions.form.key')
  const copyText = (mode === 'edit' ? value : normalizedKey).trim()
  const showCopy = copyText.length > 0

  const handleCopy = async () => {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      toast.success(t('featureDefinitions.form.keyCopySuccess'))
    } catch {
      toast.error(t('featureDefinitions.form.keyCopyError'))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <FieldInput
          id={id}
          className="min-w-0 flex-1"
          label={keyLabel}
          placeholder={t('featureDefinitions.form.keyPlaceholder')}
          value={value}
          onValueChange={onValueChange}
          disabled={mode === 'edit' || saving}
          autoComplete="off"
          required={mode === 'create'}
          showClearButton={mode === 'create'}
        />
        {showCopy ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={saving}
            aria-label={t('featureDefinitions.form.keyCopyAria')}
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" />
          </Button>
        ) : null}
      </div>
      {errorMessage ? (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
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
  )
}
