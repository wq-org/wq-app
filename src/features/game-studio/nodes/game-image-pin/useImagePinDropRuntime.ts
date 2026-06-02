import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, SyntheticEvent } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

import type { GameImagePinRect } from './game-image-pin.schema'
import type { ImagePinProps } from './ImagePin'

export const IMAGE_PIN_DRAG_ID = 'game-image-pin-preview-pin' as const
export const IMAGE_PIN_DROP_ID = 'game-image-pin-preview-image' as const

type ImagePinRuntimeTarget = GameImagePinRect & {
  question: string
}

type ImagePinRuntimePoint = {
  xPercent: number
  yPercent: number
}

type ImagePinRuntimePlacement = ImagePinRuntimePoint & {
  variant: NonNullable<ImagePinProps['variant']>
}

type ImagePinRuntimeSize = {
  width: number
  height: number
}

type ImagePinDragRect = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>

type ImagePinNaturalBounds = {
  left: number
  top: number
  right: number
  bottom: number
  centerXPercent: number
  centerYPercent: number
}

export type UseImagePinDropRuntimeArgs = {
  imageSrc: string
  rectangles: readonly GameImagePinRect[]
}

function getRuntimeTargets(rectangles: readonly GameImagePinRect[]): ImagePinRuntimeTarget[] {
  return rectangles.flatMap((rect) => {
    const question = String(rect.question ?? '').trim()
    if (!question || rect.width <= 0 || rect.height <= 0) return []
    return [{ ...rect, question }]
  })
}

function getTargetsSignature(targets: readonly ImagePinRuntimeTarget[]) {
  return targets
    .map((target) => {
      return [target.id, target.x, target.y, target.width, target.height, target.question].join(':')
    })
    .join('|')
}

function isBoundsInsideTarget(bounds: ImagePinNaturalBounds, target: ImagePinRuntimeTarget) {
  return (
    bounds.left >= target.x &&
    bounds.top >= target.y &&
    bounds.right <= target.x + target.width &&
    bounds.bottom <= target.y + target.height
  )
}

function getTargetOverlayStyle(
  target: ImagePinRuntimeTarget | undefined,
  naturalSize: ImagePinRuntimeSize | null,
): CSSProperties | undefined {
  if (!target || !naturalSize?.width || !naturalSize.height) return undefined

  return {
    left: `${(target.x / naturalSize.width) * 100}%`,
    top: `${(target.y / naturalSize.height) * 100}%`,
    width: `${(target.width / naturalSize.width) * 100}%`,
    height: `${(target.height / naturalSize.height) * 100}%`,
  }
}

export function useImagePinDropRuntime({ imageSrc, rectangles }: UseImagePinDropRuntimeArgs) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const targets = useMemo(() => getRuntimeTargets(rectangles), [rectangles])
  const targetsSignature = getTargetsSignature(targets)
  const [naturalSize, setNaturalSize] = useState<ImagePinRuntimeSize | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingPin, setPendingPin] = useState<ImagePinRuntimePlacement | null>(null)
  const [pinVariant, setPinVariant] = useState<NonNullable<ImagePinProps['variant']>>('default')
  const [feedbackText, setFeedbackText] = useState<string | null>(null)

  const currentTarget = targets[questionIndex]
  const hasNextQuestion = questionIndex < targets.length - 1
  const targetOverlayStyle = getTargetOverlayStyle(currentTarget, naturalSize)
  const isTargetHighlighted = isDragging && Boolean(currentTarget)

  useEffect(() => {
    setQuestionIndex(0)
    setIsDragging(false)
    setPendingPin(null)
    setPinVariant('default')
    setFeedbackText(null)
  }, [targetsSignature])

  useEffect(() => {
    setNaturalSize(null)
    setQuestionIndex(0)
    setIsDragging(false)
    setPendingPin(null)
    setPinVariant('default')
    setFeedbackText(null)
  }, [imageSrc])

  const getNaturalBoundsFromClientRect = (clientRect: ImagePinDragRect) => {
    const imageElement = imageRef.current
    if (!imageElement || !naturalSize?.width || !naturalSize.height) return null

    const imageRect = imageElement.getBoundingClientRect()
    if (imageRect.width <= 0 || imageRect.height <= 0) return null

    const left = ((clientRect.left - imageRect.left) / imageRect.width) * naturalSize.width
    const top = ((clientRect.top - imageRect.top) / imageRect.height) * naturalSize.height
    const right = ((clientRect.right - imageRect.left) / imageRect.width) * naturalSize.width
    const bottom = ((clientRect.bottom - imageRect.top) / imageRect.height) * naturalSize.height
    const centerXPercent =
      ((clientRect.left + clientRect.width / 2 - imageRect.left) / imageRect.width) * 100
    const centerYPercent =
      ((clientRect.top + clientRect.height / 2 - imageRect.top) / imageRect.height) * 100

    return { left, top, right, bottom, centerXPercent, centerYPercent }
  }

  const getPlacementFromDragRect = (clientRect: ImagePinDragRect) => {
    if (!currentTarget) return null

    const bounds = getNaturalBoundsFromClientRect(clientRect)
    if (!bounds) return null

    const isCorrect = isBoundsInsideTarget(bounds, currentTarget)
    return {
      xPercent: bounds.centerXPercent,
      yPercent: bounds.centerYPercent,
      variant: isCorrect ? 'correct' : 'wrong',
    } satisfies ImagePinRuntimePlacement
  }

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setNaturalSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    })
  }

  const handleDragStart = () => {
    setIsDragging(true)
    setFeedbackText(null)
    setPinVariant('default')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)

    if (event.over?.id !== IMAGE_PIN_DROP_ID) {
      setPendingPin(null)
      return
    }

    const translatedRect = event.active.rect.current.translated
    if (!translatedRect) return

    const nextPlacement = getPlacementFromDragRect(translatedRect)
    if (!nextPlacement) return

    setPendingPin(nextPlacement)
  }

  const handleDragCancel = () => {
    setIsDragging(false)
  }

  const handlePromptSubmit = () => {
    if (!currentTarget) return

    if (!pendingPin) {
      setFeedbackText('Drop the pin on the image first.')
      return
    }

    setPinVariant(pendingPin.variant)

    if (pendingPin.variant === 'wrong') {
      setPendingPin(null)
      setFeedbackText('Try the highlighted square again.')
      return
    }

    if (!hasNextQuestion) {
      setPendingPin(null)
      setFeedbackText('All image pins completed.')
      return
    }

    setQuestionIndex((index) => index + 1)
    setPendingPin(null)
    setPinVariant('default')
    setFeedbackText('Correct. Next question loaded.')
  }

  return {
    imageRef,
    targets,
    currentTarget,
    questionIndex,
    naturalSize,
    targetOverlayStyle,
    isDragging,
    isTargetHighlighted,
    pinVariant,
    feedbackText,
    handleImageLoad,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handlePromptSubmit,
  }
}
