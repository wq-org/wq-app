import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'

import {
  PLAN_BILLING_MONTHLY,
  PLAN_BILLING_NONE,
  PLAN_BILLING_YEARLY,
} from '../config/planCatalogBilling'
import type { PlanCatalogEditorPlan } from '../types/planEntitlements.types'
import type { PlanSettingsDraft } from '../utils/planCatalogSettingsDraft'

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const CODE_PATTERN = /^[a-z][a-z0-9_]*$/

function slugifyCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

type PlanCatalogSettingsFormProps = {
  plan: PlanCatalogEditorPlan
  draft: PlanSettingsDraft
  updateDraft: (patch: Partial<PlanSettingsDraft>) => void
  disabled?: boolean
  t: (key: string, options?: { defaultValue?: string }) => string
  i18nLanguage: string
}

function PlanCatalogSettingsForm({
  plan,
  draft,
  updateDraft,
  disabled = false,
  t,
  i18nLanguage,
}: PlanCatalogSettingsFormProps) {
  const [billingOpen, setBillingOpen] = useState(false)

  const isDraft = !plan.isActive && !plan.deletedAt
  const locale = i18nLanguage === 'de' ? 'de-DE' : 'en-US'

  const billingLabel = useMemo(() => {
    if (draft.billingInterval === PLAN_BILLING_MONTHLY) {
      return t('planCatalog.editor.settings.billing.monthly')
    }
    if (draft.billingInterval === PLAN_BILLING_YEARLY) {
      return t('planCatalog.editor.settings.billing.yearly')
    }
    return t('planCatalog.editor.settings.billing.none')
  }, [draft.billingInterval, t])

  const updatedAtDisplay = formatDateTime(plan.updatedAt, locale)
  const deletedAtDisplay = formatDateTime(plan.deletedAt, locale)

  const handleSelectBilling = (value: string) => {
    updateDraft({ billingInterval: value })
    setBillingOpen(false)
  }

  const handleNameChange = (v: string) => {
    const next: Partial<PlanSettingsDraft> = { name: v }
    if (!draft.code || draft.code === slugifyCode(draft.name)) {
      next.code = slugifyCode(v)
    }
    updateDraft(next)
  }

  const codeError = draft.code && !CODE_PATTERN.test(draft.code)

  return (
    <div className="flex flex-col gap-6">
      {isDraft ? (
        <>
          <div className="flex flex-col gap-1">
            <Text
              as="p"
              variant="small"
              className="font-medium text-muted-foreground"
            >
              {t('planCatalog.editor.settings.identity')}
            </Text>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldInput
              label={t('planCatalog.editor.settings.nameLabel')}
              value={draft.name}
              onValueChange={handleNameChange}
              placeholder={t('planCatalog.editor.settings.namePlaceholder')}
              disabled={disabled}
            />
            <div className="flex flex-col gap-1.5">
              <FieldInput
                label={t('planCatalog.editor.settings.codeLabel')}
                value={draft.code}
                onValueChange={(v) =>
                  updateDraft({ code: v.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                }
                placeholder="e.g. enterprise_plus"
                disabled={disabled}
                aria-invalid={Boolean(codeError)}
              />
              {codeError && (
                <Text
                  as="p"
                  variant="small"
                  color="danger"
                  className="text-xs"
                >
                  {t('planCatalog.create.errors.codePattern')}
                </Text>
              )}
              <Text
                as="p"
                variant="small"
                color="muted"
                className="text-xs"
              >
                {t('planCatalog.editor.settings.codeHint')}
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              {t('planCatalog.editor.settings.descriptionLabel')}
            </Label>
            <Textarea
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder={t('planCatalog.editor.settings.descriptionPlaceholder')}
              rows={2}
              disabled={disabled}
              className="resize-none"
            />
          </div>

          <Separator />
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('planCatalog.editor.settings.codeLabel')}
          </Text>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
            {plan.code}
          </span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldInput
          label={t('planCatalog.editor.settings.priceAmount')}
          value={draft.priceAmount}
          onValueChange={(v) => updateDraft({ priceAmount: v })}
          placeholder={t('planCatalog.editor.settings.placeholders.priceAmount')}
          type="text"
          inputMode="decimal"
          disabled={disabled}
        />
        <FieldInput
          label={t('planCatalog.editor.settings.currency')}
          value={plan.currency}
          disabled
          hideSeparator
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          {t('planCatalog.editor.settings.billingInterval')}
        </Label>
        <Popover
          open={billingOpen}
          onOpenChange={setBillingOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full max-w-xs justify-between font-normal sm:w-72"
              disabled={disabled}
            >
              <span className="truncate">{billingLabel}</span>
              <ChevronDown className="size-4 shrink-0 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-1"
            align="start"
          >
            <div className="flex flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => handleSelectBilling(PLAN_BILLING_NONE)}
              >
                {t('planCatalog.editor.settings.billing.none')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => handleSelectBilling(PLAN_BILLING_MONTHLY)}
              >
                {t('planCatalog.editor.settings.billing.monthly')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => handleSelectBilling(PLAN_BILLING_YEARLY)}
              >
                {t('planCatalog.editor.settings.billing.yearly')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <Text
            as="span"
            variant="small"
            className="font-medium text-foreground"
          >
            {t('planCatalog.editor.settings.isActive')}
          </Text>
          <Text
            as="span"
            variant="small"
            color="muted"
            className="text-xs"
          >
            {t('planCatalog.editor.settings.isActiveHint')}
          </Text>
        </div>
        <Switch
          checked={draft.isActive}
          disabled={disabled}
          onCheckedChange={(checked) => updateDraft({ isActive: checked })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldInput
          label={t('planCatalog.editor.settings.updatedAt')}
          value={updatedAtDisplay}
          disabled
          hideSeparator
        />
        <FieldInput
          label={t('planCatalog.editor.settings.deletedAt')}
          value={deletedAtDisplay}
          disabled
          hideSeparator
        />
      </div>
    </div>
  )
}

export { PlanCatalogSettingsForm }
