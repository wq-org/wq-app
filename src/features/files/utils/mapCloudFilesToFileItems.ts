import type { CloudFileItem, CloudFileKind, FileItem } from '../types/files.types'

function cloudKindToFileType(kind: CloudFileKind): FileItem['type'] {
  switch (kind) {
    case 'image':
      return 'Image'
    case 'pdf':
      return 'PDF'
    case 'video':
      return 'Video'
    case 'file':
    default:
      return 'PDF'
  }
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes === 0) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function hashPathToId(path: string): number {
  let h = 0
  for (let i = 0; i < path.length; i += 1) {
    h = Math.imul(31, h) + path.charCodeAt(i)
    h |= 0
  }
  const n = Math.abs(h)
  return n === 0 ? 1 : n
}

export function mapCloudFileToFileItem(item: CloudFileItem): FileItem {
  return {
    id: hashPathToId(item.path),
    filename: item.name,
    description: item.mimeType ?? '',
    type: cloudKindToFileType(item.kind),
    size: formatFileSize(item.size),
    storagePath: item.path,
  }
}

export function mapCloudFilesToFileItems(items: readonly CloudFileItem[]): FileItem[] {
  return items.map(mapCloudFileToFileItem)
}
