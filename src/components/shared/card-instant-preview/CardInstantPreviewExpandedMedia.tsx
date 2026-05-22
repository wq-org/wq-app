import { BasicPdfViewer } from '@/components/shared/pdf-viewer'
import {
  CARD_INSTANT_PREVIEW_MEDIA,
  cardInstantPreviewExpandedImageConstrainedClassName,
  cardInstantPreviewExpandedPdfViewerClassName,
  cardInstantPreviewExpandedVideoConstrainedClassName,
} from './card-instant-preview.constants'
import { CardInstantPreviewExpandedMediaFrame } from './CardInstantPreviewExpandedMediaFrame'
import type {
  CardInstantPreviewCardProps,
  CardInstantPreviewImagePosition,
} from './card-instant-preview.types'
import {
  getCardInstantPreviewMediaVariant,
  isCardInstantPreviewImageCard,
  isCardInstantPreviewPdfCard,
  isCardInstantPreviewVideoCard,
} from './card-instant-preview.utils'

type CardInstantPreviewExpandedImageProps = {
  imageSrc: string
  imageAlt: string
  imagePosition?: CardInstantPreviewImagePosition
}

export function CardInstantPreviewExpandedImage({
  imageSrc,
  imageAlt,
  imagePosition,
}: CardInstantPreviewExpandedImageProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame>
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cardInstantPreviewExpandedImageConstrainedClassName}
        style={{ objectPosition: imagePosition ?? 'center center' }}
      />
    </CardInstantPreviewExpandedMediaFrame>
  )
}

type CardInstantPreviewExpandedVideoProps = {
  videoSrc: string
  fileName: string
}

export function CardInstantPreviewExpandedVideo({
  videoSrc,
  fileName,
}: CardInstantPreviewExpandedVideoProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame>
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
}

export function CardInstantPreviewExpandedPdf({ pdfSrc }: CardInstantPreviewExpandedPdfProps) {
  return (
    <CardInstantPreviewExpandedMediaFrame>
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
}

export function CardInstantPreviewExpandedMedia({
  card,
  editedTitle,
  imagePosition,
}: CardInstantPreviewExpandedMediaProps) {
  const media = getCardInstantPreviewMediaVariant(card)

  switch (media) {
    case CARD_INSTANT_PREVIEW_MEDIA.pdf:
      if (!isCardInstantPreviewPdfCard(card)) return null
      return <CardInstantPreviewExpandedPdf pdfSrc={card.pdfSrc} />
    case CARD_INSTANT_PREVIEW_MEDIA.video:
      if (!isCardInstantPreviewVideoCard(card)) return null
      return (
        <CardInstantPreviewExpandedVideo
          videoSrc={card.videoSrc}
          fileName={editedTitle}
        />
      )
    case CARD_INSTANT_PREVIEW_MEDIA.image:
      if (!isCardInstantPreviewImageCard(card)) return null
      return (
        <CardInstantPreviewExpandedImage
          imageSrc={card.imageSrc}
          imageAlt={editedTitle}
          imagePosition={imagePosition}
        />
      )
  }
}
