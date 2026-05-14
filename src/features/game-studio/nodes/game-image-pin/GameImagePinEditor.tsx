import { useCallback, useState } from 'react'
import { X } from 'lucide-react'

import { FileDropzone } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { HelpPopover } from '@/features/institution-admin/components'

import type { GameImagePinNodeData } from './game-image-pin.schema'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      resolve(typeof result === 'string' ? result : '')
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export type GameImagePinEditorProps = {
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: Record<string, unknown>) => void
}

export function GameImagePinEditor({ nodeData, onPatchNodeData }: GameImagePinEditorProps) {
  const pin = nodeData as GameImagePinNodeData
  const imagePreview =
    typeof pin.imagePreview === 'string' && pin.imagePreview.trim() !== '' ? pin.imagePreview : ''

  const [questionDescription, setQuestionDescription] = useState('')

  const handleFileSelected = useCallback(
    async (files: File[]) => {
      const file = files.find((f) => f.type.startsWith('image/'))
      if (!file) return
      try {
        const dataUrl = await readFileAsDataUrl(file)
        if (!dataUrl) return
        onPatchNodeData({ imagePreview: dataUrl, filepath: '' })
      } catch {
        // Ignore read errors; user can retry
      }
    },
    [onPatchNodeData],
  )

  const handleClearImage = useCallback(() => {
    onPatchNodeData({ imagePreview: '', filepath: '' })
  }, [onPatchNodeData])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2">
        <Text
          as="p"
          variant="body"
          className="text-sm"
        >
          Lade ein Bild hoch und markiere die relevanten Bereiche mit Rechtecken. Formuliere für
          jedes Rechteck eine Frage und hinterlege die passende Punktebewertung. Speichere,
          versioniere und veröffentliche das Spiel
        </Text>

        <HelpPopover
          showButtonText
          title="Test"
          sectionDefinitionLabel=".... "
          sectionExampleLabel=".... "
          sectionExampleValuesLabel=".... "
          sectionReasonLabel=".... "
          definition=".... "
          exampleTitle=".... "
          exampleValues={['hallo', 'world']}
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        <div>
          {!imagePreview ? (
            <FileDropzone
              accept="image/*"
              onFilesSelected={handleFileSelected}
              disabled={false}
            />
          ) : null}
          {imagePreview ? (
            <div className="relative mx-auto max-w-[600px] space-y-2">
              <img
                src={imagePreview}
                alt="Image pin Hintergrund"
                className="max-h-80 w-full object-contain"
              />
              <Button
                type="button"
                variant="delete"
                size="icon"
                onClick={handleClearImage}
                className="absolute top-3 right-2 rounded-full active:animate-in active:zoom-in-95"
                aria-label="Bild entfernen"
              >
                <X />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <FieldTextarea
            placeholder="where is the center of the image pin it ?"
            value={questionDescription}
            onValueChange={setQuestionDescription}
            label="1. Question to be ask"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}
