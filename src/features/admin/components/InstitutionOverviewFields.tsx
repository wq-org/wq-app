import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import {
  INSTITUTION_TYPE_OPTIONS,
  INVOICE_LANGUAGE_VALUES,
  LEGAL_FORM_VALUES,
  STATUS_VARIANT,
} from '../config/institutionFormOptions'
import type {
  Institution,
  InstitutionEditFormValues,
  InvoiceLanguage,
} from '../types/institution.types'

type InstitutionOverviewFieldsProps = {
  institution: Institution | null
  formValues: InstitutionEditFormValues
  onFormChange: (values: InstitutionEditFormValues) => void
  isSaving: boolean
  /** Renders once below all fields (e.g. Cancel / Save). Avoid a second action bar in the parent. */
  footerActions?: ReactNode
}

export function InstitutionOverviewFields({
  institution,
  formValues,
  onFormChange,
  isSaving,
  footerActions,
}: InstitutionOverviewFieldsProps) {
  const { t } = useTranslation('features.admin')

  const updateField = <K extends keyof InstitutionEditFormValues>(
    field: K,
    value: InstitutionEditFormValues[K],
  ) => {
    onFormChange({ ...formValues, [field]: value })
  }

  return (
    <div className="space-y-4">
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

      <FieldInput
        label={t('institutions.table.name')}
        value={formValues.name}
        onValueChange={(value) => updateField('name', value)}
        disabled={isSaving}
        required
      />

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
                ? t(`form.types.${formValues.type}`)
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
                  {t(`form.types.${option}`)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <FieldInput
        label={t('institutions.table.email')}
        value={formValues.email}
        onValueChange={(value) => updateField('email', value)}
        disabled={isSaving}
      />

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

      <FieldTextarea
        label={t('form.fields.description')}
        placeholder={t('form.fields.descriptionPlaceholder')}
        value={formValues.description}
        onValueChange={(value) => updateField('description', value)}
        rows={3}
        hideSeparator={false}
        disabled={isSaving}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4">
        <Label className="font-semibold">{t('form.legal.sectionTitle')}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              htmlFor="overview-legal-form"
              className="font-normal text-sm"
            >
              {t('form.legal.legalForm')}
            </Label>
            <Select
              value={formValues.legalForm || '__none__'}
              onValueChange={(v) => updateField('legalForm', v === '__none__' ? '' : v)}
            >
              <SelectTrigger
                id="overview-legal-form"
                className="w-full justify-between"
              >
                <SelectValue placeholder={t('form.legal.legalFormPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t('form.legal.legalFormPlaceholder')}</SelectItem>
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

      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4">
        <Label className="font-semibold">{t('form.primaryContact.sectionTitle')}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4">
        <Label className="font-semibold">{t('form.billing.sectionTitle')}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              htmlFor="overview-invoice-language"
              className="font-normal text-sm"
            >
              {t('form.billing.invoiceLanguage')}
            </Label>
            <Select
              value={formValues.invoiceLanguage}
              onValueChange={(v) => updateField('invoiceLanguage', v as InvoiceLanguage)}
            >
              <SelectTrigger
                id="overview-invoice-language"
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
              htmlFor="overview-payment-terms"
              className="font-normal text-sm"
            >
              {t('form.billing.paymentTerms')}
            </Label>
            <Input
              id="overview-payment-terms"
              type="number"
              min={1}
              placeholder={t('form.billing.paymentTermsPlaceholder')}
              value={formValues.paymentTerms}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10)
                updateField('paymentTerms', Number.isFinite(parsed) ? parsed : 0)
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 text-base"
            />
          </div>
        </div>
      </div>

      {footerActions != null ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-6">
          {footerActions}
        </div>
      ) : null}
    </div>
  )
}
