import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Text } from '@/components/ui/text'

import {
  PLAN_BILLING_MONTHLY,
  PLAN_BILLING_NONE,
  PLAN_BILLING_YEARLY,
} from '../config/planCatalogBilling'
import type { CreatePlanPayload } from '../api/planEntitlementsApi'

type FormState = {
  name: string
  code: string
  description: string
  priceAmount: string
  currency: string
  billingInterval: string
  isActive: boolean
}

const INITIAL_FORM: FormState = {
  name: '',
  code: '',
  description: '',
  priceAmount: '',
  currency: 'EUR',
  billingInterval: PLAN_BILLING_MONTHLY,
  isActive: true,
}

function slugifyCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

type CreatePlanDialogProps = {
  open: boolean
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (payload: CreatePlanPayload) => Promise<void>
}

function CreatePlanDialog({ open, isSaving, onOpenChange, onConfirm }: CreatePlanDialogProps) {
  const { t } = useTranslation('features.admin')
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [billingOpen, setBillingOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const patch = (updates: Partial<FormState>) =>
    setForm((prev) => {
      const next = { ...prev, ...updates }
      if ('name' in updates && !prev.code) {
        next.code = slugifyCode(updates.name ?? '')
      }
      return next
    })

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = t('planCatalog.create.errors.nameRequired')
    if (!form.code.trim()) next.code = t('planCatalog.create.errors.codeRequired')
    if (!/^[a-z][a-z0-9_]*$/.test(form.code.trim()))
      next.code = t('planCatalog.create.errors.codePattern')
    if (form.priceAmount.trim()) {
      const p = parseFloat(form.priceAmount.trim())
      if (!Number.isFinite(p) || p < 0)
        next.priceAmount = t('planCatalog.create.errors.priceInvalid')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleConfirm = async () => {
    if (!validate()) return
    const priceRaw = form.priceAmount.trim()
    const priceAmount = priceRaw ? Math.round(parseFloat(priceRaw) * 100) / 100 : null
    await onConfirm({
      name: form.name.trim(),
      code: form.code.trim().toLowerCase(),
      description: form.description.trim(),
      price_amount: priceAmount,
      currency: form.currency,
      billing_interval: form.billingInterval,
      is_active: form.isActive,
    })
    setForm(INITIAL_FORM)
    setErrors({})
  }

  const handleOpenChange = (next: boolean) => {
    if (!isSaving) {
      setForm(INITIAL_FORM)
      setErrors({})
      onOpenChange(next)
    }
  }

  const billingLabel =
    form.billingInterval === PLAN_BILLING_MONTHLY
      ? t('planCatalog.editor.settings.billing.monthly')
      : form.billingInterval === PLAN_BILLING_YEARLY
        ? t('planCatalog.editor.settings.billing.yearly')
        : t('planCatalog.editor.settings.billing.none')

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('planCatalog.create.title')}</DialogTitle>
          <DialogDescription>{t('planCatalog.create.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <FieldInput
            label={t('planCatalog.create.nameLabel')}
            value={form.name}
            onValueChange={(v) => patch({ name: v })}
            placeholder={t('planCatalog.create.namePlaceholder')}
            disabled={isSaving}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <Text
              as="p"
              variant="small"
              color="danger"
              className="-mt-3"
            >
              {errors.name}
            </Text>
          )}

          <FieldInput
            label={t('planCatalog.create.codeLabel')}
            value={form.code}
            onValueChange={(v) => patch({ code: v.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            placeholder={t('planCatalog.create.codePlaceholder')}
            disabled={isSaving}
            aria-invalid={Boolean(errors.code)}
          />
          {errors.code && (
            <Text
              as="p"
              variant="small"
              color="danger"
              className="-mt-3"
            >
              {errors.code}
            </Text>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              {t('planCatalog.create.descriptionLabel')}
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={t('planCatalog.create.descriptionPlaceholder')}
              rows={2}
              disabled={isSaving}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label={t('planCatalog.editor.settings.priceAmount')}
              value={form.priceAmount}
              onValueChange={(v) => patch({ priceAmount: v })}
              placeholder={t('planCatalog.editor.settings.placeholders.priceAmount')}
              type="text"
              inputMode="decimal"
              disabled={isSaving}
              aria-invalid={Boolean(errors.priceAmount)}
            />
            <FieldInput
              label={t('planCatalog.editor.settings.currency')}
              value={form.currency}
              onValueChange={(v) => patch({ currency: v.toUpperCase() })}
              placeholder="EUR"
              disabled={isSaving}
            />
          </div>
          {errors.priceAmount && (
            <Text
              as="p"
              variant="small"
              color="danger"
              className="-mt-3"
            >
              {errors.priceAmount}
            </Text>
          )}

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
                  className="h-10 w-full justify-between font-normal"
                  disabled={isSaving}
                >
                  <span className="truncate">{billingLabel}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-1"
                align="start"
              >
                <div className="flex flex-col gap-0.5">
                  {[
                    {
                      value: PLAN_BILLING_NONE,
                      label: t('planCatalog.editor.settings.billing.none'),
                    },
                    {
                      value: PLAN_BILLING_MONTHLY,
                      label: t('planCatalog.editor.settings.billing.monthly'),
                    },
                    {
                      value: PLAN_BILLING_YEARLY,
                      label: t('planCatalog.editor.settings.billing.yearly'),
                    },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => {
                        patch({ billingInterval: opt.value })
                        setBillingOpen(false)
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
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
              checked={form.isActive}
              disabled={isSaving}
              onCheckedChange={(checked) => patch({ isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            {t('planCatalog.create.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            disabled={isSaving}
            onClick={() => void handleConfirm()}
          >
            {isSaving ? t('planCatalog.create.saving') : t('planCatalog.create.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CreatePlanDialog }
