import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  type NodeKey,
} from 'lexical'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { cn } from '@/lib/utils'

import { ImageNodeControls } from '../components/ImageNodeControls'
import { useLessonImageUpload } from '../hooks/useLessonImageUpload'
import type { LessonImageUploadResult } from '../api/lessonImageApi'
import { fileFromDataUrl, isLocalImageSrc, readImageFileAsDataUrl } from '../utils/localImageFile'
import { preloadImageSrc, suspenseImage } from '../utils/imageLoadCache'
import { $isImageNode } from './ImageNode'

export type ImageNodeComponentProps = {
  altText: string
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  src: string
  width: 'inherit' | number
}

function LazyImage({
  altText,
  focused,
  height,
  imageRef,
  maxWidth,
  src,
  width,
}: {
  altText: string
  focused: boolean
  height: 'inherit' | number
  imageRef: React.RefObject<HTMLImageElement | null>
  maxWidth: number
  src: string
  width: 'inherit' | number
}) {
  const status = suspenseImage(src)

  if (status === 'error') {
    return (
      <div
        className="ImageNode__broken"
        style={{ maxWidth }}
      >
        Failed to load image
      </div>
    )
  }

  return (
    <img
      ref={imageRef}
      alt={altText}
      className={cn('ImageNode__image', focused && 'ImageNode__focused')}
      draggable={false}
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
    if (!$isImageNode(node)) {
      return
    }
    node.setSrc(upload.publicUrl)
    node.setCloudReference(upload.filepath, upload.cloudFileId)
  })

  return true
}

async function applyLocalReplacement(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  nextSrc: string,
  altText: string,
): Promise<boolean> {
  try {
    await preloadImageSrc(nextSrc)
  } catch {
    return false
  }

  editor.update(() => {
    const node = $getNodeByKey(nodeKey)
    if (!$isImageNode(node)) {
      return
    }
    node.setSrc(nextSrc)
    node.setAltText(altText)
    node.setCloudReference(null, null)
  })

  return true
}

function ImageContent({ altText, height, maxWidth, nodeKey, src, width }: ImageNodeComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const replaceImageInputRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<File | null>(null)
  const autoUploadAttemptedRef = useRef<string | null>(null)
  const { isUploading, uploadLessonImageFile } = useLessonImageUpload()
  const { t } = useTranslation('features.lesson')

  const isEditable = editor.isEditable()

  const onClick = useCallback(
    (payload: MouseEvent) => {
      if (payload.target === imageRef.current) {
        if (payload.shiftKey) {
          setSelected(!isSelected)
        } else {
          clearSelection()
          setSelected(true)
        }
        return true
      }
      return false
    },
    [clearSelection, isSelected, setSelected],
  )

  const handleReplaceImageInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        toast.error(t('editor.image.invalidType'))
        return
      }

      try {
        const dataUrl = await readImageFileAsDataUrl(file)
        const applied = await applyLocalReplacement(editor, nodeKey, dataUrl, file.name)
        if (!applied) {
          toast.error(t('editor.image.replaceFailed'))
          return
        }
        pendingFileRef.current = file
        autoUploadAttemptedRef.current = null
      } catch {
        toast.error(t('editor.image.replaceFailed'))
      }
    },
    [editor, nodeKey, t],
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

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
    )
  }, [editor, onClick])

  return (
    <div
      className="group/image relative w-fit max-w-full"
      style={{ maxWidth }}
    >
      <LazyImage
        altText={altText}
        focused={isSelected}
        height={height}
        imageRef={imageRef}
        maxWidth={maxWidth}
        src={src}
        width={width}
      />
      {isEditable ? (
        <ImageNodeControls
          replaceImageInputRef={replaceImageInputRef}
          onReplaceInputChange={handleReplaceImageInputChange}
          isUploading={isUploading}
          replaceAriaLabel={t('editor.image.replaceImageAria')}
          uploadingAriaLabel={t('editor.image.uploadingImageAria')}
          isSelected={isSelected}
        />
      ) : null}
    </div>
  )
}

export function ImageNodeComponent(props: ImageNodeComponentProps) {
  return (
    <Suspense
      fallback={
        <div
          className="ImageNode__loading"
          style={{ maxWidth: props.maxWidth }}
        />
      }
    >
      <ImageContent {...props} />
    </Suspense>
  )
}
