import { useState, useCallback, useMemo, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { COUNTRY_OPTIONS, getCountryLabel, findCountryByCode } from '../config/countryOptions'
import type {
  InstitutionType,
  InstitutionStatus,
  InstitutionFormData,
  AddressJsonb,
  InvoiceLanguage,
} from '../types/institution.types'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

const INSTITUTION_TYPE_VALUES: InstitutionType[] = [
  'school',
  'university',
  'college',
  'organization',
  'hospital',
  'other',
]

const INSTITUTION_STATUS_VALUES: InstitutionStatus[] = [
  'active',
  'inactive',
  'suspended',
  'pending',
]

const LEGAL_FORM_VALUES = ['gmbh', 'ggmbh', 'ag', 'ev', 'kg', 'other'] as const

const INVOICE_LANGUAGE_VALUES: InvoiceLanguage[] = ['de', 'en']

type InstitutionFormProps = {
  onSubmit?: (data: InstitutionFormData) => void
  onCancel?: () => void
}

const initialFormData: InstitutionFormData = {
  name: '',
  slug: '',
  type: '',
  status: 'active',
  description: '',
  email: '',
  website: '',
  phone: '',
  legalName: '',
  legalForm: '',
  registrationNumber: '',
  taxId: '',
  vatId: '',
  billingEmail: '',
  billingContactName: '',
  billingContactPhone: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  primaryContactRole: '',
  invoiceLanguage: 'de',
  paymentTerms: 30,
  address: { country: 'DE' },
  institutionNumber: '',
  numberOfBeds: undefined,
  departments: [],
  accreditation: '',
  socialLinks: { linkedin: '', instagram: '' },
  imageUrl: DEFAULT_INSTITUTION_IMAGE,
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseOptionalNumber(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

type CountryComboboxProps = {
  value: string
  onValueChange: (code: string) => void
  placeholder?: string
  disabled?: boolean
}

function CountryCombobox({ value, onValueChange, placeholder, disabled }: CountryComboboxProps) {
  const { i18n, t } = useTranslation('features.admin')
  const lang = i18n.language

  const selectedOption = useMemo(() => (value ? findCountryByCode(value) : undefined), [value])

  return (
    <Combobox
      value={value}
      onValueChange={(v) => onValueChange((v as string) ?? '')}
      getOptionAsString={(opt) => {
        const country = findCountryByCode(opt as string)
        return country ? `${country.en} ${country.de}` : (opt as string)
      }}
    >
      <ComboboxInput
        placeholder={selectedOption ? getCountryLabel(selectedOption, lang) : placeholder}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>{t('form.address.countryNoResults')}</ComboboxEmpty>
          {COUNTRY_OPTIONS.map((country) => (
            <ComboboxItem
              key={country.code}
              value={country.code}
            >
              {getCountryLabel(country, lang)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function InstitutionInformationForm({ onSubmit, onCancel }: InstitutionFormProps) {
  const { t } = useTranslation('features.admin')
  const [formData, setFormData] = useState<InstitutionFormData>(initialFormData)
  const [isSlugTouched, setIsSlugTouched] = useState(false)

  const handleNameChange = useCallback(
    (name: string) => {
      setFormData((prev) => ({
        ...prev,
        name,
        slug: isSlugTouched ? prev.slug : slugify(name),
      }))
    },
    [isSlugTouched],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData(initialFormData)
    setIsSlugTouched(false)
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setIsSlugTouched(false)
    onCancel?.()
  }

  const handleAddressChange = (field: keyof AddressJsonb, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value || undefined },
    }))
  }

  const handleSocialLinkChange = (platform: 'linkedin' | 'instagram', value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }))
  }

  const handleDepartmentsChange = (value: string) => {
    const departments = value
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0)
    setFormData((prev) => ({ ...prev, departments }))
  }

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.slug.trim().length > 0 &&
    formData.type !== '' &&
    formData.description.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.website.trim().length > 0 &&
    formData.phone.trim().length > 0 &&
    formData.legalName.trim().length > 0 &&
    formData.legalForm.trim().length > 0 &&
    formData.vatId.trim().length > 0 &&
    formData.primaryContactName.trim().length > 0 &&
    formData.primaryContactEmail.trim().length > 0 &&
    formData.billingEmail.trim().length > 0 &&
    (formData.address.street ?? '').trim().length > 0 &&
    (formData.address.city ?? '').trim().length > 0 &&
    (formData.address.postalCode ?? '').trim().length > 0 &&
    (formData.address.country ?? '').trim().length > 0 &&
    formData.paymentTerms > 0 &&
    (formData.socialLinks.linkedin ?? '').trim().length > 0 &&
    (formData.socialLinks.instagram ?? '').trim().length > 0

  const req = (
    <Text
      as="span"
      variant="small"
      className="text-red-500"
    >
      *
    </Text>
  )

  return (
    <Card className="border max-w-3xl w-full shadow-sm">
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">{t('form.title')}</CardTitle>
          <Text
            as="p"
            variant="body"
            className="text-sm mt-2 font-normal"
          >
            {t('form.subtitle')}
          </Text>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-name"
              className="font-normal"
            >
              {t('form.fields.name')} {req}
            </Label>
            <Input
              id="institution-name"
              placeholder={t('form.fields.namePlaceholder')}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="text-base py-2 px-3 w-full"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-slug"
              className="font-normal"
            >
              {t('form.fields.slug')} {req}
            </Label>
            <Input
              id="institution-slug"
              placeholder={t('form.fields.slugPlaceholder')}
              value={formData.slug}
              onChange={(e) => {
                setIsSlugTouched(true)
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }}
              className="text-base py-2 px-3 w-full"
            />
            <Text
              as="p"
              variant="body"
              className="text-xs"
            >
              {t('form.fields.slugHint')}
            </Text>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-type"
                className="font-normal"
              >
                {t('form.fields.type')} {req}
              </Label>
              <Select
                value={formData.type || '__none__'}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: v === '__none__' ? '' : (v as InstitutionType),
                  }))
                }
              >
                <SelectTrigger
                  id="institution-type"
                  className="w-full justify-between"
                >
                  <SelectValue placeholder={t('form.fields.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('form.fields.typePlaceholder')}</SelectItem>
                  {INSTITUTION_TYPE_VALUES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {t(`form.types.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-status"
                className="font-normal"
              >
                {t('form.fields.status')}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, status: v as InstitutionStatus }))
                }
              >
                <SelectTrigger
                  id="institution-status"
                  className="w-full justify-between"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_STATUS_VALUES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {t(`form.statuses.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-description"
              className="font-normal"
            >
              {t('form.fields.description')} {req}
            </Label>
            <Textarea
              id="institution-description"
              placeholder={t('form.fields.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="resize-none w-full"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-email"
                className="font-normal"
              >
                {t('form.fields.email')} {req}
              </Label>
              <Input
                id="institution-email"
                type="email"
                placeholder={t('form.fields.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="text-base py-2 px-3 w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-phone"
                className="font-normal"
              >
                {t('form.fields.phone')} {req}
              </Label>
              <Input
                id="institution-phone"
                type="tel"
                placeholder={t('form.fields.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="text-base py-2 px-3 w-full"
              />
            </div>
          </div>

          {/* Website */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-website"
              className="font-normal"
            >
              {t('form.fields.website')} {req}
            </Label>
            <Input
              id="institution-website"
              type="url"
              placeholder={t('form.fields.websitePlaceholder')}
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
          </div>

          {/* Legal Information */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
            <Label className="font-semibold">{t('form.legal.sectionTitle')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-legal-name"
                  className="font-normal text-sm"
                >
                  {t('form.legal.legalName')} *
                </Label>
                <Input
                  id="institution-legal-name"
                  placeholder={t('form.legal.legalNamePlaceholder')}
                  value={formData.legalName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-legal-form"
                  className="font-normal text-sm"
                >
                  {t('form.legal.legalForm')} *
                </Label>
                <Select
                  value={formData.legalForm || '__none__'}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, legalForm: v === '__none__' ? '' : v }))
                  }
                >
                  <SelectTrigger
                    id="institution-legal-form"
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

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-vat-id"
                  className="font-normal text-sm"
                >
                  {t('form.legal.vatId')} *
                </Label>
                <Input
                  id="institution-vat-id"
                  placeholder={t('form.legal.vatIdPlaceholder')}
                  value={formData.vatId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatId: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-registration-number"
                  className="font-normal text-sm"
                >
                  {t('form.legal.registrationNumber')}
                </Label>
                <Input
                  id="institution-registration-number"
                  placeholder={t('form.legal.registrationNumberPlaceholder')}
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-tax-id"
                  className="font-normal text-sm"
                >
                  {t('form.legal.taxId')}
                </Label>
                <Input
                  id="institution-tax-id"
                  placeholder={t('form.legal.taxIdPlaceholder')}
                  value={formData.taxId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
            <Label className="font-semibold">{t('form.primaryContact.sectionTitle')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-primary-contact-name"
                  className="font-normal text-sm"
                >
                  {t('form.primaryContact.contactName')} *
                </Label>
                <Input
                  id="institution-primary-contact-name"
                  placeholder={t('form.primaryContact.contactNamePlaceholder')}
                  value={formData.primaryContactName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryContactName: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-primary-contact-role"
                  className="font-normal text-sm"
                >
                  {t('form.primaryContact.contactRole')}
                </Label>
                <Input
                  id="institution-primary-contact-role"
                  placeholder={t('form.primaryContact.contactRolePlaceholder')}
                  value={formData.primaryContactRole}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryContactRole: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-primary-contact-email"
                  className="font-normal text-sm"
                >
                  {t('form.primaryContact.contactEmail')} *
                </Label>
                <Input
                  id="institution-primary-contact-email"
                  type="email"
                  placeholder={t('form.primaryContact.contactEmailPlaceholder')}
                  value={formData.primaryContactEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryContactEmail: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-primary-contact-phone"
                  className="font-normal text-sm"
                >
                  {t('form.primaryContact.contactPhone')}
                </Label>
                <Input
                  id="institution-primary-contact-phone"
                  type="tel"
                  placeholder={t('form.primaryContact.contactPhonePlaceholder')}
                  value={formData.primaryContactPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryContactPhone: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
            <Label className="font-semibold">{t('form.billing.sectionTitle')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-billing-email"
                  className="font-normal text-sm"
                >
                  {t('form.billing.billingEmail')} *
                </Label>
                <Input
                  id="institution-billing-email"
                  type="email"
                  placeholder={t('form.billing.billingEmailPlaceholder')}
                  value={formData.billingEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingEmail: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-billing-contact-name"
                  className="font-normal text-sm"
                >
                  {t('form.billing.billingContactName')}
                </Label>
                <Input
                  id="institution-billing-contact-name"
                  placeholder={t('form.billing.billingContactNamePlaceholder')}
                  value={formData.billingContactName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingContactName: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-billing-contact-phone"
                  className="font-normal text-sm"
                >
                  {t('form.billing.billingContactPhone')}
                </Label>
                <Input
                  id="institution-billing-contact-phone"
                  type="tel"
                  placeholder={t('form.billing.billingContactPhonePlaceholder')}
                  value={formData.billingContactPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingContactPhone: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-invoice-language"
                  className="font-normal text-sm"
                >
                  {t('form.billing.invoiceLanguage')}
                </Label>
                <Select
                  value={formData.invoiceLanguage}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, invoiceLanguage: v as InvoiceLanguage }))
                  }
                >
                  <SelectTrigger
                    id="institution-invoice-language"
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
                  htmlFor="institution-payment-terms"
                  className="font-normal text-sm"
                >
                  {t('form.billing.paymentTerms')}
                </Label>
                <Input
                  id="institution-payment-terms"
                  type="number"
                  min={1}
                  placeholder={t('form.billing.paymentTermsPlaceholder')}
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentTerms: parseOptionalNumber(e.target.value) ?? 0,
                    }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
            <Label className="font-semibold">{t('form.address.sectionTitle')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-street"
                  className="font-normal text-sm"
                >
                  {t('form.address.street')} *
                </Label>
                <Input
                  id="institution-street"
                  placeholder={t('form.address.streetPlaceholder')}
                  value={formData.address.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-address-line-2"
                  className="font-normal text-sm"
                >
                  {t('form.address.addressLine2')}
                </Label>
                <Input
                  id="institution-address-line-2"
                  placeholder={t('form.address.addressLine2Placeholder')}
                  value={formData.address.addressLine2 || ''}
                  onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-postal-code"
                  className="font-normal text-sm"
                >
                  {t('form.address.postalCode')} *
                </Label>
                <Input
                  id="institution-postal-code"
                  placeholder={t('form.address.postalCodePlaceholder')}
                  maxLength={5}
                  value={formData.address.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-city"
                  className="font-normal text-sm"
                >
                  {t('form.address.city')} *
                </Label>
                <Input
                  id="institution-city"
                  placeholder={t('form.address.cityPlaceholder')}
                  value={formData.address.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-state"
                  className="font-normal text-sm"
                >
                  {t('form.address.state')}
                </Label>
                <Input
                  id="institution-state"
                  placeholder={t('form.address.statePlaceholder')}
                  value={formData.address.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-country"
                  className="font-normal text-sm"
                >
                  {t('form.address.country')} *
                </Label>
                <CountryCombobox
                  value={formData.address.country || ''}
                  onValueChange={(country) => handleAddressChange('country', country)}
                  placeholder={t('form.address.countryPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          {formData.type === 'hospital' && (
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
              <Label className="font-semibold">{t('form.hospital.sectionTitle')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="institution-number"
                    className="font-normal text-sm"
                  >
                    {t('form.hospital.institutionNumber')}
                  </Label>
                  <Input
                    id="institution-number"
                    placeholder={t('form.hospital.institutionNumberPlaceholder')}
                    value={formData.institutionNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, institutionNumber: e.target.value }))
                    }
                    className="text-base py-2 px-3 w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="institution-number-of-beds"
                    className="font-normal text-sm"
                  >
                    {t('form.hospital.numberOfBeds')}
                  </Label>
                  <Input
                    id="institution-number-of-beds"
                    type="number"
                    min={0}
                    placeholder={t('form.hospital.numberOfBedsPlaceholder')}
                    value={formData.numberOfBeds ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        numberOfBeds: parseOptionalNumber(e.target.value),
                      }))
                    }
                    className="text-base py-2 px-3 w-full"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor="institution-departments"
                    className="font-normal text-sm"
                  >
                    {t('form.hospital.departments')}
                  </Label>
                  <Input
                    id="institution-departments"
                    placeholder={t('form.hospital.departmentsPlaceholder')}
                    value={formData.departments.join(', ')}
                    onChange={(e) => handleDepartmentsChange(e.target.value)}
                    className="text-base py-2 px-3 w-full"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor="institution-accreditation"
                    className="font-normal text-sm"
                  >
                    {t('form.hospital.accreditation')}
                  </Label>
                  <Input
                    id="institution-accreditation"
                    placeholder={t('form.hospital.accreditationPlaceholder')}
                    value={formData.accreditation}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, accreditation: e.target.value }))
                    }
                    className="text-base py-2 px-3 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
            <Label className="font-normal">
              {t('form.socialLinks.sectionTitle')} {req}
            </Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-linkedin"
                  className="font-normal text-sm"
                >
                  {t('form.socialLinks.linkedin')} *
                </Label>
                <Input
                  id="institution-linkedin"
                  type="url"
                  placeholder={t('form.socialLinks.linkedinPlaceholder')}
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-instagram"
                  className="font-normal text-sm"
                >
                  {t('form.socialLinks.instagram')} *
                </Label>
                <Input
                  id="institution-instagram"
                  type="url"
                  placeholder={t('form.socialLinks.instagramPlaceholder')}
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-image-url"
              className="font-normal"
            >
              {t('form.fields.imageUrl')}
            </Label>
            <Input
              id="institution-image-url"
              type="url"
              placeholder={t('form.fields.imageUrlPlaceholder')}
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
            <Text
              as="p"
              variant="body"
              className="text-xs mt-1"
            >
              {t('form.fields.imageUrlHint')}
            </Text>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
          >
            {t('form.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="darkblue"
            disabled={!isFormValid}
          >
            {t('form.actions.create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
