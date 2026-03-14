import { useEffect, useState } from 'react'
import { FileText, MoreVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { getFileTypeStyle } from '@/components/shared/upload-files/utils/fileTypeStyle'

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

  const config = getFileTypeStyle(file.name)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/40">
      {/* Icon or Image Preview */}
      <div className="shrink-0">
        {isImage && preview ? (
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
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
          className="truncate text-sm font-medium text-foreground"
        >
          {file.name}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-xs text-muted-foreground"
        >
          {formatFileSize(file.size)}
        </Text>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
