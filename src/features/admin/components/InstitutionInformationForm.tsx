import { useState } from 'react'
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { CountryCombobox } from './CountryCombobox'
import { getCountryDisplayValue } from '../config/countryOptions'
import type { InstitutionFormData } from '../types/institution.types'
import {
  INSTITUTION_TYPE_OPTIONS,
  INSTITUTION_STATUS_VALUES,
  INVOICE_LANGUAGE_VALUES,
  LEGAL_FORM_VALUES,
} from '../config/institutionFormOptions'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { slugifyInstitutionName } from '../utils/institutionSlug'
import { institutionSchema, type InstitutionFormValues } from '../schemas/institution.schema'

type InstitutionFormProps = {
  onSubmit?: (data: InstitutionFormData) => void
  onCancel?: () => void
}

const DEFAULT_VALUES: InstitutionFormValues = {
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
  address: { street: '', addressLine2: '', city: '', state: '', country: '', postalCode: '' },
  institutionNumber: '',
  numberOfBeds: undefined,
  departments: '',
  accreditation: '',
  socialLinks: { linkedin: '', instagram: '' },
  imageUrl: DEFAULT_INSTITUTION_IMAGE,
}

export function InstitutionInformationForm({ onSubmit, onCancel }: InstitutionFormProps) {
  const { t, i18n } = useTranslation('features.admin')
  const [isSlugTouched, setIsSlugTouched] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema) as Resolver<InstitutionFormValues>,
    defaultValues: DEFAULT_VALUES,
  })

  const typeValue = watch('type')

  const onFormSubmit: SubmitHandler<InstitutionFormValues> = (values) => {
    const departments = values.departments
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
    onSubmit?.({ ...values, departments } as InstitutionFormData)
    reset(DEFAULT_VALUES)
    setIsSlugTouched(false)
  }

  const handleCancel = () => {
    reset(DEFAULT_VALUES)
    setIsSlugTouched(false)
    onCancel?.()
  }

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
        onSubmit={handleSubmit(onFormSubmit)}
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
              aria-describedby={errors.name ? 'institution-name-error' : undefined}
              className="text-base py-2 px-3 w-full"
              {...register('name', {
                onChange: (e) => {
                  if (!isSlugTouched) {
                    setValue('slug', slugifyInstitutionName(e.target.value))
                  }
                },
              })}
            />
            {errors.name ? (
              <span
                id="institution-name-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.name.message}
              </span>
            ) : null}
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
              aria-describedby={errors.slug ? 'institution-slug-error' : undefined}
              className="text-base py-2 px-3 w-full"
              {...register('slug', {
                onChange: () => setIsSlugTouched(true),
              })}
            />
            {errors.slug ? (
              <span
                id="institution-slug-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.slug.message}
              </span>
            ) : null}
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
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger
                      id="institution-type"
                      className="w-full justify-between"
                      aria-describedby={errors.type ? 'institution-type-error' : undefined}
                    >
                      <SelectValue placeholder={t('form.fields.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('form.fields.typePlaceholder')}</SelectItem>
                      {INSTITUTION_TYPE_OPTIONS.map((value) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {t(`form.types.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type ? (
                <span
                  id="institution-type-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.type.message}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-status"
                className="font-normal"
              >
                {t('form.fields.status')}
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                )}
              />
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
              rows={4}
              aria-describedby={errors.description ? 'institution-description-error' : undefined}
              className="resize-none w-full"
              {...register('description')}
            />
            {errors.description ? (
              <span
                id="institution-description-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.description.message}
              </span>
            ) : null}
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
                aria-describedby={errors.email ? 'institution-email-error' : undefined}
                className="text-base py-2 px-3 w-full"
                {...register('email')}
              />
              {errors.email ? (
                <span
                  id="institution-email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.email.message}
                </span>
              ) : null}
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
                aria-describedby={errors.phone ? 'institution-phone-error' : undefined}
                className="text-base py-2 px-3 w-full"
                {...register('phone')}
              />
              {errors.phone ? (
                <span
                  id="institution-phone-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.phone.message}
                </span>
              ) : null}
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
              aria-describedby={errors.website ? 'institution-website-error' : undefined}
              className="text-base py-2 px-3 w-full"
              {...register('website')}
            />
            {errors.website ? (
              <span
                id="institution-website-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.website.message}
              </span>
            ) : null}
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
                  aria-describedby={errors.legalName ? 'institution-legal-name-error' : undefined}
                  className="text-base py-2 px-3 w-full"
                  {...register('legalName')}
                />
                {errors.legalName ? (
                  <span
                    id="institution-legal-name-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.legalName.message}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-legal-form"
                  className="font-normal text-sm"
                >
                  {t('form.legal.legalForm')} *
                </Label>
                <Controller
                  name="legalForm"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger
                        id="institution-legal-form"
                        className="w-full justify-between"
                        aria-describedby={
                          errors.legalForm ? 'institution-legal-form-error' : undefined
                        }
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
                  )}
                />
                {errors.legalForm ? (
                  <span
                    id="institution-legal-form-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.legalForm.message}
                  </span>
                ) : null}
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
                  aria-describedby={errors.vatId ? 'institution-vat-id-error' : undefined}
                  className="text-base py-2 px-3 w-full"
                  {...register('vatId')}
                />
                {errors.vatId ? (
                  <span
                    id="institution-vat-id-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.vatId.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('registrationNumber')}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('taxId')}
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
                  aria-describedby={
                    errors.primaryContactName ? 'institution-primary-contact-name-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('primaryContactName')}
                />
                {errors.primaryContactName ? (
                  <span
                    id="institution-primary-contact-name-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.primaryContactName.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('primaryContactRole')}
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
                  aria-describedby={
                    errors.primaryContactEmail
                      ? 'institution-primary-contact-email-error'
                      : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('primaryContactEmail')}
                />
                {errors.primaryContactEmail ? (
                  <span
                    id="institution-primary-contact-email-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.primaryContactEmail.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('primaryContactPhone')}
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
                  aria-describedby={
                    errors.billingEmail ? 'institution-billing-email-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('billingEmail')}
                />
                {errors.billingEmail ? (
                  <span
                    id="institution-billing-email-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.billingEmail.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('billingContactName')}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('billingContactPhone')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-invoice-language"
                  className="font-normal text-sm"
                >
                  {t('form.billing.invoiceLanguage')}
                </Label>
                <Controller
                  name="invoiceLanguage"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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
                  )}
                />
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
                  aria-describedby={
                    errors.paymentTerms ? 'institution-payment-terms-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('paymentTerms', { valueAsNumber: true })}
                />
                {errors.paymentTerms ? (
                  <span
                    id="institution-payment-terms-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.paymentTerms.message}
                  </span>
                ) : null}
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
                  aria-describedby={errors.address?.street ? 'institution-street-error' : undefined}
                  className="text-base py-2 px-3 w-full"
                  {...register('address.street')}
                />
                {errors.address?.street ? (
                  <span
                    id="institution-street-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.address.street.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('address.addressLine2')}
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
                  aria-describedby={
                    errors.address?.postalCode ? 'institution-postal-code-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('address.postalCode')}
                />
                {errors.address?.postalCode ? (
                  <span
                    id="institution-postal-code-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.address.postalCode.message}
                  </span>
                ) : null}
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
                  aria-describedby={errors.address?.city ? 'institution-city-error' : undefined}
                  className="text-base py-2 px-3 w-full"
                  {...register('address.city')}
                />
                {errors.address?.city ? (
                  <span
                    id="institution-city-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.address.city.message}
                  </span>
                ) : null}
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
                  className="text-base py-2 px-3 w-full"
                  {...register('address.state')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-country"
                  className="font-normal text-sm"
                >
                  {t('form.address.country')} *
                </Label>
                <Controller
                  name="address.country"
                  control={control}
                  render={({ field }) => (
                    <CountryCombobox
                      value={field.value}
                      onValueChange={(country) =>
                        field.onChange(getCountryDisplayValue(country, i18n.language))
                      }
                      placeholder={t('form.address.countryPlaceholder')}
                    />
                  )}
                />
                {errors.address?.country ? (
                  <span
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.address.country.message}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          {typeValue === 'hospital' && (
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
                    className="text-base py-2 px-3 w-full"
                    {...register('institutionNumber')}
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
                    aria-describedby={
                      errors.numberOfBeds ? 'institution-number-of-beds-error' : undefined
                    }
                    className="text-base py-2 px-3 w-full"
                    {...register('numberOfBeds', { valueAsNumber: true })}
                  />
                  {errors.numberOfBeds ? (
                    <span
                      id="institution-number-of-beds-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.numberOfBeds.message}
                    </span>
                  ) : null}
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
                    className="text-base py-2 px-3 w-full"
                    {...register('departments')}
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
                    className="text-base py-2 px-3 w-full"
                    {...register('accreditation')}
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
                  aria-describedby={
                    errors.socialLinks?.linkedin ? 'institution-linkedin-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('socialLinks.linkedin')}
                />
                {errors.socialLinks?.linkedin ? (
                  <span
                    id="institution-linkedin-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.socialLinks.linkedin.message}
                  </span>
                ) : null}
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
                  aria-describedby={
                    errors.socialLinks?.instagram ? 'institution-instagram-error' : undefined
                  }
                  className="text-base py-2 px-3 w-full"
                  {...register('socialLinks.instagram')}
                />
                {errors.socialLinks?.instagram ? (
                  <span
                    id="institution-instagram-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.socialLinks.instagram.message}
                  </span>
                ) : null}
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
              className="text-base py-2 px-3 w-full"
              {...register('imageUrl')}
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
          >
            {t('form.actions.create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
