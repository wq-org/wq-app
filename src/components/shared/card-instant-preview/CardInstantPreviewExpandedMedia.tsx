import { BasicPdfViewer } from '@/components/shared/pdf-viewer'
import {
  CARD_INSTANT_PREVIEW_MEDIA,
  cardInstantPreviewExpandedNaturalMediaClassName,
  cardInstantPreviewExpandedPdfViewerClassName,
  cardInstantPreviewExpandedVideoConstrainedClassName,
} from './card-instant-preview.constants'
import { CardInstantPreviewExpandedMediaFrame } from './CardInstantPreviewExpandedMediaFrame'
import type {
  CardInstantPreviewCardProps,
  CardInstantPreviewImagePosition,
} from './card-instant-preview.types'
import { getCardInstantPreviewMediaVariant } from './card-instant-preview.utils'

type CardInstantPreviewExpandedImageProps = {
  imageSrc: string
  imageAlt: string
  imagePosition?: CardInstantPreviewImagePosition
  isFullscreen: boolean
}

export function CardInstantPreviewExpandedImage({
  imageSrc,
  imageAlt,
  imagePosition,
  isFullscreen,
}: CardInstantPreviewExpandedImageProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame isFullscreen={isFullscreen}>
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cardInstantPreviewExpandedNaturalMediaClassName}
        style={{ objectPosition: imagePosition ?? 'center center' }}
      />
    </CardInstantPreviewExpandedMediaFrame>
  )
}

type CardInstantPreviewExpandedVideoProps = {
  videoSrc: string
  fileName: string
  isFullscreen: boolean
}

export function CardInstantPreviewExpandedVideo({
  videoSrc,
  fileName,
  isFullscreen,
}: CardInstantPreviewExpandedVideoProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame
      isFullscreen={isFullscreen}
      layout="constrained"
    >
      <video
        src={videoSrc}
        controls
        playsInline
        preload="metadata"
        title={fileName}
        className={cardInstantPreviewExpandedVideoConstrainedClassName}
      />
    </CardInstantPreviewExpandedMediaFrame>
  )
}

type CardInstantPreviewExpandedPdfProps = {
  pdfSrc: string
  isFullscreen: boolean
}

export function CardInstantPreviewExpandedPdf({
  pdfSrc,
  isFullscreen,
}: CardInstantPreviewExpandedPdfProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame
      isFullscreen={isFullscreen}
      layout="constrained"
    >
      <BasicPdfViewer
        source={pdfSrc}
        className={cardInstantPreviewExpandedPdfViewerClassName}
      />
    </CardInstantPreviewExpandedMediaFrame>
  )
}

type CardInstantPreviewExpandedMediaProps = {
  card: CardInstantPreviewCardProps
  editedTitle: string
  imagePosition?: CardInstantPreviewImagePosition
  isFullscreen: boolean
}

export function CardInstantPreviewExpandedMedia({
  card,
  editedTitle,
  imagePosition,
  isFullscreen,
}: CardInstantPreviewExpandedMediaProps) {
  const media = getCardInstantPreviewMediaVariant(card)

  switch (media) {
    case CARD_INSTANT_PREVIEW_MEDIA.pdf:
      return (
        <CardInstantPreviewExpandedPdf
          pdfSrc={card.pdfSrc}
          isFullscreen={isFullscreen}
        />
      )
    case CARD_INSTANT_PREVIEW_MEDIA.video:
      return (
        <CardInstantPreviewExpandedVideo
          videoSrc={card.videoSrc}
          fileName={editedTitle}
          isFullscreen={isFullscreen}
        />
      )
    case CARD_INSTANT_PREVIEW_MEDIA.image:
      return (
        <CardInstantPreviewExpandedImage
          imageSrc={card.imageSrc}
          imageAlt={editedTitle}
          imagePosition={imagePosition}
          isFullscreen={isFullscreen}
        />
      )
  }
}
