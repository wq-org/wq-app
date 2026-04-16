import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'

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
  const [billingOpen, handleSelectBillingOpen] = useState(false)

  const billingLabel = useMemo(() => {
    if (draft.billingInterval === PLAN_BILLING_MONTHLY) {
      return t('planCatalog.editor.settings.billing.monthly')
    }
    if (draft.billingInterval === PLAN_BILLING_YEARLY) {
      return t('planCatalog.editor.settings.billing.yearly')
    }
    return t('planCatalog.editor.settings.billing.none')
  }, [draft.billingInterval, t])

  const updatedAtDisplay = formatDateTime(plan.updatedAt, i18nLanguage)
  const deletedAtDisplay = formatDateTime(plan.deletedAt, i18nLanguage)

  const handleSelectBilling = (value: string) => {
    updateDraft({ billingInterval: value })
    handleSelectBillingOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('planCatalog.editor.settings.codeLabel')}
        </Text>
        <Badge variant="secondary">{plan.code}</Badge>
        {plan.deletedAt ? (
          <Badge variant="destructive">{t('planCatalog.editor.settings.deletedBadge')}</Badge>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldInput
          label={t('planCatalog.editor.settings.seatCapDefault')}
          value={draft.seatCap}
          onValueChange={(v) => updateDraft({ seatCap: v })}
          placeholder={t('planCatalog.editor.settings.placeholders.seatCap')}
          type="number"
          disabled={disabled}
        />
        <FieldInput
          label={t('planCatalog.editor.settings.storageBytesCapDefault')}
          value={draft.storageBytes}
          onValueChange={(v) => updateDraft({ storageBytes: v.replace(/[^\d]/g, '') })}
          placeholder={t('planCatalog.editor.settings.placeholders.storageBytes')}
          type="text"
          disabled={disabled}
        />
      </div>

      <FieldTextarea
        label={t('planCatalog.editor.settings.metadata')}
        value={draft.metadataJson}
        onValueChange={(v) => updateDraft({ metadataJson: v })}
        placeholder={t('planCatalog.editor.settings.placeholders.metadata')}
        rows={6}
        disabled={disabled}
        hideSeparator
      />

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
          onOpenChange={handleSelectBillingOpen}
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
