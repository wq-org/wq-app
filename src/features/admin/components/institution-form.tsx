import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ui/image-upload'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Text } from '@/components/ui/text'

interface SocialLinks {
  linkedin?: string
  instagram?: string
}

interface InstitutionFormData {
  name: string
  description: string
  address: string
  email: string
  website: string
  socialLinks: SocialLinks
  imageUrl: string
  imageFile?: File | null
}

interface InstitutionFormProps {
  onSubmit?: (data: InstitutionFormData) => void
  onCancel?: () => void
}

export default function InstitutionForm({ onSubmit, onCancel }: InstitutionFormProps) {
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    description: '',
    address: '',
    email: '',
    website: '',
    socialLinks: {
      linkedin: '',
      instagram: '',
    },
    imageUrl: '',
    imageFile: null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      name: '',
      description: '',
      address: '',
      email: '',
      website: '',
      socialLinks: {
        linkedin: '',
        instagram: '',
      },
      imageUrl: '',
      imageFile: null,
    })
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      email: '',
      website: '',
      socialLinks: {
        linkedin: '',
        instagram: '',
      },
      imageUrl: '',
      imageFile: null,
    })
    if (onCancel) {
      onCancel()
    }
  }

  const handleSocialLinkChange = (platform: 'linkedin' | 'instagram', value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    })
  }

  const handleImageChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url })
  }

  const handleImageFileChange = (file: File | null) => {
    setFormData({ ...formData, imageFile: file })
  }

  const isFormValid = formData.name.trim() && formData.description.trim() && formData.address.trim()

  return (
    <Card className="max-w-2xl mx-auto border shadow-sm">
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900">Create Institution</CardTitle>
          <Text
            as="p"
            variant="body"
            className="text-sm text-gray-500 mt-2 font-normal"
          >
            Add a new institution to the system.
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
              placeholder="e.g., Harvard University"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-base py-2 px-3 w-full"
            />
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="resize-none w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-address"
              className="font-normal text-gray-700"
            >
              Address{' '}
              <Text
                as="span"
                variant="small"
                className="text-red-500"
              >
                *
              </Text>
            </Label>
            <Input
              id="institution-address"
              placeholder="Enter the institution's address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-email"
              className="font-normal text-gray-700"
            >
              Email
            </Label>
            <Input
              id="institution-email"
              type="email"
              placeholder="contact@institution.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="institution-website"
              className="font-normal text-gray-700"
            >
              Website
            </Label>
            <Input
              id="institution-website"
              type="url"
              placeholder="https://www.institution.edu"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="text-base py-2 px-3 w-full"
            />
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
