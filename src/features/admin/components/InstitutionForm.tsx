import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ui/image-upload'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type InstitutionType = 'school' | 'university' | 'college' | 'organization' | 'other'
export type InstitutionStatus = 'active' | 'inactive' | 'suspended' | 'pending'

interface AddressJsonb {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

interface SocialLinks {
  linkedin?: string
  instagram?: string
}

export interface InstitutionFormData {
  name: string
  slug: string
  type: InstitutionType | ''
  status: InstitutionStatus
  description: string
  email: string
  website: string
  address: AddressJsonb
  socialLinks: SocialLinks
  imageUrl: string
  imageFile?: File | null
}

const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'organization', label: 'Organization' },
  { value: 'other', label: 'Other' },
]

const INSTITUTION_STATUSES: { value: InstitutionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
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
  address: {},
  socialLinks: { linkedin: '', instagram: '' },
  imageUrl: '',
  imageFile: null,
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function InstitutionForm({ onSubmit, onCancel }: InstitutionFormProps) {
  const [formData, setFormData] = useState<InstitutionFormData>(initialFormData)

  const handleNameChange = useCallback(
    (name: string) => {
      setFormData((prev) => ({
        ...prev,
        name,
        slug: prev.slug || slugify(name),
      }))
    },
    [],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
    setFormData(initialFormData)
  }

  const handleCancel = () => {
    setFormData(initialFormData)
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

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }))
  }

  const handleImageFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, imageFile: file }))
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <Card className="border shadow-sm">
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Basic Information
          </CardTitle>
          <Text as="p" variant="body" className="text-sm text-gray-500 mt-2 font-normal">
            Add the basic details for your institution.
          </Text>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-name" className="font-normal text-gray-700">
              Institution Name{' '}
              <Text as="span" variant="small" className="text-red-500">
                *
              </Text>
            </Label>
            <Input
              id="institution-name"
              placeholder="e.g., Harvard University"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-slug" className="font-normal text-gray-700">
              Slug
            </Label>
            <Input
              id="institution-slug"
              placeholder="harvard-university"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
            <Text as="p" variant="body" className="text-xs text-gray-400">
              URL-friendly identifier. Auto-generated from name if left empty.
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-type" className="font-normal text-gray-700">
              Type
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
              <SelectTrigger id="institution-type" className="w-full justify-between">
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select institution type</SelectItem>
                {INSTITUTION_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-status" className="font-normal text-gray-700">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, status: v as InstitutionStatus }))
              }
            >
              <SelectTrigger id="institution-status" className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_STATUSES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-description" className="font-normal text-gray-700">
              Description
            </Label>
            <Textarea
              id="institution-description"
              placeholder="Enter a brief description of the institution..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="resize-none w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-email" className="font-normal text-gray-700">
              Email
            </Label>
            <Input
              id="institution-email"
              type="email"
              placeholder="contact@institution.edu"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution-website" className="font-normal text-gray-700">
              Website
            </Label>
            <Input
              id="institution-website"
              type="url"
              placeholder="https://www.institution.edu"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-normal text-gray-700">Address</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="institution-street" className="font-normal text-gray-600 text-sm">
                  Street
                </Label>
                <Input
                  id="institution-street"
                  placeholder="123 Main St"
                  value={formData.address.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="institution-city" className="font-normal text-gray-600 text-sm">
                  City
                </Label>
                <Input
                  id="institution-city"
                  placeholder="City"
                  value={formData.address.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="institution-state" className="font-normal text-gray-600 text-sm">
                  State / Province
                </Label>
                <Input
                  id="institution-state"
                  placeholder="State"
                  value={formData.address.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="institution-postalCode" className="font-normal text-gray-600 text-sm">
                  Postal Code
                </Label>
                <Input
                  id="institution-postalCode"
                  placeholder="Postal Code"
                  value={formData.address.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="institution-country" className="font-normal text-gray-600 text-sm">
                  Country
                </Label>
                <Input
                  id="institution-country"
                  placeholder="Country"
                  value={formData.address.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="text-base py-2 px-3 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-normal text-gray-700">Social Links</Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="institution-linkedin"
                  className="font-normal text-gray-600 text-sm"
                >
                  LinkedIn
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
                  Instagram
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
            <ImageUpload
              label="Institution Image"
              value={formData.imageUrl}
              onChange={handleImageChange}
              onFileChange={handleImageFileChange}
              accept="image/*"
              maxSizeMB={20}
            />
            <Text
              as="p"
              variant="body"
              className="text-xs text-gray-400 mt-1"
            >
              Optional: Upload an image or enter an image URL
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
