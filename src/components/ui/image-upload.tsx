import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

interface ImageUploadProps {
  value?: string // Can be URL or data URL
  onChange?: (value: string) => void
  onFileChange?: (file: File | null) => void
  label?: string
  className?: string
  accept?: string
  maxSizeMB?: number
}

export default function ImageUpload({
  value,
  onChange,
  onFileChange,
  label = 'Image',
  className,
  accept = 'image/*',
  maxSizeMB = 20,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [urlInput, setUrlInput] = useState<string>(value && !value.startsWith('data:') ? value : '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setUploadedFile(file)
    setUrlInput('') // Clear URL input when file is uploaded

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setPreviewUrl(dataUrl)
      if (onChange) {
        onChange(dataUrl)
      }
      if (onFileChange) {
        onFileChange(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    if (url.trim()) {
      setPreviewUrl(url)
      setUploadedFile(null) // Clear uploaded file when URL is entered
      if (onChange) {
        onChange(url)
      }
      if (onFileChange) {
        onFileChange(null)
      }
    } else {
      setPreviewUrl(null)
      if (onChange) {
        onChange('')
      }
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onChange) {
      onChange('')
    }
    if (onFileChange) {
      onFileChange(null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label className="font-normal text-gray-700">{label}</Label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Drag and Drop Area */}
      {!previewUrl && (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center',
            'min-h-[150px] rounded-lg border-2 border-dashed',
            'transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept={accept}
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <Text as="p" variant="body" className="text-sm text-gray-600 font-medium">Drag & drop an image here</Text>
              <Text as="p" variant="body" className="text-xs text-gray-400">or click to browse</Text>
              <Text as="p" variant="body" className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP. Max {maxSizeMB}MB</Text>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200"></div>
          <Text as="span" variant="small" className="text-xs text-gray-400 px-2">OR</Text>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="flex-1"
          />
          {urlInput && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (urlInput.trim()) {
                  handleUrlChange(urlInput)
                }
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Change Image Button (when preview exists) */}
      {previewUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Change Image
        </Button>
      )}
    </div>
  )
}