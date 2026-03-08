import { useEffect, useState } from 'react'
import { FileText, MoreVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

interface UploadedFileItemProps {
  file: File
  onRemove?: () => void
}

export function UploadedFileItem({ file, onRemove }: UploadedFileItemProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const isImage = file.type.startsWith('image/')

  useEffect(() => {
    if (!isImage) {
      setPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    return () => {
      reader.onloadend = null
    }
  }, [file, isImage])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Get file extension and color config
  const getFileConfig = () => {
    const extension = file.name.split('.').pop()?.toUpperCase() || ''

    // For documents
    if (['DOC', 'DOCX', 'TXT'].includes(extension)) {
      return {
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      }
    }
    // For PDFs
    if (extension === 'PDF') {
      return {
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      }
    }
    // For spreadsheets
    if (['XLS', 'XLSX', 'CSV'].includes(extension)) {
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
      }
    }
    // For presentations
    if (['PPT', 'PPTX'].includes(extension)) {
      return {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
      }
    }
    // Default for other files
    return {
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
    }
  }

  const config = getFileConfig()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
      {/* Icon or Image Preview */}
      <div className="shrink-0">
        {isImage && preview ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.bgColor} ${config.borderColor} border`}
          >
            <FileText className={`w-6 h-6 ${config.color}`} />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <Text
          as="p"
          variant="body"
          className="text-sm font-medium text-gray-900 truncate"
        >
          {file.name}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-xs text-gray-500"
        >
          {formatFileSize(file.size)}
        </Text>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="h-8 w-8 text-gray-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
