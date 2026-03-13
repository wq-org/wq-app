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

export const ALLOWED_FILE_TYPES: string[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
]

export type AllowedFileType =
  | (typeof ALLOWED_IMAGE_TYPES)[number]
  | (typeof ALLOWED_VIDEO_TYPES)[number]
  | (typeof ALLOWED_FILE_TYPES)[number]

// Combined array for easy use in file input accept attribute
export const ALL_ALLOWED_TYPES: string[] = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_FILE_TYPES,
]

export const MAX_VIDEO_DURATION = 60 // seconds

// File upload types
export interface FileUploadResult {
  success: boolean
  path?: string
  publicUrl?: string
  error?: string
  fileName?: string
}

export interface FileUploadOptions {
  institutionId: string // Institution ID for storage path
  teacherId: string
  file: File
  title?: string
  role: string // Role for storage path (e.g., 'teachers', 'students', 'institutionAdmins', 'superAdmins')
  onProgress?: (progress: number) => void
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
