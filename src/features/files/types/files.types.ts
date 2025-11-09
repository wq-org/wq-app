export interface FileItem {
    id: number;
    filename: string;
    description: string;
    type: 'Word' | 'PPT' | 'Exl' | 'PDF' | 'Image' | 'Video';
    size: string;
}

