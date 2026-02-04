import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_ALLOWED_TYPES } from '../types/upload.types'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  accept?: string // Optional: restrict file types (e.g., 'image/*' or specific MIME types)
}

export default function FileDropzone({
  onFilesSelected,
  disabled = false,
  accept,
}: FileDropzoneProps) {
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
      className={`
                relative flex flex-col items-center justify-center
                min-h-[200px] rounded-2xl border-2 border-dashed
                transition-colors cursor-pointer py-8
                ${
                  disabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }
            `}
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
          className="flex items-center gap-2 bg-white pointer-events-none"
          disabled={disabled}
        >
          <Upload className="w-5 h-5" />
          Upload Files
        </Button>
        <div className="text-center space-y-1">
          <p className="text-gray-600 text-sm">Choose files or drag & drop them here.</p>
          <p className="text-gray-400 text-xs">
            Images (except WebP), PDF, MP4 videos (max 60s), Word (docx), PowerPoint (pptx/ppt). Max
            20 MB per file.
          </p>
        </div>
      </div>
    </div>
  )
}
