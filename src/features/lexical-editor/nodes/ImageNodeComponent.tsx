import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, type NodeKey } from 'lexical'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import { cn } from '@/lib/utils'

export type ImageNodeComponentProps = {
  altText: string
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  src: string
  width: 'inherit' | number
}

const imageCache = new Map<string, Promise<void> | 'loaded' | 'error'>()

function suspenseImage(src: string): 'loaded' | 'error' {
  const cached = imageCache.get(src)
  if (cached === 'loaded' || cached === 'error') return cached
  if (!cached) {
    const promise = new Promise<void>((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imageCache.set(src, 'loaded')
        resolve()
      }
      img.onerror = () => {
        imageCache.set(src, 'error')
        resolve()
      }
    })
    imageCache.set(src, promise)
    throw promise
  }
  throw cached
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

function ImageContent({ altText, height, maxWidth, nodeKey, src, width }: ImageNodeComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const imageRef = useRef<HTMLImageElement | null>(null)

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

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
    )
  }, [editor, onClick])

  return (
    <LazyImage
      altText={altText}
      focused={isSelected}
      height={height}
      imageRef={imageRef}
      maxWidth={maxWidth}
      src={src}
      width={width}
    />
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
