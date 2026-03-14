import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_ALLOWED_TYPES } from '../types/upload.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  accept?: string // Optional: restrict file types (e.g., 'image/*' or specific MIME types)
}

export function FileDropzone({ onFilesSelected, disabled = false, accept }: FileDropzoneProps) {
  const { t } = useTranslation('features.commandPalette')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    onFilesSelected(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files))
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 transition-colors animate-in fade-in-0 slide-in-from-bottom-2',
        disabled
          ? 'cursor-not-allowed border-border bg-muted/60 opacity-50'
          : isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/40 hover:bg-accent/70',
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
        onClick={(e) => e.stopPropagation()} // Prevent double triggers
        accept={accept || ALL_ALLOWED_TYPES.join(',')}
        multiple
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <Button
          variant="outline"
          className="pointer-events-none flex items-center gap-2 border-border bg-card text-foreground animate-in fade-in-0 zoom-in-95"
          disabled={disabled}
        >
          <Upload className="w-5 h-5" />
          {t('upload.dropzone.uploadButton')}
        </Button>
        <div className="text-center space-y-1">
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('upload.dropzone.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-xs text-muted-foreground"
          >
            {t('upload.dropzone.description')}
          </Text>
        </div>
      </div>
    </div>
  )
}
