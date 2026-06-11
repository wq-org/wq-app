export interface UploadedFile {
  id: string
  file: File
  title: string
  preview?: string
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const ALLOWED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/jpg', 'image/png']

export const ALLOWED_VIDEO_TYPES: string[] = ['video/mp4']

export const ALLOWED_DOCUMENT_TYPES: string[] = ['application/pdf']

export type AllowedFileType =
  | (typeof ALLOWED_IMAGE_TYPES)[number]
  | (typeof ALLOWED_VIDEO_TYPES)[number]
  | (typeof ALLOWED_DOCUMENT_TYPES)[number]

/** MIME types accepted by cloud upload (images, PDF, MP4). */
export const ALL_ALLOWED_TYPES: string[] = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
]

export const MAX_VIDEO_DURATION = 60 // seconds

/** Hard cap for PDF uploads. Enforced before upload starts so users never wait on a doomed transfer. */
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

// File upload types
export type FileUploadErrorCode = 'duplicate' | 'validation' | 'storage' | 'unknown'

export interface FileUploadResult {
  success: boolean
  path?: string
  publicUrl?: string
  error?: string
  fileName?: string
  code?: FileUploadErrorCode
}

export interface FileUploadOptions {
  institutionId: string // Institution ID for storage path
  teacherId: string
  file: File
  title?: string
  role: string // Role for storage path (e.g., 'teachers', 'students', 'institutionAdmins', 'superAdmins')
  onProgress?: (progress: number) => void
  /**
   * When set (batch uploads), storage paths in this set are skipped without upsert so one
   * collision does not overwrite another file in the same batch.
   */
  batchPathsClaimed?: Set<string>
}

// File list types
export interface FileListItem {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, string>
}

export interface FetchFilesResult {
  success: boolean
  files?: FileListItem[]
  error?: string
}

export interface FetchFilesOptions {
  limit?: number
  sortBy?: { column: 'name' | 'created_at' | 'updated_at'; order: 'asc' | 'desc' }
}
