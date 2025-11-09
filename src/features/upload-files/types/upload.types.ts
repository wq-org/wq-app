export interface UploadedFile {
    id: string;
    file: File;
    title: string;
    description: string;
    preview?: string;
}

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export const ALLOWED_IMAGE_TYPES: string[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
];

export const ALLOWED_VIDEO_TYPES: string[] = [
    'video/mp4',
];

export const ALLOWED_FILE_TYPES: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
];

export type AllowedFileType = 
    | typeof ALLOWED_IMAGE_TYPES[number]
    | typeof ALLOWED_VIDEO_TYPES[number]
    | typeof ALLOWED_FILE_TYPES[number];

// Combined array for easy use in file input accept attribute
export const ALL_ALLOWED_TYPES: string[] = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_FILE_TYPES,
];

export const MAX_VIDEO_DURATION = 60; // seconds

// File type configuration for styling
export interface FileTypeConfig {
    color: string;
    bgColor: string;
    borderColor: string;
}

// File extension to type mapping
export const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
    // Documents
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
    // PDFs
    PDF: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
    },
    // Spreadsheets
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
    // Presentations
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
    // Images
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
    // Videos
    MP4: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
    },
};

// Default file type config
export const DEFAULT_FILE_CONFIG: FileTypeConfig = {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
};

// Function to get file type configuration
export function getFileTypeConfig(fileName: string): FileTypeConfig {
    const extension = fileName.split('.').pop()?.toUpperCase() || '';
    return FILE_TYPE_CONFIG[extension] || DEFAULT_FILE_CONFIG;
}

