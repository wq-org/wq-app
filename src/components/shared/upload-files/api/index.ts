export {
  uploadFile,
  uploadFiles,
  uploadFilesWithMetadata,
  deleteFile,
  getFilePublicUrl,
  fetchFilesByRole,
} from './uploadFilesApi'

// Re-export types from upload.types.ts
export type {
  FileUploadResult,
  FileUploadOptions,
  FileListItem,
  FetchFilesResult,
  FetchFilesOptions,
} from '../types/upload.types'
