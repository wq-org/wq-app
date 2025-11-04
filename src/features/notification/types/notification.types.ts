export type NotificationType = 'join' | 'mention' | 'request' | 'upload' | 'edit' | 'general';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    avatar?: {
        src?: string;
        fallback: string;
        color?: string;
    };
    metadata?: {
        category?: string;
        fileName?: string;
        fileSize?: string;
        fileIcon?: string;
    };
    actions?: {
        accept?: () => void;
        decline?: () => void;
    };
}

export interface NotificationStats {
    all: number;
    following: number;
    archive: number;
}

