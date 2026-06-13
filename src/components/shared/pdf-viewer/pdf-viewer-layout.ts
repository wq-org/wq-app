export const PDF_VIEWER_LAYOUT = {
  default: 'h-[min(70vh,720px)]',
  panel: 'h-[80vh]',
} as const

export type PdfViewerLayout = keyof typeof PDF_VIEWER_LAYOUT
