import {
  File,
  FileText,
  FileSpreadsheet,
  FileBarChart2,
  Image as ImageIcon,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FileItem {
  id: number
  filename: string
  description: string
  type: 'Word' | 'PPT' | 'Exl' | 'PDF' | 'Image' | 'Video'
  size: string
  storagePath?: string // Full storage path for API operations (e.g., "teachers/{user_id}/filename.ext")
}

export interface FileTypeConfig {
  color: string
  bgColor: string
  borderColor: string
  Icon: LucideIcon
}

export const FILE_TYPE_CONFIG: Record<FileItem['type'], FileTypeConfig> = {
  Word: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: FileText,
  },
  PPT: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: FileBarChart2,
  },
  Exl: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: FileSpreadsheet,
  },
  PDF: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: File,
  },
  Image: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: ImageIcon,
  },
  Video: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    Icon: Video,
  },
}
