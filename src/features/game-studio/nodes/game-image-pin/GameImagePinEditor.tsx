import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Plus, Repeat, Trash2, ImageMinus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FileDropzone, ImageCarousel } from '@/components/shared'
import type { ImageCarouselImage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { HelpPopover } from '@/features/institution-admin/components'
import { getFileSignedUrl } from '@/features/files'

import { ImagePinRectStage } from './ImagePinRectStage'
import {
  createDefaultImagePinRectangle,
  loadImageNaturalSize,
  remapRectsForNewImageSize,
} from './imagePinRectGeometry'
import type { GameImagePinNodeData, GameImagePinRect } from './game-image-pin.schema'
import type { GameImagePinCloudUploadResult } from './useGameImagePinImageUpload'
import { useImagePinCloudGalleryImages } from './useImagePinCloudGalleryImages'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const dataUrl = typeof result === 'string' ? result : ''
      if (!dataUrl) {
        reject(new Error('Failed to read file as data URL'))
        return
      }
      console.log('[readFileAsDataUrl] Data URL created, length:', dataUrl.length)
      resolve(dataUrl)
    }
    reader.onerror = () => {
      console.error('[readFileAsDataUrl] FileReader error:', reader.error)
      reject(reader.error)
    }
    reader.readAsDataURL(file)
  })
}

export type GameImagePinEditorProps = {
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: Record<string, unknown>) => void
  /** Thumbnails from other Image Pin nodes on the same canvas (from `GameEditorCanvas`). */
  projectImageGallery?: readonly { url: string; title: string; storagePath?: string }[]
  /**
   * When set (wired from `GameImagePinDialog`), file picks upload to institution cloud
   * via `uploadFile` and the node stores the public URL plus storage `filepath`.
   */
  uploadGameImagePinFile?: (file: File) => Promise<GameImagePinCloudUploadResult | null>
}

