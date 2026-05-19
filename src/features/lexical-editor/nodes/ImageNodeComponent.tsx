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
import {
  fileFromDataUrl,
  isCloudImageSrc,
  isLocalImageSrc,
  readImageFileAsDataUrl,
} from '../utils/localImageFile'
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

async function applyImageSrc(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  nextSrc: string,
  altText?: string,
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
    if (altText !== undefined) {
      node.setAltText(altText)
    }
  })

  return true
}

function ImageContent({ altText, height, maxWidth, nodeKey, src, width }: ImageNodeComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const replaceImageInputRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<File | null>(null)
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
        const applied = await applyImageSrc(editor, nodeKey, dataUrl, file.name)
        if (!applied) {
          toast.error(t('editor.image.replaceFailed'))
          return
        }
        pendingFileRef.current = file
      } catch {
        toast.error(t('editor.image.replaceFailed'))
      }
    },
    [editor, nodeKey, t],
  )

  const handleUploadToCloud = useCallback(async () => {
    if (isCloudImageSrc(src) && !pendingFileRef.current) {
      toast.info(t('editor.image.alreadyInCloud'))
      return
    }

    const pendingFile = pendingFileRef.current
    let fileToUpload = pendingFile

    if (!fileToUpload && isLocalImageSrc(src)) {
      try {
        fileToUpload = await fileFromDataUrl(src, altText || 'lesson-image')
      } catch {
        toast.error(t('editor.image.uploadFailed'))
        return
      }
    }

    if (!fileToUpload) {
      toast.error(t('editor.image.uploadNeedsLocalImage'))
      return
    }

    const result = await uploadLessonImageFile(fileToUpload)
    if (!result) {
      return
    }

    const applied = await applyImageSrc(editor, nodeKey, result.publicUrl)
    if (!applied) {
      toast.error(t('editor.image.uploadFailed'))
      return
    }

    pendingFileRef.current = null
  }, [altText, editor, nodeKey, src, t, uploadLessonImageFile])

  useEffect(() => {
    if (!isLocalImageSrc(src)) {
      pendingFileRef.current = null
    }
  }, [src])

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
          onUploadClick={handleUploadToCloud}
          isUploading={isUploading}
          replaceAriaLabel={t('editor.image.replaceImageAria')}
          uploadAriaLabel={t('editor.image.uploadToCloudAria')}
          uploadingAriaLabel={t('editor.image.uploadingImageAria')}
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
