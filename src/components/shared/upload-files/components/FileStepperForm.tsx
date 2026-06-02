import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StepperSegmentedProgressBar } from '@/components/shared/steppers'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import type { UploadedFile } from '../types/upload.types'

type FileStepperFormProps = {
  files: UploadedFile[]
  onFileUpdate: (id: string, updates: { title: string }) => void
  onComplete: () => void
  onBack?: () => void
}

export function FileStepperForm({ files, onFileUpdate, onComplete, onBack }: FileStepperFormProps) {
  const { t } = useTranslation('features.commandPalette')
  const [currentStep, setCurrentStep] = useState(1)
  const isEditingRef = useRef<string | null>(null)

  const stepNumbers = useMemo(() => files.map((_, index) => index + 1), [files])
  const currentFile = files[currentStep - 1]

  const [formData, setFormData] = useState<Record<string, { title: string }>>(() => {
    const initialData: Record<string, { title: string }> = {}
    files.forEach((file) => {
      initialData[file.id] = {
        title: file.title || file.file.name.split('.')[0],
      }
    })
    return initialData
  })

  useEffect(() => {
    setFormData((prev) => {
      const updated = { ...prev }
      let hasChanges = false
      const currentFileId = files[currentStep - 1]?.id

      files.forEach((file) => {
        const fileTitle = file.title || file.file.name.split('.')[0]

        if (!updated[file.id]) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        } else if (file.id !== currentFileId && updated[file.id].title !== fileTitle) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        } else if (
          file.id === currentFileId &&
          file.id !== isEditingRef.current &&
          updated[file.id].title !== fileTitle
        ) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        }
      })

      const fileIds = new Set(files.map((f) => f.id))
      Object.keys(updated).forEach((id) => {
        if (!fileIds.has(id)) {
          delete updated[id]
          hasChanges = true
        }
      })

      return hasChanges ? updated : prev
    })
  }, [files, currentStep])

  useEffect(() => {
    isEditingRef.current = null
  }, [currentStep])

  const currentFormData = currentFile
    ? (formData[currentFile.id] ?? {
        title: currentFile.title || currentFile.file.name.split('.')[0],
      })
    : { title: '' }

  const handleFilenameChange = (value: string) => {
    if (!currentFile) return

    isEditingRef.current = currentFile.id
    const updated = { title: value }
    setFormData((prev) => ({ ...prev, [currentFile.id]: updated }))
    onFileUpdate(currentFile.id, updated)
  }

  const handleNext = () => {
    if (currentStep < files.length) {
      setCurrentStep((step) => step + 1)
      return
    }
    onComplete()
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1)
      return
    }
    onBack?.()
  }

  if (files.length === 0) {
    return null
  }

  const isLastStep = currentStep === files.length
  const canProceed = currentFormData.title.trim().length > 0

  return (
    <div className="w-full max-w-md space-y-4">
      <StepperSegmentedProgressBar
        progressOnly
        showStepCounter
        steps={stepNumbers}
        value={currentStep}
        onValueChange={setCurrentStep}
        className="max-w-full"
      />

      {currentFile ? (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {currentFile.preview ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img
                  src={currentFile.preview}
                  alt={currentFile.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Text
                  as="span"
                  variant="small"
                  className="text-xs text-muted-foreground"
                >
                  {currentFile.file.name.split('.').pop()?.toUpperCase()}
                </Text>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Text
                as="p"
                variant="body"
                className="truncate text-sm font-medium text-foreground"
              >
                {currentFile.file.name}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-xs text-muted-foreground"
              >
                {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </div>
          </div>

          <FieldInput
            label={t('upload.stepper.filenameLabel')}
            value={currentFormData.title}
            onValueChange={handleFilenameChange}
            placeholder={t('upload.stepper.filenamePlaceholder')}
            required
            showClearButton
          />

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 && !onBack}
            >
              {currentStep === 1 ? t('upload.stepper.back') : t('upload.stepper.previous')}
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              variant="darkblue"
              disabled={!canProceed}
            >
              {isLastStep ? t('upload.stepper.done') : t('upload.stepper.next')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
