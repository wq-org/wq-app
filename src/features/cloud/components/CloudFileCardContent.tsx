import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Text } from '@/components/ui/text'
import { deleteFile } from '../api/filesApi'
import type { FileItem } from '../types/files.types'

export type CloudFileCardContentProps = {
  file: FileItem
  onDeleted: () => void
}

function formatUploadedDate(value: string | null | undefined): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CloudFileCardContent({ file, onDeleted }: CloudFileCardContentProps) {
  const { t } = useTranslation('features.cloud')
  const [isDeleting, setIsDeleting] = useState(false)

  const uploadedLabel = formatUploadedDate(file.createdAt)
  const typeLabel =
    file.type === 'PDF'
      ? t('card.subtitle.pdf')
      : file.type === 'Video'
        ? t('card.subtitle.video')
        : t('card.subtitle.image')

  const handleDelete = async () => {
    if (!file.storagePath) {
      toast.error(t('delete.errorToast'))
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteFile(file.storagePath)
      if (!result.success) {
        toast.error(result.error ?? t('delete.blockedFallback'))
        return
      }

      toast.success(t('delete.successToast'))
      onDeleted()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">{t('card.metadata.type')}</dt>
        <dd className="font-medium text-foreground">{typeLabel}</dd>

        <dt className="text-muted-foreground">{t('card.metadata.size')}</dt>
        <dd className="font-medium text-foreground">{file.size}</dd>

        {uploadedLabel ? (
          <>
            <dt className="text-muted-foreground">{t('card.metadata.uploaded')}</dt>
            <dd className="font-medium text-foreground">{uploadedLabel}</dd>
          </>
        ) : null}
      </dl>

      {file.mimeType ? (
        <Text
          variant="small"
          muted
        >
          {file.mimeType}
        </Text>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <HoldToDeleteButton
          type="button"
          loading={isDeleting}
          disabled={isDeleting}
          onDelete={handleDelete}
        >
          {t('delete.holdToDelete')}
        </HoldToDeleteButton>
      </div>
    </div>
  )
}
