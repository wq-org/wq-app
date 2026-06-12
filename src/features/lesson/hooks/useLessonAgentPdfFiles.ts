import { useMemo } from 'react'

import type { PdfCardFile } from '@/components/shared/pdf-viewer'
import { useTeacherCloudFiles } from '@/features/cloud'

export function useLessonAgentPdfFiles() {
  const { fileItems, loading } = useTeacherCloudFiles()

  const pdfFiles = useMemo<PdfCardFile[]>(
    () =>
      fileItems
        .filter((file) => file.type === 'PDF' && file.url)
        .map((file) => ({
          id: file.cloudFileId ?? file.storagePath ?? String(file.id),
          fileName: file.filename,
          pdfUrl: file.url!,
        })),
    [fileItems],
  )

  return { pdfFiles, loading }
}
