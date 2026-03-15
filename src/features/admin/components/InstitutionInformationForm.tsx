import { useState, useCallback, type FormEvent } from 'react'
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
import type {
  InstitutionType,
  InstitutionStatus,
  InstitutionFormData,
  AddressJsonb,
  InvoiceLanguage,
} from '@/features/admin/types/institution.types'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'organization', label: 'Organization' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'other', label: 'Other' },
]

const INSTITUTION_STATUSES: { value: InstitutionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
]

const LEGAL_FORMS = [
  { value: 'gmbh', label: 'GmbH' },
  { value: 'ggmbh', label: 'gGmbH (gemeinnutzig)' },
  { value: 'ag', label: 'AG' },
  { value: 'ev', label: 'e.V.' },
  { value: 'kg', label: 'KG' },
  { value: 'other', label: 'Other' },
]

const INVOICE_LANGUAGES: { value: InvoiceLanguage; label: string }[] = [
  { value: 'de', label: 'German (DE)' },
  { value: 'en', label: 'English (EN)' },
]

interface InstitutionFormProps {
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
  address: { country: 'Germany' },
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

export function InstitutionInformationForm({ onSubmit, onCancel }: InstitutionFormProps) {
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
      .map((department) => department.trim())
      .filter((department) => department.length > 0)

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

  return (
    <Card className="border max-w-3xl w-full shadow-sm">
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900">Basic Information</CardTitle>
          <Text
            as="p"
            variant="body"
            className="text-sm text-gray-500 mt-2 font-normal"
          >
            Add the basic details for your institution. Fields marked with * are required.
          </Text>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-name"
              className="font-normal text-gray-700"
            >
              Institution Name{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <Input
              id="institution-name"
              placeholder="e.g., Kreiskliniken Reutlingen"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-slug"
              className="font-normal text-gray-700"
            >
              Slug{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <Input
              id="institution-slug"
              placeholder="kreiskliniken-reutlingen"
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
              className="text-xs text-gray-400"
            >
              URL-friendly identifier. Auto-generated from name unless manually edited.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-type"
                className="font-normal text-gray-700"
              >
                Type{' '}
                <Text
                  as="span"
                  variant="small"
                  className="text-red-500"
                >
                  *
                </Text>
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
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select institution type</SelectItem>
                  {INSTITUTION_TYPES.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-status"
                className="font-normal text-gray-700"
              >
                Status
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
                  {INSTITUTION_STATUSES.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-description"
              className="font-normal text-gray-700"
            >
              Description{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <Textarea
              id="institution-description"
              placeholder="Enter a brief description of the institution..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="resize-none w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-email"
                className="font-normal text-gray-700"
              >
                Email{' '}
                <Text
                  as="span"
                  variant="small"
                  className="text-red-500"
                >
                  *
                </Text>
              </Label>
              <Input
                id="institution-email"
                type="email"
                placeholder="contact@institution.de"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="text-base py-2 px-3 w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="institution-phone"
                className="font-normal text-gray-700"
              >
                Phone{' '}
                <Text
                  as="span"
                  variant="small"
                  className="text-red-500"
                >
                  *
                </Text>
              </Label>
              <Input
                id="institution-phone"
                type="tel"
                placeholder="+49 7121 200-0"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="text-base py-2 px-3 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-website"
              className="font-normal text-gray-700"
            >
              Website{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <Input
              id="institution-website"
              type="url"
              placeholder="https://www.institution.de"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-semibold text-gray-700">Legal Information</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-legal-name"
                  className="font-normal text-gray-600 text-sm"
                >
                  Legal Name *
                </Label>
                <Input
                  id="institution-legal-name"
                  placeholder="Kreiskliniken Reutlingen gGmbH"
                  value={formData.legalName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-legal-form"
                  className="font-normal text-gray-600 text-sm"
                >
                  Legal Form *
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
                    <SelectValue placeholder="Select legal form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select legal form</SelectItem>
                    {LEGAL_FORMS.map(({ value, label }) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-vat-id"
                  className="font-normal text-gray-600 text-sm"
                >
                  VAT ID (USt-ID) *
                </Label>
                <Input
                  id="institution-vat-id"
                  placeholder="DE123456789"
                  value={formData.vatId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatId: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-registration-number"
                  className="font-normal text-gray-600 text-sm"
                >
                  Handelsregister (HRB)
                </Label>
                <Input
                  id="institution-registration-number"
                  placeholder="HRB 12345"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Steuernummer
                </Label>
                <Input
                  id="institution-tax-id"
                  placeholder="12/345/67890"
                  value={formData.taxId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-semibold text-gray-700">Primary Contact</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-primary-contact-name"
                  className="font-normal text-gray-600 text-sm"
                >
                  Contact Name *
                </Label>
                <Input
                  id="institution-primary-contact-name"
                  placeholder="Astrid"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Role / Title
                </Label>
                <Input
                  id="institution-primary-contact-role"
                  placeholder="Pflegedirektion"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Contact Email *
                </Label>
                <Input
                  id="institution-primary-contact-email"
                  type="email"
                  placeholder="m.schmidt@example.de"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Contact Phone
                </Label>
                <Input
                  id="institution-primary-contact-phone"
                  type="tel"
                  placeholder="+49 7121 200-1234"
                  value={formData.primaryContactPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryContactPhone: e.target.value }))
                  }
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-blue-50">
            <Label className="font-semibold text-gray-700">Billing Information</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-billing-email"
                  className="font-normal text-gray-600 text-sm"
                >
                  Billing Email *
                </Label>
                <Input
                  id="institution-billing-email"
                  type="email"
                  placeholder="billing@institution.de"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Billing Contact Name
                </Label>
                <Input
                  id="institution-billing-contact-name"
                  placeholder="Buchhaltung"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Billing Contact Phone
                </Label>
                <Input
                  id="institution-billing-contact-phone"
                  type="tel"
                  placeholder="+49 7121 200-900"
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
                  className="font-normal text-gray-600 text-sm"
                >
                  Invoice Language
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
                    {INVOICE_LANGUAGES.map(({ value, label }) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-payment-terms"
                  className="font-normal text-gray-600 text-sm"
                >
                  Payment Terms (days)
                </Label>
                <Input
                  id="institution-payment-terms"
                  type="number"
                  min={1}
                  placeholder="30"
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

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-semibold text-gray-700">Address</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-street"
                  className="font-normal text-gray-600 text-sm"
                >
                  Street & Number *
                </Label>
                <Input
                  id="institution-street"
                  placeholder="Am Steinenberg 70"
                  value={formData.address.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="institution-address-line-2"
                  className="font-normal text-gray-600 text-sm"
                >
                  Additional Address (Building, Floor)
                </Label>
                <Input
                  id="institution-address-line-2"
                  placeholder="Gebaude A, 2. OG"
                  value={formData.address.addressLine2 || ''}
                  onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-postal-code"
                  className="font-normal text-gray-600 text-sm"
                >
                  Postal Code (PLZ) *
                </Label>
                <Input
                  id="institution-postal-code"
                  placeholder="72764"
                  maxLength={5}
                  value={formData.address.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-city"
                  className="font-normal text-gray-600 text-sm"
                >
                  City *
                </Label>
                <Input
                  id="institution-city"
                  placeholder="Reutlingen"
                  value={formData.address.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-state"
                  className="font-normal text-gray-600 text-sm"
                >
                  Bundesland (optional)
                </Label>
                <Input
                  id="institution-state"
                  placeholder="Baden-Wurttemberg"
                  value={formData.address.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-country"
                  className="font-normal text-gray-600 text-sm"
                >
                  Country *
                </Label>
                <Input
                  id="institution-country"
                  placeholder="Germany"
                  value={formData.address.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          {formData.type === 'hospital' && (
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
              <Label className="font-semibold text-gray-700">Hospital Details</Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="institution-number"
                    className="font-normal text-gray-600 text-sm"
                  >
                    IK-Nummer (Institutionskennzeichen)
                  </Label>
                  <Input
                    id="institution-number"
                    placeholder="123456789"
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
                    className="font-normal text-gray-600 text-sm"
                  >
                    Number of Beds
                  </Label>
                  <Input
                    id="institution-number-of-beds"
                    type="number"
                    min={0}
                    placeholder="500"
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
                    className="font-normal text-gray-600 text-sm"
                  >
                    Departments (comma-separated)
                  </Label>
                  <Input
                    id="institution-departments"
                    placeholder="Intensivpflege, Wundmanagement, Notaufnahme"
                    value={formData.departments.join(', ')}
                    onChange={(e) => handleDepartmentsChange(e.target.value)}
                    className="text-base py-2 px-3 w-full"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor="institution-accreditation"
                    className="font-normal text-gray-600 text-sm"
                  >
                    Accreditation
                  </Label>
                  <Input
                    id="institution-accreditation"
                    placeholder="ISO 9001"
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

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-normal text-gray-700">
              Social Links{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-linkedin"
                  className="font-normal text-gray-600 text-sm"
                >
                  LinkedIn *
                </Label>
                <Input
                  id="institution-linkedin"
                  type="url"
                  placeholder="https://www.linkedin.com/company/institution"
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-instagram"
                  className="font-normal text-gray-600 text-sm"
                >
                  Instagram *
                </Label>
                <Input
                  id="institution-instagram"
                  type="url"
                  placeholder="https://www.instagram.com/institution"
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-image-url"
              className="font-normal text-gray-700"
            >
              Image URL
            </Label>
            <Input
              id="institution-image-url"
              type="url"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
            <Text
              as="p"
              variant="body"
              className="text-xs text-gray-400 mt-1"
            >
              Enter a direct URL to the institution image.
            </Text>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={!isFormValid}
          >
            Create Institution
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
