import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from '@/components/ui/stepper'
import { Check, X } from 'lucide-react'
import type { UploadedFile } from '../types/upload.types'
import { useTranslation } from 'react-i18next'

interface FileStepperFormProps {
  files: UploadedFile[]
  onFileUpdate: (id: string, updates: { title: string }) => void
  onComplete: () => void
  onBack?: () => void
}

export default function FileStepperForm({
  files,
  onFileUpdate,
  onComplete,
  onBack,
}: FileStepperFormProps) {
  const { t } = useTranslation('features.commandPalette')
  const [currentStep, setCurrentStep] = useState(1)
  const isEditingRef = useRef<string | null>(null)

  const currentFile = files[currentStep - 1]

  // Use files prop as source of truth, but maintain local formData for immediate UI updates
  const [formData, setFormData] = useState<Record<string, { title: string }>>(() => {
    const initialData: Record<string, { title: string }> = {}
    files.forEach((file) => {
      initialData[file.id] = {
        title: file.title || file.file.name.split('.')[0],
      }
    })
    return initialData
  })

  // Sync formData with files prop, but preserve user edits for the currently editing file
  useEffect(() => {
    setFormData((prev) => {
      const updated = { ...prev }
      let hasChanges = false
      const currentFileId = files[currentStep - 1]?.id

      files.forEach((file) => {
        const fileTitle = file.title || file.file.name.split('.')[0]

        // If this file doesn't exist in formData, add it
        if (!updated[file.id]) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        }
        // If this is NOT the current file being edited, sync with files prop
        else if (file.id !== currentFileId && updated[file.id].title !== fileTitle) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        }
        // If this IS the current file, only sync if we're not currently editing it
        else if (
          file.id === currentFileId &&
          file.id !== isEditingRef.current &&
          updated[file.id].title !== fileTitle
        ) {
          updated[file.id] = { title: fileTitle }
          hasChanges = true
        }
      })

      // Remove entries for files that no longer exist
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

  // Reset editing ref when step changes
  useEffect(() => {
    isEditingRef.current = null
  }, [currentStep])

  // Get current form data - prefer formData, fallback to file prop
  const currentFormData = currentFile
    ? formData[currentFile.id] || {
        title: currentFile.title || currentFile.file.name.split('.')[0],
      }
    : { title: '' }

  const handleFilenameChange = (value: string) => {
    if (currentFile) {
      // Mark that we're editing this file
      isEditingRef.current = currentFile.id

      // Update local formData immediately for responsive UI
      const updated = { title: value }
      setFormData((prev) => ({ ...prev, [currentFile.id]: updated }))
      // Sync with parent component
      onFileUpdate(currentFile.id, updated)
    }
  }

  const handleInputBlur = () => {
    // Clear editing flag when user finishes editing
    isEditingRef.current = null
  }

  const handleNext = () => {
    if (currentStep < files.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else if (onBack) {
      onBack()
    }
  }

  const isStepCompleted = (step: number) => {
    const file = files[step - 1]
    if (!file) return false
    const data = formData[file.id]
    return data?.title.trim().length > 0
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="w-120">
      {/* Stepper Navigation */}
      <ScrollArea
        className="h-24 w-full max-w-full pb-2"
        scrollbars="horizontal"
      >
        <div className="inline-flex min-w-max pr-2">
          <Stepper
            value={currentStep}
            onValueChange={setCurrentStep}
            orientation="horizontal"
          >
            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center"
              >
                <StepperItem step={index + 1}>
                  <StepperTrigger>
                    <StepperIndicator>
                      {isStepCompleted(index + 1) ? <Check className="h-5 w-5" /> : index + 1}
                    </StepperIndicator>
                    <StepperTitle className="text-xs max-w-[80px] truncate">
                      {(() => {
                        // Use original filename for stepper title, not the form input
                        const displayTitle = file.file.name.split('.')[0]
                        return displayTitle.length > 10
                          ? `${displayTitle.substring(0, 10)}...`
                          : displayTitle
                      })()}
                    </StepperTitle>
                  </StepperTrigger>
                </StepperItem>
                {index < files.length - 1 && <StepperSeparator />}
              </div>
            ))}
          </Stepper>
        </div>
      </ScrollArea>

      {/* Current File Form */}
      {currentFile && (
        <div className="space-y-6 p-6 bg-white rounded-2xl border">
          <div className="flex items-center gap-4">
            {currentFile.preview ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={currentFile.preview}
                  alt={currentFile.file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Text
                  as="span"
                  variant="small"
                  className="text-xs text-gray-500"
                >
                  {currentFile.file.name.split('.').pop()?.toUpperCase()}
                </Text>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Text
                as="p"
                variant="body"
                className="text-sm font-medium text-gray-900 truncate"
              >
                {currentFile.file.name}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-xs text-gray-500"
              >
                {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">{t('upload.stepper.filenameLabel')}</Label>
              <div className="relative">
                <Input
                  id="filename"
                  value={currentFormData.title}
                  onChange={(e) => handleFilenameChange(e.target.value)}
                  onBlur={handleInputBlur}
                  placeholder={t('upload.stepper.filenamePlaceholder')}
                  className="w-full pr-10"
                />
                {currentFormData.title && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFilenameChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors h-8 w-8"
                    aria-label={t('upload.stepper.clearInputAria')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 && !onBack}
            >
              {currentStep === 1 ? t('upload.stepper.back') : t('upload.stepper.previous')}
            </Button>
            <Button
              onClick={handleNext}
              variant="darkblue"
              disabled={!currentFormData.title.trim()}
            >
              {currentStep === files.length ? t('upload.stepper.done') : t('upload.stepper.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
