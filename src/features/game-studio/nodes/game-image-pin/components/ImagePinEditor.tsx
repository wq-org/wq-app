import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react'
import type { SerializedEditorState } from 'lexical'
import { Plus, Repeat, Trash2, ImageMinus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FileDropzone, ImageCarousel, SelectTabs } from '@/components/shared'
import type { ImageCarouselImage } from '@/components/shared'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { HelpPopover } from '@/components/shared'
import { LexicalTextarea } from '@/components/shared/lexical-textarea'
import type { EditorExternalInsertApi } from '@/features/lexical-editor'
import { getFileSignedUrl } from '@/features/cloud'
import { lookupCloudFileIdByStoragePath } from '@/features/cloud'
import { cn } from '@/lib/utils'

import { ImagePinRectStage } from './ImagePinRectStage'
import type { GameNodeDataPatch } from '../../_registry/game-node-registry.types'
import type { GameImagePinNodeData, GameImagePinRect } from '../image-pin.schema'
import {
  createDefaultImagePinRectangle,
  loadImageNaturalSize,
  remapRectsForNewImageSize,
} from '../imagePinRectGeometry'
import { useImagePinCloudGalleryImages } from '../hooks/useImagePinCloudGalleryImages'
import type { ImagePinCloudUploadResult } from '../hooks/useImagePinImageUpload'
import { useImagePinQuestionTabs } from '../hooks/useImagePinQuestionTabs'

const DESCRIPTION_MIN_HEIGHT_PX = 80
const imagePinEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const imagePinEditorEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

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
      resolve(dataUrl)
    }
    reader.onerror = () => {
      console.error('[readFileAsDataUrl] FileReader error:', reader.error)
      reject(reader.error)
    }
    reader.readAsDataURL(file)
  })
}

export type ImagePinEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
  pendingPreviewSrc?: string | null
  onPendingPreviewSrcChange?: (src: string | null) => void
  /** Thumbnails from other Image Pin nodes on the same canvas (from `GameEditorCanvas`). */
  projectImageGallery?: readonly { url: string; title: string; storagePath?: string }[]
  /**
   * When set (wired from `ImagePinDialog`), file picks upload to institution cloud
   * via `uploadFile` and the node stores the public URL plus storage `filepath`.
   */
  uploadImagePinFile?: (file: File) => Promise<ImagePinCloudUploadResult | null>
  /** Forwarded to `LexicalTextarea` so the agent panel can append text to the description. */
  onDescriptionInsertReady?: (api: EditorExternalInsertApi | null) => void
  /**
   * Controlled selection — `ImagePinDialog` owns this so the agent panel can
   * register insertion targets that match the visible question tab.
   */
  selectedRectId?: string | null
  onSelectedRectIdChange?: (rectId: string | null) => void
}

