import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Plus, Repeat, Trash2, ImageMinus, X } from 'lucide-react'

import { FileDropzone } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { HelpPopover } from '@/features/institution-admin/components'

import { ImagePinRectStage } from './ImagePinRectStage'
import {
  createDefaultImagePinRectangle,
  loadImageNaturalSize,
  remapRectsForNewImageSize,
} from './imagePinRectGeometry'
import type { GameImagePinNodeData, GameImagePinRect } from './game-image-pin.schema'

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

  const rectangles: GameImagePinRect[] = useMemo(
    () => (Array.isArray(pin.rectangles) ? pin.rectangles : []),
    [pin.rectangles],
  )

  const replaceImageInputRef = useRef<HTMLInputElement>(null)

  const [selectedRectId, setSelectedRectId] = useState<string | null>(null)
  const [sceneMetrics, setSceneMetrics] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    setSelectedRectId(null)
    setSceneMetrics(null)
  }, [imagePreview])

  useEffect(() => {
    if (selectedRectId && !rectangles.some((r) => r.id === selectedRectId)) {
      setSelectedRectId(null)
    }
  }, [rectangles, selectedRectId])

  const handleRectanglesChange = useCallback(
    (next: GameImagePinRect[]) => {
      onPatchNodeData({ rectangles: next })
    },
    [onPatchNodeData],
  )

  const patchRectQuestion = useCallback(
    (id: string, question: string) => {
      onPatchNodeData({
        rectangles: rectangles.map((r) => (r.id === id ? { ...r, question } : r)),
      })
    },
    [onPatchNodeData, rectangles],
  )

  const handleDeleteRectRow = useCallback(
    (id: string) => {
      onPatchNodeData({ rectangles: rectangles.filter((r) => r.id !== id) })
      if (selectedRectId === id) setSelectedRectId(null)
    },
    [onPatchNodeData, rectangles, selectedRectId],
  )

  const handleAddRect = useCallback(() => {
    if (!sceneMetrics) return
    const next = createDefaultImagePinRectangle(sceneMetrics.width, sceneMetrics.height)
    onPatchNodeData({ rectangles: [...rectangles, next] })
    setSelectedRectId(next.id)
  }, [onPatchNodeData, rectangles, sceneMetrics])

  const handleDeleteSelectedRect = useCallback(() => {
    if (!selectedRectId) return
    onPatchNodeData({ rectangles: rectangles.filter((r) => r.id !== selectedRectId) })
    setSelectedRectId(null)
  }, [onPatchNodeData, rectangles, selectedRectId])

  const handleFileSelected = useCallback(
    async (files: File[]) => {
      const file = files.find((f) => f.type.startsWith('image/'))
      if (!file) return
      try {
        const dataUrl = await readFileAsDataUrl(file)
        if (!dataUrl) return
        const { width: newW, height: newH } = await loadImageNaturalSize(dataUrl)

        let oldW = sceneMetrics?.width ?? 0
        let oldH = sceneMetrics?.height ?? 0
        if ((oldW <= 0 || oldH <= 0) && imagePreview && rectangles.length > 0) {
          try {
            const cur = await loadImageNaturalSize(imagePreview)
            oldW = cur.width
            oldH = cur.height
          } catch {
            /* keep zeros */
          }
        }

        let nextRects = rectangles
        if (oldW > 0 && oldH > 0 && newW > 0 && newH > 0 && rectangles.length > 0) {
          nextRects = remapRectsForNewImageSize(rectangles, oldW, oldH, newW, newH)
        }

        onPatchNodeData({ imagePreview: dataUrl, filepath: '', rectangles: nextRects })
      } catch {
        // Ignore read errors; user can retry
      }
    },
    [imagePreview, onPatchNodeData, rectangles, sceneMetrics],
  )

  const handleClearImage = useCallback(() => {
    onPatchNodeData({ imagePreview: '', filepath: '', rectangles: [] })
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
        <div className="flex flex-col">
          <Text
            as="p"
            variant="body"
            className="text-sm"
          >
            Lade ein Bild hoch und markiere die relevanten Bereiche mit Rechtecken. Formuliere für
            jedes Rechteck eine Frage und hinterlege die passende Punktebewertung. Speichere,
            versioniere und veröffentliche das Spiel
          </Text>
          <Text
            as="span"
            variant="body"
            bold
            className="text-xs"
          >
            Auf dem Bild ziehen, um ein Rechteck zu zeichnen.
          </Text>
        </div>

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
            <div className="flex w-full max-w-full flex-col gap-3">
              <div className="flex justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="darkblue"
                    size="sm"
                    disabled={!sceneMetrics}
                    onClick={handleAddRect}
                  >
                    <Plus className="size-4" />
                    Rechteck
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedRectId}
                    onClick={handleDeleteSelectedRect}
                  >
                    <Trash2 className="size-4" />
                    Auswahl löschen
                  </Button>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={replaceImageInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={handleReplaceImageInputChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => replaceImageInputRef.current?.click()}
                    className="rounded-full"
                    aria-label="Bild ersetzen"
                  >
                    <Repeat />
                  </Button>
                  <Button
                    type="button"
                    variant="delete"
                    size="icon"
                    onClick={handleClearImage}
                    className="rounded-full"
                    aria-label="Bild entfernen"
                  >
                    <ImageMinus />
                  </Button>
                </div>
              </div>

              <ImagePinRectStage
                imageSrc={imagePreview}
                rectangles={rectangles}
                onRectanglesChange={handleRectanglesChange}
                selectedRectId={selectedRectId}
                onSelectedRectIdChange={setSelectedRectId}
                onSceneMetrics={setSceneMetrics}
              />

              {rectangles.length > 0 ? (
                <div className="flex flex-col gap-4 border-t border-border pt-4">
                  <Text
                    as="p"
                    variant="body"
                    className="text-sm font-medium text-foreground"
                  >
                    Fragen pro Bereich
                  </Text>
                  <div className="flex flex-col gap-4">
                    {rectangles.map((rect, index) => (
                      <div
                        key={rect.id}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        onFocusCapture={() => setSelectedRectId(rect.id)}
                      >
                        <FieldTextarea
                          className="min-w-0 flex-1"
                          label={`Frage ${index + 1}`}
                          placeholder="where is the center of the image pin it ?"
                          value={rect.question ?? ''}
                          onValueChange={(value) => patchRectQuestion(rect.id, value)}
                          rows={2}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full shrink-0 self-end sm:self-start"
                          onClick={() => handleDeleteRectRow(rect.id)}
                          aria-label={`Bereich ${index + 1} und Frage entfernen`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
