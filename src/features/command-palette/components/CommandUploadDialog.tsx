import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/shared'
import { FileDropzone, FileStepperForm } from '@/components/shared/upload-files'

import { useFileValidation } from '@/components/shared/upload-files/hooks/useFileValidation'
import { uploadFilesWithMetadata } from '@/components/shared/upload-files/api/uploadFilesApi'
import { useUser } from '@/contexts/user'
import type { UploadedFile } from '@/components/shared/upload-files/types/upload.types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface CommandUploadDialogProps {
  onSuccess?: () => void
}

export function CommandUploadDialog({ onSuccess }: CommandUploadDialogProps = {}) {
  const { t } = useTranslation('features.commandPalette')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showStepper, setShowStepper] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { validateFiles } = useFileValidation()
  const { getUserId, getRole, getUserInstitutionId } = useUser()

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
      // Prevent double calls by checking if we're already processing
      if (showStepper || isUploading) {
        return
      }

      // Validate files
      const validationResults = await validateFiles(files)

      // Filter out invalid files and show errors
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

      // Create uploaded file objects with previews
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
      setShowStepper(true)
    },
    [t, validateFiles, showStepper, isUploading],
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

    setIsUploading(true)
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
      const failedCount = results.filter((r) => !r.success).length

      if (successCount > 0) {
        toast.success(t('upload.toasts.successSummary', { successCount, failedCount }))
      }

      if (failedCount > 0) {
        const failedFiles = results
          .map((r, i) => (r.success ? null : uploadedFiles[i].file.name))
          .filter(Boolean)
        toast.error(t('upload.toasts.failedSummary', { failedCount }), {
          description: String(failedFiles.join(', ')),
        })
      }

      // Reset state only if all uploads succeeded
      if (failedCount === 0) {
        setUploadedFiles([])
        setShowStepper(false)
        // Call onSuccess callback to reload files
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Unexpected error during upload:', error)
      toast.error(t('upload.toasts.unexpectedError'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [t, uploadedFiles, getUserId, getRole, getUserInstitutionId, onSuccess])

  const handleBack = useCallback(() => {
    setShowStepper(false)
  }, [])

  return (
    <Container className="px-0">
      <Card className="w-full shadow-none border-0 px-0 py-0">
        <CardContent className="p-0 space-y-6">
          {!showStepper ? (
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              disabled={false}
            />
          ) : (
            <>
              {isUploading && (
                <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-2xl border">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <div className="text-center">
                    <Text
                      as="p"
                      variant="body"
                      className="text-sm font-medium text-gray-900"
                    >
                      {t('upload.progress.uploading')}
                    </Text>
                    <Text
                      as="p"
                      variant="body"
                      className="text-xs text-gray-500 mt-1"
                    >
                      {t('upload.progress.complete', { percent: uploadProgress.toFixed(0) })}
                    </Text>
                  </div>
                </div>
              )}
              {!isUploading && (
                <FileStepperForm
                  files={uploadedFiles}
                  onFileUpdate={handleFileUpdate}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
