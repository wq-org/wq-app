import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UploadedFileItem from '@/features/command-palette/components/UploadedFileItem';

interface UploadedFilesListProps {
    title?: string;
    description?: string;
    onAddMore?: () => void;
}

export default function UploadedFilesList({
    title = 'Uploaded Files',
    description = 'Manage your uploaded files',
    onAddMore,
}: UploadedFilesListProps) {
    const [files, setFiles] = useState<File[]>([]);

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
                {onAddMore && files.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddMore}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add More
                    </Button>
                )}
            </div>

            {/* Files List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <UploadedFileItem
                            key={`${file.name}-${index}`}
                            file={file}
                            onRemove={() => handleRemoveFile(index)}
                        />
                    ))}
                </div>
            )}

            {/* Hidden input for adding files */}
            <input
                type="file"
                id="add-more-files"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
        </div>
    );
}

