export type FileTypeStyle = {
  color: string
  bgColor: string
  borderColor: string
}

export const FILE_TYPE_STYLE_BY_EXTENSION: Readonly<Record<string, FileTypeStyle>> = {
  DOC: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  DOCX: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  TXT: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  PDF: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  XLS: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  XLSX: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  CSV: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  PPT: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  PPTX: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  JPEG: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  JPG: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  PNG: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  MP4: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
} as const

export const DEFAULT_FILE_TYPE_STYLE: FileTypeStyle = {
  color: 'text-gray-500',
  bgColor: 'bg-gray-500/10',
  borderColor: 'border-gray-500/20',
}

export function getFileTypeStyle(fileName: string): FileTypeStyle {
  const extension = fileName.split('.').pop()?.toUpperCase() || ''
  return FILE_TYPE_STYLE_BY_EXTENSION[extension] ?? DEFAULT_FILE_TYPE_STYLE
}