export function GameImagePinEditor({
  nodeData,
  onPatchNodeData,
  projectImageGallery,
  uploadGameImagePinFile,
}: GameImagePinEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameImagePinNodeData
  const imagePreview =
    typeof pin.imagePreview === 'string' && pin.imagePreview.trim() !== '' ? pin.imagePreview : ''

  const rectangles: GameImagePinRect[] = useMemo(
    () => (Array.isArray(pin.rectangles) ? pin.rectangles : []),
    [pin.rectangles],
  )

  const replaceImageInputRef = useRef<HTMLInputElement>(null)
  /** Ignores cloud upload results if the user picked another image meanwhile. */
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null)
  const [sceneMetrics, setSceneMetrics] = useState<{ width: number; height: number } | null>(null)
  const [cloudGalleryRefresh, setCloudGalleryRefresh] = useState(0)

  const galleryItems = useMemo(() => projectImageGallery ?? [], [projectImageGallery])
  const { items: cloudGalleryItems, isLoading: cloudGalleryLoading } =
    useImagePinCloudGalleryImages(cloudGalleryRefresh)

  const mergedGalleryItems = useMemo(() => {
    const byUrl = new Map<string, { url: string; title: string; storagePath?: string }>()
    for (const item of galleryItems) {
      if (item.url.trim()) byUrl.set(item.url.trim(), { ...item })
    }
    for (const item of cloudGalleryItems) {
      const key = item.url.trim()
      if (key && !byUrl.has(key)) byUrl.set(key, item)
    }
    const merged = [...byUrl.values()]

    return merged
  }, [cloudGalleryItems, galleryItems])

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

  const applyImagePreviewFromSrc = useCallback(
    async (src: string, options?: { filepath?: string }) => {
      const trimmed = src.trim()
      if (!trimmed) return
      try {
        const { width: newW, height: newH } = await loadImageNaturalSize(trimmed)

        let oldW = sceneMetrics?.width ?? 0
        let oldH = sceneMetrics?.height ?? 0
        if ((oldW <= 0 || oldH <= 0) && imagePreview && rectangles.length > 0) {
          try {
            const cur = await loadImageNaturalSize(imagePreview)
            oldW = cur.width
            oldH = cur.height
          } catch (e) {
            console.log('[GameImagePinEditor] Could not load previous image for remapping:', e)
          }
        }

        let nextRects = rectangles
        if (oldW > 0 && oldH > 0 && newW > 0 && newH > 0 && rectangles.length > 0) {
          nextRects = remapRectsForNewImageSize(rectangles, oldW, oldH, newW, newH)
        }

        console.log('[GameImagePinEditor] Patching node data with image preview:', {
          filepath: options?.filepath,
          rectCount: nextRects.length,
        })
        onPatchNodeData({
          imagePreview: trimmed,
          filepath: options?.filepath ?? '',
          rectangles: nextRects,
        })
      } catch (error) {
        console.error('[GameImagePinEditor] Failed to apply image preview:', error)
      }
    },
    [imagePreview, onPatchNodeData, rectangles, sceneMetrics],
  )

  const handleGallerySelect = useCallback(
    (image: ImageCarouselImage) => {
      void applyImagePreviewFromSrc(image.url, {
        filepath: image.storagePath ?? '',
      })
    },
    [applyImagePreviewFromSrc],
  )

  const handleFileSelected = useCallback(
    async (files: File[]) => {
      const file = files.find((f) => f.type.startsWith('image/'))
      if (!file) {
        console.log('[GameImagePinEditor] No image file selected')
        return
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        if (!dataUrl) {
          console.warn('[GameImagePinEditor] Failed to read file as data URL')
          return
        }

        // Show the bitmap immediately (data URL) so the stage is usable while cloud upload runs.
        await applyImagePreviewFromSrc(dataUrl, { filepath: '' })

        if (!uploadGameImagePinFile) {
          return
        }

        const uploaded = await uploadGameImagePinFile(file)
        if (!uploaded) {
          console.warn('[GameImagePinEditor] Upload failed or returned null')
          return
        }

        // For private buckets, use signed URL instead of public URL
        const signedUrl = await getFileSignedUrl(uploaded.path, 3600) // 1 hour expiry
        const urlToUse = signedUrl || uploaded.publicUrl

        await applyImagePreviewFromSrc(urlToUse, { filepath: uploaded.path })
        setCloudGalleryRefresh((c) => c + 1)
      } catch (error) {
        console.error(error)
      }
    },
    [applyImagePreviewFromSrc, uploadGameImagePinFile],
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

  /** Always rendered under the dropzone: combines other Image Pin nodes + your cloud library. */
  const galleryBelowDropzone = (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/10 p-3">
      <Text
        as="p"
        variant="body"
        className="text-sm font-medium text-foreground"
      >
        {t('imagePinEditor.galleryTitle')}
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-xs text-muted-foreground"
      >
        {t('imagePinEditor.galleryHint')}
      </Text>
      {cloudGalleryLoading ? (
        <ImageCarousel
          images={[]}
          isLoading
          className="max-w-full"
        />
      ) : mergedGalleryItems.length > 0 ? (
        <ImageCarousel
          images={[...mergedGalleryItems]}
          onSelect={handleGallerySelect}
          className="max-w-full"
        />
      ) : (
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {t('imagePinEditor.galleryEmpty')}
        </Text>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <Text
            as="p"
            variant="body"
            className="text-sm"
          >
            {t('imagePinEditor.intro')}
          </Text>
          <Text
            as="span"
            variant="body"
            bold
            className="text-xs"
          >
            {t('imagePinEditor.drawHint')}
          </Text>
        </div>

        <HelpPopover
          title={t('imagePinEditor.helpTitle')}
          sectionDefinitionLabel={t('imagePinEditor.helpSectionDefinition')}
          sectionExampleLabel={t('imagePinEditor.helpSectionExample')}
          sectionExampleValuesLabel={t('imagePinEditor.helpSectionExamples')}
          sectionReasonLabel={t('imagePinEditor.helpSectionReason')}
          definition={t('imagePinEditor.helpDefinition')}
          exampleTitle={t('imagePinEditor.helpExampleTitle')}
          exampleValues={[t('imagePinEditor.helpExampleValues')]}
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4">
          {!imagePreview ? (
            <div className="flex flex-col gap-4">
              <FileDropzone
                accept="image/*"
                onFilesSelected={handleFileSelected}
                disabled={false}
              />
              {galleryBelowDropzone}
            </div>
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
                    {t('imagePinEditor.addRectangle')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedRectId}
                    onClick={handleDeleteSelectedRect}
                  >
                    <Trash2 className="size-4" />
                    {t('imagePinEditor.deleteSelection')}
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
                    aria-label={t('imagePinEditor.replaceImageAria')}
                  >
                    <Repeat />
                  </Button>
                  <Button
                    type="button"
                    variant="delete"
                    size="icon"
                    onClick={handleClearImage}
                    className="rounded-full"
                    aria-label={t('imagePinEditor.removeImageAria')}
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
                    {t('imagePinEditor.questionsPerRegion')}
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
                          label={t('imagePinEditor.questionLabel', { index: index + 1 })}
                          placeholder={t('imagePinEditor.questionPlaceholder')}
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
                          aria-label={t('imagePinEditor.removeRegionAria', { index: index + 1 })}
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
