import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/common/Container';
import FileDropzone from '../components/FileDropzone';
import FileStepperForm from '../components/FileStepperForm';
import { useFileValidation } from '../hooks/useFileValidation';
import type { UploadedFile } from '../types/upload.types';
import { toast } from 'sonner';

export default function UploadFilesDialog() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showStepper, setShowStepper] = useState(false);
    const { validateFiles } = useFileValidation();

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
                    description: '',
                    preview,
                };
            })
        );

        setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
        setShowStepper(true);
    }, [validateFiles]);

    const handleFileUpdate = useCallback((id: string, updates: { title: string; description: string }) => {
        setUploadedFiles((prev) =>
            prev.map((file) =>
                file.id === id ? { ...file, ...updates } : file
            )
        );
    }, []);

    const handleComplete = useCallback(() => {
        // Here you would typically upload files to your backend
        toast.success(`Successfully prepared ${uploadedFiles.length} file(s) for upload`);
        console.log('Files ready for upload:', uploadedFiles);
        
        // Reset state
        setUploadedFiles([]);
        setShowStepper(false);
    }, [uploadedFiles]);

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
                        <FileStepperForm
                            files={uploadedFiles}
                            onFileUpdate={handleFileUpdate}
                            onComplete={handleComplete}
                            onBack={handleBack}
                        />
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

