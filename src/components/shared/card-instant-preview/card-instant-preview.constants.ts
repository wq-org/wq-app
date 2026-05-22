/** Discriminated `media` values for card instant preview (image | pdf | video). */
export const CARD_INSTANT_PREVIEW_MEDIA = {
  image: 'image',
  pdf: 'pdf',
  video: 'video',
} as const

export type CardInstantPreviewMediaVariant =
  (typeof CARD_INSTANT_PREVIEW_MEDIA)[keyof typeof CARD_INSTANT_PREVIEW_MEDIA]

export const CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS = 300

/** Expanded dialog: always viewport-centered; fullscreen toggles size from that origin. */
export const cardInstantPreviewExpandedShellBaseClassName =
  'pointer-events-auto fixed left-1/2 top-1/2 z-[201] flex min-h-0 w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-card text-card-foreground shadow-2xl transition-[width,height,max-width,max-height,border-radius] duration-300 ease-out'

export const cardInstantPreviewExpandedShellModalClassName =
  'h-[min(calc(100dvh-2rem),820px)] max-h-[min(calc(100dvh-2rem),820px)] max-w-[min(720px,calc(100vw-2rem))] rounded-[28px] sm:h-[min(90vh,820px)] sm:max-h-[min(90vh,820px)] sm:w-[min(720px,calc(100vw-48px))]'

export const cardInstantPreviewExpandedShellFullscreenClassName =
  'h-[100dvh] max-h-none w-[100vw] max-w-none rounded-none'

export const CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID = 200
export const CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID = 350
export const CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID = 300

/** Image/video inside flex-constrained expanded frame; scales within remaining dialog height. */
export const cardInstantPreviewExpandedImageConstrainedClassName =
  'h-full max-h-full w-auto max-w-full rounded object-contain'

export const cardInstantPreviewExpandedVideoConstrainedClassName =
  'h-full max-h-full w-auto max-w-full rounded-xl object-contain'

export const cardInstantPreviewExpandedPdfViewerClassName =
  'h-full min-h-0 w-full max-w-full rounded-xl border-0 bg-transparent'
