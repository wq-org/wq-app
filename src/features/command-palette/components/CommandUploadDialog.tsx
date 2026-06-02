import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import {
  FileDropzone,
  FileStepperForm,
  UploadSummary,
  buildUploadSummaryItems,
  uploadFilesWithMetadata,
  useFileValidation,
} from '@/components/shared/upload-files'
import type { UploadedFile } from '@/components/shared/upload-files'
import type { UploadSummaryItem } from '@/components/shared/upload-files'
import { requestCloudGalleryRefetch, resolveCloudFileId } from '@/features/cloud'
import { useUser } from '@/contexts/user'

type UploadPhase = 'dropzone' | 'stepper' | 'uploading' | 'summary'

export type CommandUploadDialogProps = {
  onSuccess?: () => void
  /** When the overlay closes, reset local upload state. */
  isActive?: boolean
}

export function CommandUploadDialog({ onSuccess, isActive = true }: CommandUploadDialogProps = {}) {
  const { t } = useTranslation('features.commandPalette')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [phase, setPhase] = useState<UploadPhase>('dropzone')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [summaryItems, setSummaryItems] = useState<UploadSummaryItem[]>([])
  const { validateFiles } = useFileValidation()
  const { getUserId, getRole, getUserInstitutionId } = useUser()

  const resetFlow = useCallback(() => {
    setUploadedFiles([])
    setPhase('dropzone')
    setUploadProgress(0)
    setSummaryItems([])
  }, [])

  useEffect(() => {
    if (!isActive) {
      resetFlow()
    }
  }, [isActive, resetFlow])

  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = () => resolve(undefined)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (phase === 'stepper' || phase === 'uploading' || phase === 'summary') {
        return
      }

      const validationResults = await validateFiles(files)

      const validFiles: File[] = []
      validationResults.forEach((result, index) => {
        if (result.isValid) {
          validFiles.push(files[index])
        } else {
          toast.error(t('upload.toasts.fileValidationError', { fileName: files[index].name }), {
            description: result.error,
          })
        }
      })

      if (validFiles.length === 0) {
        return
      }

      const newUploadedFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const preview = await createPreview(file)
          return {
            id: generateFileId(),
            file,
            title: file.name.split('.')[0],
            preview,
          }
        }),
      )

      setUploadedFiles(newUploadedFiles)
      setPhase('stepper')
    },
    [phase, t, validateFiles],
  )

  const handleFileUpdate = useCallback((id: string, updates: { title: string }) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    )
  }, [])

  const handleComplete = useCallback(async () => {
    const userId = getUserId()
    const role = getRole()
    const institutionId = getUserInstitutionId()

    if (!userId) {
      toast.error(t('upload.toasts.userIdMissing'))
      return
    }
    if (!institutionId) {
      toast.error(t('upload.toasts.institutionIdIdMissing'))
      return
    }

    if (!role) {
      toast.error(t('upload.toasts.userRoleMissing'))
      return
    }

    if (uploadedFiles.length === 0) {
      toast.error(t('upload.toasts.noFiles'))
      return
    }

    setPhase('uploading')
    setUploadProgress(0)

    try {
      const results = await uploadFilesWithMetadata(
        uploadedFiles,
        institutionId,
        userId,
        role,
        (progress) => {
          setUploadProgress(progress)
        },
      )

      const successCount = results.filter((r) => r.success).length

      if (successCount > 0) {
        await Promise.all(
          results.map(async (result, index) => {
            if (!result.success || !result.path) return

            const file = uploadedFiles[index]?.file
            if (!file) return

            await resolveCloudFileId({
              storageObjectName: result.path,
              institutionId,
              userId,
              mimeType: file.type,
              sizeBytes: file.size,
              originalName: file.name,
            })
          }),
        )

        requestCloudGalleryRefetch()
        onSuccess?.()
      }

      setSummaryItems(buildUploadSummaryItems(uploadedFiles, results))
      setPhase('summary')
    } catch (error) {
      console.error('Unexpected error during upload:', error)
      toast.error(t('upload.toasts.unexpectedError'))
      setPhase('stepper')
    } finally {
      setUploadProgress(0)
    }
  }, [t, uploadedFiles, getUserId, getRole, getUserInstitutionId, onSuccess])

  const handleBack = useCallback(() => {
    setPhase('dropzone')
    setUploadedFiles([])
  }, [])

  const handleSummaryDone = useCallback(() => {
    resetFlow()
  }, [resetFlow])

  return (
    <div className="min-w-0 max-w-full overflow-hidden px-0">
      <Card className="w-full min-w-0 max-w-full border-0 bg-transparent px-0 py-0 shadow-none">
        <CardContent className="min-w-0 space-y-6 p-0">
          {phase === 'dropzone' ? (
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              disabled={false}
            />
          ) : null}

          {phase === 'uploading' ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur-md supports-backdrop-filter:bg-card/60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <Text
                  as="p"
                  variant="body"
                  className="text-sm font-medium text-foreground"
                >
                  {t('upload.progress.uploading')}
                </Text>
                <Text
                  as="p"
                  variant="body"
                  muted
                  className="mt-1 text-xs"
                >
                  {t('upload.progress.complete', { percent: uploadProgress.toFixed(0) })}
                </Text>
              </div>
            </div>
          ) : null}

          {phase === 'stepper' ? (
            <FileStepperForm
              files={uploadedFiles}
              onFileUpdate={handleFileUpdate}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          ) : null}

          {phase === 'summary' ? (
            <UploadSummary
              items={summaryItems}
              onDone={handleSummaryDone}
              doneLabel={t('upload.summary.done')}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
