import {
    File,
    FileText,
    FileSpreadsheet,
    FileBarChart2,
    Image as ImageIcon,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FileItem {
    id: number;
    filename: string;
    description: string;
    type: 'Word' | 'PPT' | 'Exl' | 'PDF' | 'Image' | 'Video';
    size: string;
    storagePath?: string; // Full storage path for API operations (e.g., "teachers/{user_id}/filename.ext")
}

export interface FileTypeConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    Icon: LucideIcon;
}

export const FILE_TYPE_CONFIG: Record<FileItem['type'], FileTypeConfig> = {
    Word: {
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        Icon: FileText,
    },
    PPT: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        Icon: FileBarChart2,
    },
    Exl: {
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        Icon: FileSpreadsheet,
    },
    PDF: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        Icon: File,
    },
    Image: {
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        Icon: ImageIcon,
    },
    Video: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        Icon: Video,
    },
};

