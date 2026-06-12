import { $getNodeByKey, type LexicalEditor, type LexicalNode, type NodeKey } from 'lexical'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { OPEN_IMAGE_REPLACE_PICKER_COMMAND } from '../commands/imagePickerCommands'
import { snapshotDomRect } from '../utils/emojiPickerPosition'
import { ImageNodeFrame } from '../components/ImageNodeFrame'
import { ImageNodeControls } from '../components/ImageNodeControls'
import { useLessonImageUpload } from '../hooks/useLessonImageUpload'
import type { LessonImageUploadResult } from '../api/lessonImageApi'
import { fileFromDataUrl, isLocalImageSrc } from '../utils/localImageFile'
import { preloadImageSrc, suspenseImage } from '../utils/imageLoadCache'
import type { ImageNode, ImageNodeClassNames } from './ImageNode'

function isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node != null && node.getType() === 'image'
}

export type ImageNodeComponentProps = {
  altText: string
  classNames: ImageNodeClassNames
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  src: string
  width: 'inherit' | number
}

function LazyImage({
  altText,
  classNames,
  height,
  imageRef,
  isSelected,
  maxWidth,
  onImageMouseDown,
  src,
  width,
}: {
  altText: string
  classNames: ImageNodeClassNames
  height: 'inherit' | number
  imageRef: React.RefObject<HTMLImageElement | null>
  isSelected: boolean
  maxWidth: number
  onImageMouseDown: (event: React.MouseEvent<HTMLImageElement>) => void
  src: string
  width: 'inherit' | number
}) {
  const { t } = useTranslation('features.lesson')
  const status = suspenseImage(src)

  if (status === 'error') {
    return (
      <ImageNodeFrame
        variant="error"
        maxWidth={maxWidth}
        message={t('editor.image.loadFailed')}
        ariaLabel={t('editor.image.loadFailedAria')}
      />
    )
  }

  return (
    <img
      ref={imageRef}
      alt={altText}
      className={cn(classNames.image, isSelected && classNames.imageSelected)}
      draggable={false}
      onMouseDown={onImageMouseDown}
      src={src}
      style={{
        height: height === 'inherit' ? 'auto' : height,
        maxWidth,
        width: width === 'inherit' ? '100%' : width,
      }}
    />
  )
}

async function applyCloudUpload(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  upload: LessonImageUploadResult,
): Promise<boolean> {
  try {
    await preloadImageSrc(upload.publicUrl)
  } catch {
    return false
  }

  editor.update(() => {
    const node = $getNodeByKey(nodeKey)
    if (!isImageNode(node)) {
      return
    }
    node.setSrc(upload.publicUrl)
    node.setCloudReference(upload.filepath, upload.cloudFileId)
  })

  return true
}

function ImageContent({
  altText,
  classNames,
  height,
  maxWidth,
  nodeKey,
  src,
  width,
}: ImageNodeComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const pendingFileRef = useRef<File | null>(null)
  const autoUploadAttemptedRef = useRef<string | null>(null)
  const { isUploading, uploadLessonImageFile } = useLessonImageUpload()
  const { t } = useTranslation('features.lesson')

  const isEditable = editor.isEditable()

  const onImageMouseDown = useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      if (event.button !== 0 || event.detail >= 2) {
        return
      }

      if (event.shiftKey) {
        event.preventDefault()
        setSelected(!isSelected)
        return
      }

      if (isSelected) {
        return
      }

      event.preventDefault()
      clearSelection()
      setSelected(true)
    },
    [clearSelection, isSelected, setSelected],
  )

  const handleReplaceClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      editor.dispatchCommand(OPEN_IMAGE_REPLACE_PICKER_COMMAND, {
        nodeKey,
        anchorRect: snapshotDomRect(event.currentTarget.getBoundingClientRect()),
      })
    },
    [editor, nodeKey],
  )

  useEffect(() => {
    if (!isLocalImageSrc(src)) {
      pendingFileRef.current = null
      autoUploadAttemptedRef.current = null
      return
    }

    if (!isEditable || isUploading) {
      return
    }

    if (autoUploadAttemptedRef.current === src) {
      return
    }
    autoUploadAttemptedRef.current = src

    let cancelled = false

    void (async () => {
      let file = pendingFileRef.current
      if (!file) {
        try {
          file = await fileFromDataUrl(src, altText || 'lesson-image')
        } catch {
          if (!cancelled) toast.error(t('editor.image.uploadFailed'))
          return
        }
      }

      const result = await uploadLessonImageFile(file)
      if (cancelled || !result) {
        return
      }

      const applied = await applyCloudUpload(editor, nodeKey, result)
      if (cancelled) return
      if (!applied) {
        toast.error(t('editor.image.uploadFailed'))
        return
      }
      pendingFileRef.current = null
    })()

    return () => {
      cancelled = true
    }
  }, [altText, editor, isEditable, isUploading, nodeKey, src, t, uploadLessonImageFile])

  return (
    <div
      className="group/image relative w-fit max-w-full"
      style={{ maxWidth }}
    >
      <LazyImage
        altText={altText}
        classNames={classNames}
        height={height}
        imageRef={imageRef}
        isSelected={isSelected}
        maxWidth={maxWidth}
        onImageMouseDown={onImageMouseDown}
        src={src}
        width={width}
      />
      {isEditable ? (
        <ImageNodeControls
          onReplaceClick={handleReplaceClick}
          isUploading={isUploading}
          replaceAriaLabel={t('editor.image.replaceImageAria')}
          uploadingAriaLabel={t('editor.image.uploadingImageAria')}
          isSelected={isSelected}
        />
      ) : null}
    </div>
  )
}

function ImageNodeLoadingFallback({ maxWidth }: { maxWidth: number }) {
  const { t } = useTranslation('features.lesson')
  return (
    <ImageNodeFrame
      variant="loading"
      maxWidth={maxWidth}
      ariaLabel={t('editor.image.loadingAria')}
    />
  )
}

export function ImageNodeComponent(props: ImageNodeComponentProps) {
  return (
    <Suspense fallback={<ImageNodeLoadingFallback maxWidth={props.maxWidth} />}>
      <ImageContent {...props} />
    </Suspense>
  )
}
