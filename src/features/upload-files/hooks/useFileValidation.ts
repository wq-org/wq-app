import { useCallback } from 'react';
import { toast } from 'sonner';
import type { FileValidationResult } from '../types/upload.types';
import { MAX_VIDEO_DURATION, ALL_ALLOWED_TYPES } from '../types/upload.types';

export function useFileValidation() {
    const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
        // Check file type
        if (!ALL_ALLOWED_TYPES.includes(file.type)) {
            return {
                isValid: false,
                error: `File type ${file.type} is not allowed. Allowed types: images (JPEG, JPG, PNG), PDF, MP4 videos, Word (docx), PowerPoint (pptx/ppt)`,
            };
        }

        // Check if webp (not allowed)
        if (file.type === 'image/webp') {
            const error = 'WebP images are not allowed';
            toast.error('Image Validation Failed', {
                description: error,
            });
            return {
                isValid: false,
                error,
            };
        }


        // Validate video duration for MP4 files
        if (file.type === 'video/mp4') {
            try {
                const video = document.createElement('video');
                video.preload = 'metadata';
                const objectUrl = URL.createObjectURL(file);
                
                const duration = await new Promise<number>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        URL.revokeObjectURL(objectUrl);
                        reject(new Error('Video metadata loading timeout'));
                    }, 5000);

                    video.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        URL.revokeObjectURL(objectUrl);
                        resolve(video.duration);
                    };
                    video.onerror = () => {
                        clearTimeout(timeout);
                        URL.revokeObjectURL(objectUrl);
                        reject(new Error('Failed to load video metadata'));
                    };
                    video.src = objectUrl;
                });

                if (duration > MAX_VIDEO_DURATION) {
                    const errorMessage = `Video duration (${Math.ceil(duration)}s) exceeds maximum allowed duration of ${MAX_VIDEO_DURATION} seconds`;
                    toast.error('Video Validation Failed', {
                        description: errorMessage,
                    });
                    return {
                        isValid: false,
                        error: errorMessage,
                    };
                }
            } catch (error) {
                // Reject video if we can't validate duration
                const errorMessage = 'Unable to validate video duration. Please ensure the video file is valid and try again.';
                toast.error('Video Validation Failed', {
                    description: errorMessage,
                });
                console.error('Video duration validation failed:', error);
                return {
                    isValid: false,
                    error: errorMessage,
                };
            }
        }

        return { isValid: true };
    }, []);

    const validateFiles = useCallback(async (files: File[]): Promise<FileValidationResult[]> => {
        const results = await Promise.all(files.map(validateFile));
        return results;
    }, [validateFile]);

    return {
        validateFile,
        validateFiles,
    };
}

