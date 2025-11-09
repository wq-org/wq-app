import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/common/Container';
import FileDropzone from '../components/FileDropzone';
import FileStepperForm from '../components/FileStepperForm';
import { useFileValidation } from '../hooks/useFileValidation';
import { uploadFilesWithMetadata } from '../api/filesApi';
import { useUser } from '@/contexts/UserContext';
import type { UploadedFile } from '../types/upload.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function UploadFilesDialog() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showStepper, setShowStepper] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { validateFiles } = useFileValidation();
    const { getUserId, getRole } = useUser();

    const generateFileId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const createPreview = (file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = () => resolve(undefined);
                reader.readAsDataURL(file);
            } else {
                resolve(undefined);
            }
        });
    };

    const handleFilesSelected = useCallback(async (files: File[]) => {
        // Prevent double calls by checking if we're already processing
        if (showStepper || isUploading) {
            return;
        }

        // Validate files
        const validationResults = await validateFiles(files);
        
        // Filter out invalid files and show errors
        const validFiles: File[] = [];
        validationResults.forEach((result, index) => {
            if (result.isValid) {
                validFiles.push(files[index]);
            } else {
                toast.error(`File "${files[index].name}": ${result.error}`);
            }
        });

        if (validFiles.length === 0) {
            return;
        }

        // Create uploaded file objects with previews
        const newUploadedFiles: UploadedFile[] = await Promise.all(
            validFiles.map(async (file) => {
                const preview = await createPreview(file);
                return {
                    id: generateFileId(),
                    file,
                    title: file.name.split('.')[0],
                    preview,
                };
            })
        );

        setUploadedFiles(newUploadedFiles); // Replace instead of append to prevent duplicates
        setShowStepper(true);
    }, [validateFiles, showStepper, isUploading]);

    const handleFileUpdate = useCallback((id: string, updates: { title: string }) => {
        setUploadedFiles((prev) =>
            prev.map((file) =>
                file.id === id ? { ...file, ...updates } : file
            )
        );
    }, []);

    const handleComplete = useCallback(async () => {
        const teacherId = getUserId();
        const role = getRole();
        
        if (!teacherId) {
            toast.error('User ID not found. Please log in again.');
            console.error('Upload failed: No teacher ID available');
            return;
        }

        if (!role) {
            toast.error('User role not found. Please log in again.');
            console.error('Upload failed: No user role available');
            return;
        }

        if (uploadedFiles.length === 0) {
            toast.error('No files to upload');
            console.error('Upload failed: No files available');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);


        try {
            const results = await uploadFilesWithMetadata(
                uploadedFiles,
                teacherId,
                role,
                (progress) => {
                    setUploadProgress(progress);
                    console.log(`Upload progress: ${progress.toFixed(2)}%`);
                }
            );

            // Log all results
            console.log('Upload results:', {
                totalFiles: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results: results.map((result, index) => ({
                    index: index + 1,
                    fileName: uploadedFiles[index].file.name,
                    success: result.success,
                    path: result.path,
                    publicUrl: result.publicUrl,
                    error: result.error,
                })),
            });

            // Check results
            const successCount = results.filter(r => r.success).length;
            const failedCount = results.filter(r => !r.success).length;

            if (successCount > 0) {
                toast.success(
                    `Successfully uploaded ${successCount} file(s)${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
                );
            }

            if (failedCount > 0) {
                const failedFiles = results
                    .map((r, i) => r.success ? null : uploadedFiles[i].file.name)
                    .filter(Boolean);
                toast.error(
                    `Failed to upload ${failedCount} file(s): ${failedFiles.join(', ')}`
                );
            }

            // Reset state only if all uploads succeeded
            if (failedCount === 0) {
                setUploadedFiles([]);
                setShowStepper(false);
            }
        } catch (error) {
            console.error('Unexpected error during upload:', error);
            toast.error('An unexpected error occurred during upload');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [uploadedFiles, getUserId, getRole]);

    const handleBack = useCallback(() => {
        setShowStepper(false);
    }, []);

    return (
        <Container className="px-0 ">
            <Card className="w-full shadow-none border-0 px-0 py-0">
                <CardContent className="p-0 space-y-6">
                    {!showStepper ? (
                        <FileDropzone
                            onFilesSelected={handleFilesSelected}
                            disabled={false}
                        />
                    ) : (
                        <>
                            {isUploading && (
                                <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-2xl border">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-900">
                                            Uploading files...
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {uploadProgress.toFixed(0)}% complete
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!isUploading && (
                                <FileStepperForm
                                    files={uploadedFiles}
                                    onFileUpdate={handleFileUpdate}
                                    onComplete={handleComplete}
                                    onBack={handleBack}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

