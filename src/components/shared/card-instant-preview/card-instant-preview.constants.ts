/** Discriminated `media` values for card instant preview (image | pdf | video). */
export const CARD_INSTANT_PREVIEW_MEDIA = {
  image: 'image',
  pdf: 'pdf',
  video: 'video',
} as const

export type CardInstantPreviewMediaVariant =
  (typeof CARD_INSTANT_PREVIEW_MEDIA)[keyof typeof CARD_INSTANT_PREVIEW_MEDIA]

export const CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS = 300

export const CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID = 200
export const CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID = 350
export const CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID = 300

export const CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT = 'min(55vh, 520px)'
export const CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT_FULLSCREEN = 'calc(100dvh - 18rem)'

export const CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT = 'min(36dvh, 260px)'
export const CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT_FULLSCREEN = 'min(40dvh, 320px)'

export const cardInstantPreviewExpandedNaturalMediaClassName =
  'h-auto w-auto max-w-full rounded object-contain max-h-[var(--card-instant-preview-media-max-h)]'

export const cardInstantPreviewExpandedVideoClassName =
  'h-auto w-auto max-w-full rounded-xl object-contain max-h-[var(--card-instant-preview-media-max-h)]'

/** Video inside flex-constrained expanded frame (PDF-style); scales within remaining dialog height. */
export const cardInstantPreviewExpandedVideoConstrainedClassName =
  'h-full max-h-full w-auto max-w-full rounded-xl object-contain'

export const cardInstantPreviewExpandedPdfViewerClassName =
  'h-full min-h-0 w-full max-w-full rounded-xl border-0 bg-transparent'
