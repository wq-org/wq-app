import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge-variants'
import { InstitutionSubscriptionDetails } from '@/features/institution-admin'
import type {
  Institution,
  InstitutionEditFormValues,
  InstitutionStatus,
  InvoiceLanguage,
} from '../types/institution.types'
import {
  INSTITUTION_TYPE_OPTIONS,
  INVOICE_LANGUAGE_VALUES,
  LEGAL_FORM_VALUES,
} from '../config/institutionFormOptions'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_VARIANT: Record<InstitutionStatus, BadgeVariant> = {
  active: 'outline',
  pending: 'blue',
  inactive: 'secondary',
  suspended: 'destructive',
}

function formatInstitutionTypeLabel(value: string): string {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type InstitutionDetailsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: Institution | null
  formValues: InstitutionEditFormValues
  onFormChange: (values: InstitutionEditFormValues) => void
  onSave: () => Promise<void>
}

export function InstitutionDetailsDrawer({
  open,
  onOpenChange,
  institution,
  formValues,
  onFormChange,
  onSave,
}: InstitutionDetailsDrawerProps) {
  const { t } = useTranslation('features.admin')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(() => formValues.name.trim().length > 0, [formValues.name])

  const handleSave = async () => {
    if (!institution || !canSave) return
    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = <K extends keyof InstitutionEditFormValues>(
    field: K,
    value: InstitutionEditFormValues[K],
  ) => {
    onFormChange({ ...formValues, [field]: value })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[50vw]! max-w-none! min-w-[50vw] sm:max-w-none! flex h-full flex-col">
        <DrawerHeader>
          <DrawerTitle>{t('institutions.editDrawer.title')}</DrawerTitle>
          <DrawerDescription>{t('institutions.editDrawer.description')}</DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-4 px-4 pb-6">
              {/* Slug (read-only) */}
              <div className="space-y-2">
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="text-xs"
                >
                  {t('institutions.editDrawer.slugNote')}
                </Text>
                <FieldInput
                  label={t('institutions.table.slug')}
                  value={institution?.slug ?? ''}
                  disabled
                />
              </div>

              {/* Name */}
              <FieldInput
                label={t('institutions.table.name')}
                value={formValues.name}
                onValueChange={(value) => updateField('name', value)}
                disabled={isSaving}
                required
              />

              {/* Type */}
              <div className="space-y-2">
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="text-xs"
                >
                  {t('institutions.table.type')}
                </Text>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      disabled={isSaving}
                    >
                      {formValues.type
                        ? formatInstitutionTypeLabel(formValues.type)
                        : t('institutions.editDrawer.selectType')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-56 p-1"
                  >
                    <div className="flex flex-col gap-1">
                      {INSTITUTION_TYPE_OPTIONS.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant="ghost"
                          className="justify-start"
                          onClick={() => updateField('type', option)}
                        >
                          {formatInstitutionTypeLabel(option)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Email */}
              <FieldInput
                label={t('institutions.table.email')}
                value={formValues.email}
                onValueChange={(value) => updateField('email', value)}
                disabled={isSaving}
              />

              {/* Status (read-only) */}
              <div className="space-y-2">
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="text-xs"
                >
                  {t('institutions.table.status')}
                </Text>
                {institution?.status ? (
                  <Badge variant={STATUS_VARIANT[institution.status] ?? 'secondary'}>
                    {t(`form.statuses.${institution.status}`)}
                  </Badge>
                ) : (
                  <Text
                    as="p"
                    variant="small"
                    color="muted"
                    className="text-xs"
                  >
                    —
                  </Text>
                )}
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="text-xs"
                >
                  {t('institutions.editDrawer.statusReadOnly')}
                </Text>
              </div>

              {/* Description */}
              <FieldTextarea
                label={t('form.fields.description')}
                placeholder={t('form.fields.descriptionPlaceholder')}
                value={formValues.description}
                onValueChange={(value) => updateField('description', value)}
                rows={3}
                hideSeparator={false}
                disabled={isSaving}
              />

              {/* Phone + Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldInput
                  label={t('form.fields.phone')}
                  value={formValues.phone}
                  onValueChange={(value) => updateField('phone', value)}
                  type="tel"
                  placeholder={t('form.fields.phonePlaceholder')}
                  disabled={isSaving}
                />
                <FieldInput
                  label={t('form.fields.website')}
                  value={formValues.website}
                  onValueChange={(value) => updateField('website', value)}
                  type="url"
                  placeholder={t('form.fields.websitePlaceholder')}
                  disabled={isSaving}
                />
              </div>

              {/* Legal Information */}
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
                <Label className="font-semibold">{t('form.legal.sectionTitle')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <FieldInput
                      label={t('form.legal.legalName')}
                      value={formValues.legalName}
                      onValueChange={(value) => updateField('legalName', value)}
                      placeholder={t('form.legal.legalNamePlaceholder')}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="drawer-legal-form"
                      className="font-normal text-sm"
                    >
                      {t('form.legal.legalForm')}
                    </Label>
                    <Select
                      value={formValues.legalForm || '__none__'}
                      onValueChange={(v) => updateField('legalForm', v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger
                        id="drawer-legal-form"
                        className="w-full justify-between"
                      >
                        <SelectValue placeholder={t('form.legal.legalFormPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">
                          {t('form.legal.legalFormPlaceholder')}
                        </SelectItem>
                        {LEGAL_FORM_VALUES.map((value) => (
                          <SelectItem
                            key={value}
                            value={value}
                          >
                            {t(`form.legalForms.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FieldInput
                    label={t('form.legal.vatId')}
                    value={formValues.vatId}
                    onValueChange={(value) => updateField('vatId', value)}
                    placeholder={t('form.legal.vatIdPlaceholder')}
                    disabled={isSaving}
                  />

                  <FieldInput
                    label={t('form.legal.registrationNumber')}
                    value={formValues.registrationNumber}
                    onValueChange={(value) => updateField('registrationNumber', value)}
                    placeholder={t('form.legal.registrationNumberPlaceholder')}
                    disabled={isSaving}
                  />

                  <FieldInput
                    label={t('form.legal.taxId')}
                    value={formValues.taxId}
                    onValueChange={(value) => updateField('taxId', value)}
                    placeholder={t('form.legal.taxIdPlaceholder')}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Primary Contact */}
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
                <Label className="font-semibold">{t('form.primaryContact.sectionTitle')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldInput
                    label={t('form.primaryContact.contactName')}
                    value={formValues.primaryContactName}
                    onValueChange={(value) => updateField('primaryContactName', value)}
                    placeholder={t('form.primaryContact.contactNamePlaceholder')}
                    disabled={isSaving}
                  />
                  <FieldInput
                    label={t('form.primaryContact.contactRole')}
                    value={formValues.primaryContactRole}
                    onValueChange={(value) => updateField('primaryContactRole', value)}
                    placeholder={t('form.primaryContact.contactRolePlaceholder')}
                    disabled={isSaving}
                  />
                  <FieldInput
                    label={t('form.primaryContact.contactEmail')}
                    value={formValues.primaryContactEmail}
                    onValueChange={(value) => updateField('primaryContactEmail', value)}
                    placeholder={t('form.primaryContact.contactEmailPlaceholder')}
                    type="email"
                    disabled={isSaving}
                  />
                  <FieldInput
                    label={t('form.primaryContact.contactPhone')}
                    value={formValues.primaryContactPhone}
                    onValueChange={(value) => updateField('primaryContactPhone', value)}
                    placeholder={t('form.primaryContact.contactPhonePlaceholder')}
                    type="tel"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Billing Information */}
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
                <Label className="font-semibold">{t('form.billing.sectionTitle')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <FieldInput
                      label={t('form.billing.billingEmail')}
                      value={formValues.billingEmail}
                      onValueChange={(value) => updateField('billingEmail', value)}
                      placeholder={t('form.billing.billingEmailPlaceholder')}
                      type="email"
                      disabled={isSaving}
                    />
                  </div>
                  <FieldInput
                    label={t('form.billing.billingContactName')}
                    value={formValues.billingContactName}
                    onValueChange={(value) => updateField('billingContactName', value)}
                    placeholder={t('form.billing.billingContactNamePlaceholder')}
                    disabled={isSaving}
                  />
                  <FieldInput
                    label={t('form.billing.billingContactPhone')}
                    value={formValues.billingContactPhone}
                    onValueChange={(value) => updateField('billingContactPhone', value)}
                    placeholder={t('form.billing.billingContactPhonePlaceholder')}
                    type="tel"
                    disabled={isSaving}
                  />

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="drawer-invoice-language"
                      className="font-normal text-sm"
                    >
                      {t('form.billing.invoiceLanguage')}
                    </Label>
                    <Select
                      value={formValues.invoiceLanguage}
                      onValueChange={(v) => updateField('invoiceLanguage', v as InvoiceLanguage)}
                    >
                      <SelectTrigger
                        id="drawer-invoice-language"
                        className="w-full justify-between"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_LANGUAGE_VALUES.map((value) => (
                          <SelectItem
                            key={value}
                            value={value}
                          >
                            {t(`form.invoiceLanguages.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="drawer-payment-terms"
                      className="font-normal text-sm"
                    >
                      {t('form.billing.paymentTerms')}
                    </Label>
                    <Input
                      id="drawer-payment-terms"
                      type="number"
                      min={1}
                      placeholder={t('form.billing.paymentTermsPlaceholder')}
                      value={formValues.paymentTerms}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10)
                        updateField('paymentTerms', Number.isFinite(parsed) ? parsed : 0)
                      }}
                      disabled={isSaving}
                      className="text-base py-2 px-3 w-full"
                    />
                  </div>
                </div>
              </div>

              {open && institution?.id ? (
                <InstitutionSubscriptionDetails
                  key={institution.id}
                  institutionId={institution.id}
                />
              ) : null}
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('institutions.editDrawer.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSave}
            disabled={isSaving || !canSave}
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Spinner
                  size="xs"
                  variant="white"
                />
                {t('institutions.editDrawer.saving')}
              </span>
            ) : (
              t('institutions.editDrawer.save')
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
