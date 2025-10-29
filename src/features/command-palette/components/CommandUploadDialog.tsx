import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import Container from '@/components/common/Container';
import UploadedFileItem from './UploadedFileItem';

export default function CommandUploadDialog() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Container className="px-0">
            <Card className="w-full shadow-none border-0 px-0 py-0">
                <CardContent className="p-0 space-y-6">
                    {/* Header with Title and Description */}
                    {uploadedFiles.length > 0 && (
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Uploaded Files
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {uploadedFiles.length}{' '}
                                        {uploadedFiles.length === 1
                                            ? 'file'
                                            : 'files'}{' '}
                                        uploaded
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <UploadedFileItem
                                    key={`${file.name}-${index}`}
                                    file={file}
                                    onRemove={() => handleRemoveFile(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        className={`
                            relative flex flex-col items-center justify-center
                            min-h-[200px] rounded-2xl border-2 border-dashed
                            transition-colors cursor-pointer py-8
                            ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileInput}
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            multiple
                        />
                        <div className="flex flex-col items-center gap-4 pointer-events-none">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 bg-white pointer-events-none"
                            >
                                <Upload className="w-5 h-5" />
                                {uploadedFiles.length > 0
                                    ? 'Add More'
                                    : 'Upload'}
                            </Button>
                            <div className="text-center space-y-1">
                                <p className="text-gray-600 text-sm">
                                    Choose images or drag & drop it here.
                                </p>
                                <p className="text-gray-400 text-xs">
                                    JPG, JPEG, PNG and WEBP. Max 20 MB.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Container>
    );
}
