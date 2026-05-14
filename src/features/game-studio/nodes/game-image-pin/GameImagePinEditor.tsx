import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { RotateCcw, X } from 'lucide-react'

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
  const replaceImageInputRef = useRef<HTMLInputElement>(null)

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

  const handleReplaceImageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files
      if (list?.length) void handleFileSelected(Array.from(list))
      event.target.value = ''
    },
    [handleFileSelected],
  )

  return (
    <div className="flex flex-col gap-8">
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
            <div className="relative mx-auto w-fit max-w-full">
              <input
                ref={replaceImageInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={handleReplaceImageInputChange}
              />
              <img
                src={imagePreview}
                alt="Image pin Hintergrund"
                className="max-h-80 w-auto max-w-full object-contain rounded-lg border"
              />
              <div className="absolute top-3 right-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => replaceImageInputRef.current?.click()}
                  className="rounded-full active:animate-in active:zoom-in-95"
                  aria-label="Bild ersetzen"
                >
                  <RotateCcw />
                </Button>
                <Button
                  type="button"
                  variant="delete"
                  size="icon"
                  onClick={handleClearImage}
                  className="rounded-full active:animate-in active:zoom-in-95"
                  aria-label="Bild entfernen"
                >
                  <X />
                </Button>
              </div>
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
