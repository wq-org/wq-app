export type UploadSummaryItemStatus = 'success' | 'failed'

export type UploadSummaryItem = {
  id: string
  fileName: string
  /** Shown on the second line (e.g. file size or error message). */
  subtitle?: string
  status: UploadSummaryItemStatus
}