export function ImagePinEditor({
  nodeId,
  nodeData,
  onPatchNodeData,
  pendingPreviewSrc: controlledPendingPreviewSrc,
  onPendingPreviewSrcChange,
  projectImageGallery,
  uploadImagePinFile,
  onDescriptionInsertReady,
  selectedRectId: controlledSelectedRectId,
  onSelectedRectIdChange,
}: ImagePinEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameImagePinNodeData
  const imagePreview =
    typeof pin.imagePreview === 'string' && pin.imagePreview.trim() !== '' ? pin.imagePreview : ''

  const rectangles: GameImagePinRect[] = useMemo(
    () => (Array.isArray(pin.rectangles) ? pin.rectangles : []),
    [pin.rectangles],
  )

  const replaceImageInputRef = useRef<HTMLInputElement>(null)
  const descriptionSurfaceRef = useRef<HTMLDivElement>(null)
  /** Prevents a second file pick from triggering a new upload while one is in flight. */
  const isUploadingRef = useRef(false)
  const [uncontrolledSelectedRectId, setUncontrolledSelectedRectId] = useState<string | null>(null)
  const isSelectionControlled = controlledSelectedRectId !== undefined
  const selectedRectId = isSelectionControlled
    ? controlledSelectedRectId
    : uncontrolledSelectedRectId
  const setSelectedRectId = useCallback(
    (rectId: string | null) => {
      if (onSelectedRectIdChange) onSelectedRectIdChange(rectId)
      if (!isSelectionControlled) setUncontrolledSelectedRectId(rectId)
    },
    [isSelectionControlled, onSelectedRectIdChange],
  )
  const [sceneMetrics, setSceneMetrics] = useState<{ width: number; height: number } | null>(null)
  const [cloudGalleryRefresh, setCloudGalleryRefresh] = useState(0)
  /**
   * Local, non-persisted preview shown while the cloud upload is in flight.
   * Kept out of `nodeData` so the (potentially MB-sized) base64 data URL does
   * not get autosaved — that was producing a second autosave per file pick.
   */
  const [uncontrolledPendingPreviewSrc, setUncontrolledPendingPreviewSrc] = useState<string | null>(
    null,
  )
  const isPendingPreviewControlled = controlledPendingPreviewSrc !== undefined
  const pendingPreviewSrc = isPendingPreviewControlled
    ? controlledPendingPreviewSrc
    : uncontrolledPendingPreviewSrc
  const setPendingPreviewSrc = useCallback(
    (src: string | null) => {
      if (onPendingPreviewSrcChange) {
        onPendingPreviewSrcChange(src)
        return
      }
      setUncontrolledPendingPreviewSrc(src)
    },
    [onPendingPreviewSrcChange],
  )
  const displayedImageSrc = pendingPreviewSrc ?? imagePreview

  const galleryItems = useMemo(() => projectImageGallery ?? [], [projectImageGallery])
  const { items: cloudGalleryItems, isLoading: cloudGalleryLoading } =
    useImagePinCloudGalleryImages(cloudGalleryRefresh)

  const handleSceneMetrics = useCallback((metrics: { width: number; height: number }) => {
    setSceneMetrics(metrics)
  }, [])

  const mergedGalleryItems = useMemo(() => {
    const seen = new Map<string, { url: string; title: string; storagePath?: string }>()

    function itemKey(item: { url: string; storagePath?: string }): string {
      return item.storagePath?.trim() || item.url.trim()
    }

    for (const item of galleryItems) {
      if (!item.url.trim()) continue
      const key = itemKey(item)
      if (!seen.has(key)) seen.set(key, { ...item })
    }
    for (const item of cloudGalleryItems) {
      const key = itemKey(item)
      if (key && !seen.has(key)) seen.set(key, item)
    }

    return [...seen.values()]
  }, [cloudGalleryItems, galleryItems])

  useEffect(() => {
    setSelectedRectId(null)
    setSceneMetrics(null)
    setPendingPreviewSrc(null)
  }, [imagePreview, setPendingPreviewSrc, setSelectedRectId])

  useEffect(() => {
    if (rectangles.length === 0) {
      setSelectedRectId(null)
      return
    }
    if (!selectedRectId || !rectangles.some((rect) => rect.id === selectedRectId)) {
      setSelectedRectId(rectangles[0].id)
    }
  }, [rectangles, selectedRectId, setSelectedRectId])

  const { activeRect, activeRectId, selectTabItems, setActiveTabId } = useImagePinQuestionTabs({
    rectangles,
    selectedRectId,
    onSelectedRectIdChange: setSelectedRectId,
    t,
  })

  const handleRectanglesChange = useCallback(
    (next: GameImagePinRect[]) => {
      onPatchNodeData({ rectangles: next })
    },
    [onPatchNodeData],
  )

  const patchRectQuestion = useCallback(
    (id: string, question: string) => {
      onPatchNodeData((current) => {
        const currentRects = Array.isArray(current.rectangles)
          ? (current.rectangles as GameImagePinRect[])
          : []
        return {
          rectangles: currentRects.map((r) => (r.id === id ? { ...r, question } : r)),
        }
      })
    },
    [onPatchNodeData],
  )

  const handleDeleteRectRow = useCallback(
    (id: string) => {
      const remaining = rectangles.filter((r) => r.id !== id)
      onPatchNodeData({ rectangles: remaining })
      if (selectedRectId === id) {
        const removedIndex = rectangles.findIndex((r) => r.id === id)
        const nextActive = remaining[Math.min(removedIndex, remaining.length - 1)]
        setSelectedRectId(nextActive?.id ?? null)
      }
    },
    [onPatchNodeData, rectangles, selectedRectId, setSelectedRectId],
  )

  const handleAddRect = useCallback(() => {
    if (!sceneMetrics) return
    const next = createDefaultImagePinRectangle(sceneMetrics.width, sceneMetrics.height)
    onPatchNodeData((current) => {
      const currentRects = Array.isArray(current.rectangles)
        ? (current.rectangles as GameImagePinRect[])
        : []
      return { rectangles: [...currentRects, next] }
    })
    setSelectedRectId(next.id)
  }, [onPatchNodeData, sceneMetrics, setSelectedRectId])

  const handleDeleteSelectedRect = useCallback(() => {
    if (!selectedRectId) return
    onPatchNodeData((current) => {
      const currentRects = Array.isArray(current.rectangles)
        ? (current.rectangles as GameImagePinRect[])
        : []
      return { rectangles: currentRects.filter((r) => r.id !== selectedRectId) }
    })
    setSelectedRectId(null)
  }, [onPatchNodeData, selectedRectId, setSelectedRectId])

  const handleImageLoadFailed = useCallback(
    (failedSrc: string) => {
      const filepath = typeof pin.filepath === 'string' ? pin.filepath.trim() : ''
      if (!filepath) return

      void getFileSignedUrl(filepath, 3600)
        .then((newUrl) => {
          if (!newUrl || newUrl === failedSrc) return
          onPatchNodeData({
            imagePreview: newUrl,
            filepath,
            cloudFileId: pin.cloudFileId ?? null,
            rectangles,
          })
        })
        .catch((error) => {
          console.error('[ImagePinEditor] Failed to refresh signed URL:', error)
        })
    },
    [pin.cloudFileId, pin.filepath, rectangles, onPatchNodeData],
  )

  const applyImagePreviewFromSrc = useCallback(
    async (src: string, options?: { filepath?: string; cloudFileId?: string | null }) => {
      const trimmed = src.trim()
      if (!trimmed) return

      let nextRects = rectangles

      try {
        const { width: newW, height: newH } = await loadImageNaturalSize(trimmed)

        let oldW = sceneMetrics?.width ?? 0
        let oldH = sceneMetrics?.height ?? 0
        if ((oldW <= 0 || oldH <= 0) && imagePreview && rectangles.length > 0) {
          try {
            const cur = await loadImageNaturalSize(imagePreview)
            oldW = cur.width
            oldH = cur.height
          } catch {
            // skip remapping if previous image can't be measured
          }
        }

        if (oldW > 0 && oldH > 0 && newW > 0 && newH > 0 && rectangles.length > 0) {
          nextRects = remapRectsForNewImageSize(rectangles, oldW, oldH, newW, newH)
        }
      } catch (error) {
        console.error(
          '[ImagePinEditor] Failed to load image dimensions, persisting without remapping:',
          error,
        )
      }

      let cloudFileId = options?.cloudFileId ?? pin.cloudFileId ?? null
      const storagePath = (options?.filepath ?? '').trim()
      if (!cloudFileId && storagePath) {
        cloudFileId = await lookupCloudFileIdByStoragePath(storagePath)
      }

      onPatchNodeData({
        imagePreview: trimmed,
        filepath: storagePath,
        cloudFileId,
        rectangles: nextRects,
      })
    },
    [imagePreview, pin.cloudFileId, rectangles, sceneMetrics, onPatchNodeData],
  )

  const handleGallerySelect = useCallback(
    (image: ImageCarouselImage) => {
      void applyImagePreviewFromSrc(image.url, {
        filepath: image.storagePath ?? '',
        cloudFileId: image.cloudFileId ?? null,
      })
    },
    [applyImagePreviewFromSrc],
  )

  const handleFileSelected = useCallback(
    async (files: File[]) => {
      if (isUploadingRef.current) return
      const file = files.find((f) => f.type.startsWith('image/'))
      if (!file) return

      isUploadingRef.current = true
      try {
        const dataUrl = await readFileAsDataUrl(file)
        if (!dataUrl) return

        // Show the bitmap immediately via LOCAL state — do not patch nodeData
        // with the data URL, otherwise the parent autosave persists a multi-MB
        // base64 blob and then patches again with the cloud URL.
        setPendingPreviewSrc(dataUrl)

        if (!uploadImagePinFile) {
          await applyImagePreviewFromSrc(dataUrl, { filepath: '' })
          setPendingPreviewSrc(null)
          return
        }

        const uploaded = await uploadImagePinFile(file)
        if (!uploaded) {
          setPendingPreviewSrc(null)
          return
        }

        const signedUrl = await getFileSignedUrl(uploaded.path, 3600)
        const urlToUse = signedUrl || uploaded.publicUrl

        await applyImagePreviewFromSrc(urlToUse, {
          filepath: uploaded.path,
          cloudFileId: uploaded.cloudFileId,
        })
        setPendingPreviewSrc(null)
        setCloudGalleryRefresh((c) => c + 1)
      } catch (error) {
        console.error(error)
        setPendingPreviewSrc(null)
      } finally {
        isUploadingRef.current = false
      }
    },
    [applyImagePreviewFromSrc, setPendingPreviewSrc, uploadImagePinFile],
  )

  const handleClearImage = useCallback(() => {
    onPatchNodeData({
      imagePreview: '',
      filepath: '',
      cloudFileId: null,
      rectangles: [],
    })
  }, [onPatchNodeData])

  const handleReplaceImageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files
      if (list?.length) void handleFileSelected(Array.from(list))
      event.target.value = ''
    },
    [handleFileSelected],
  )

  const handleDescriptionContentChange = useCallback(
    (value: SerializedEditorState) => {
      onPatchNodeData({ descriptionContent: value })
    },
    [onPatchNodeData],
  )

  const focusDescriptionEditor = useCallback(() => {
    const editable = descriptionSurfaceRef.current?.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )
    editable?.focus()
  }, [])

  const handleDescriptionSurfacePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('[contenteditable="true"]')) return
      focusDescriptionEditor()
    },
    [focusDescriptionEditor],
  )

  /** Always rendered under the dropzone: combines other Image Pin nodes + your cloud library. */
  const galleryBelowDropzone = (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-muted/10 p-3',
        imagePinEditorEnterSubtle,
      )}
    >
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
    <div className="flex max-h-[calc(100vh-10rem)] min-h-0 flex-col gap-8 overflow-y-auto pr-2">
      <div className={cn('flex  justify-end gap-2', imagePinEditorEnterSubtle)}>
        <HelpPopover
          showButtonText
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

      <Accordion
        type="single"
        collapsible
        defaultValue="game-description"
        className={imagePinEditorEnterSubtle}
      >
        <AccordionItem
          value="game-description"
          className="border-b-0"
        >
          <AccordionTrigger className="py-3">
            <Text
              as="p"
              variant="body"
              className="text-sm font-medium text-foreground"
            >
              {t('imagePinSettings.gameDescriptionLabel')}
            </Text>
          </AccordionTrigger>
          {/*
            `forceMount` keeps the Lexical editor mounted when the accordion is
            collapsed so the imperative insert API stays registered. Without it,
            collapsing the description nulls the API ref and the agent panel's
            "Insert into Description" click silently no-ops.
          */}
          <AccordionContent
            forceMount
            className="data-[state=closed]:hidden"
          >
            <div
              ref={descriptionSurfaceRef}
              className="flex cursor-text flex-col gap-2 pb-2 [&_label]:sr-only"
              onPointerDown={handleDescriptionSurfacePointerDown}
            >
              <LexicalTextarea
                id={`image-pin-description-${nodeId}`}
                label={t('imagePinSettings.gameDescriptionLabel')}
                hydrationKey={`image-pin-description-${nodeId}`}
                value={pin.descriptionContent ?? null}
                onValueChange={handleDescriptionContentChange}
                placeholder={t('imagePinSettings.gameDescriptionPlaceholder')}
                minHeight={DESCRIPTION_MIN_HEIGHT_PX}
                onExternalInsertReady={onDescriptionInsertReady}
              />
              <Text
                as="p"
                variant="small"
                muted
                bold
              >
                {t('imagePinSettings.gameDescriptionHint')}
              </Text>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4">
          {!displayedImageSrc ? (
            <div className={cn('flex flex-col gap-4', imagePinEditorEnterLift)}>
              <FileDropzone
                accept="image/*"
                onFilesSelected={handleFileSelected}
                disabled={false}
              />
              {galleryBelowDropzone}
            </div>
          ) : null}
          {displayedImageSrc ? (
            <div className={cn('flex w-full max-w-full flex-col gap-3', imagePinEditorEnterLift)}>
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
                imageSrc={displayedImageSrc}
                rectangles={rectangles}
                onRectanglesChange={handleRectanglesChange}
                selectedRectId={selectedRectId}
                onSelectedRectIdChange={setSelectedRectId}
                onSceneMetrics={handleSceneMetrics}
                onImageLoadFailed={handleImageLoadFailed}
              />

              {rectangles.length > 0 ? (
                <div
                  className={cn(
                    'flex flex-col gap-4 border-t border-border pt-4',
                    imagePinEditorEnterSubtle,
                  )}
                >
                  <Text
                    as="p"
                    variant="body"
                    className="text-sm font-medium text-foreground"
                  >
                    {t('imagePinEditor.questionsPerRegion')}
                  </Text>

                  <SelectTabs
                    variant="compact"
                    className="border-b border-border"
                    tabs={selectTabItems}
                    activeTabId={activeRectId}
                    onTabChange={setActiveTabId}
                    showAddTab
                    addTabAriaLabel={t('imagePinEditor.addQuestionTabAriaLabel')}
                    onAddTabClick={handleAddRect}
                    addTabDisabled={!sceneMetrics}
                    onTabClose={handleDeleteRectRow}
                    closeTabAriaLabel={t('imagePinEditor.closeQuestionTabAriaLabel')}
                  />

                  {activeRect ? (
                    <FieldTextarea
                      className="min-w-0"
                      placeholder={t('imagePinEditor.questionPlaceholder')}
                      value={activeRect.question ?? ''}
                      onValueChange={(value) => patchRectQuestion(activeRect.id, value)}
                      rows={3}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
