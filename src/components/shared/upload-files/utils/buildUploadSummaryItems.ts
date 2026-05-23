import type { FileUploadResult, UploadedFile } from '../types/upload.types'
import type { UploadSummaryItem } from '../types/upload-summary.types'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function buildUploadSummaryItems(
  files: readonly UploadedFile[],
  results: readonly FileUploadResult[],
): UploadSummaryItem[] {
  return results.map((result, index) => {
    const uploaded = files[index]
    const fileName = uploaded?.file.name ?? result.fileName ?? 'file'
    const id = uploaded?.id ?? `${index}-${fileName}`

    if (result.success) {
      const size = uploaded?.file.size
      return {
        id,
        fileName,
        status: 'success',
        subtitle: size != null ? formatFileSize(size) : undefined,
      }
    }

    return {
      id,
      fileName,
      status: 'failed',
      subtitle: result.error ?? 'Upload failed',
    }
  })
}
