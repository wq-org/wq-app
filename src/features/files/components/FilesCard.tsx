import { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Trash2, X } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import type { FileItem } from '../types/files.types';
import { FILE_TYPE_CONFIG } from '../types/files.types';
import { getFilePublicUrl, deleteFile, renameFile } from '@/features/upload-files/api/filesApi';
import { toast } from 'sonner';

interface FilesCardProps {
    file: FileItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileDeleted?: () => void;
}

export default function FilesCard({
    file,
    open,
    onOpenChange,
    onFileDeleted,
}: FilesCardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
    const [filename, setFilename] = useState(file.filename);

    // Reset filename when file changes
    useEffect(() => {
        setFilename(file.filename);
    }, [file.filename]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.PDF;
    const Icon = config.Icon;
    const isImage = file.type === 'Image';

    // Get image URL when drawer opens and file is an image
    useEffect(() => {
        if (isImage && file.storagePath && open) {
            const url = getFilePublicUrl(file.storagePath);
            setImageUrl(url);
        } else if (!open) {
            setImageUrl(null);
        }
    }, [isImage, file.storagePath, open]);

    const handleDelete = async () => {
        if (!file.storagePath) {
            toast.error('File path not available. Cannot delete file.');
            return;
        }

        try {
            const result = await deleteFile(file.storagePath);
            if (result.success) {
                toast.success('File deleted successfully');
                onFileDeleted?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error('An unexpected error occurred while deleting the file');
        } finally {
            setShowDeleteDialog(false);
        }
    };

    const handleFilenameChange = (value: string) => {
        setFilename(value);
    };

    const handleSaveFilename = async () => {
        if (!file.storagePath) {
            toast.error('File path not available. Cannot rename file.');
            return;
        }

        if (!filename.trim()) {
            toast.error('Filename cannot be empty');
            return;
        }

        // Get file extension from original filename
        const fileExtension = file.filename.split('.').pop() || '';
        const newFilename = filename.endsWith(`.${fileExtension}`) 
            ? filename 
            : `${filename}.${fileExtension}`;

        try {
            const result = await renameFile(file.storagePath, newFilename);
            if (result.success) {
                toast.success('Filename updated successfully');
                // Update the file object with new filename
                file.filename = newFilename;
                if (result.newPath) {
                    file.storagePath = result.newPath;
                }
                // Trigger refresh by closing and reopening or calling onFileDeleted
                onFileDeleted?.();
            } else {
                toast.error(result.error || 'Failed to rename file');
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            toast.error('An unexpected error occurred while renaming the file');
        }
    };

    const hasChanges = filename !== file.filename;

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle>File Details</DrawerTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <DrawerDescription className="sr-only">
                            View and manage file details including overview and settings
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col gap-6 p-6 overflow-y-auto">
                        {/* Tabs */}
                        <div className="flex gap-12 border-b">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
                                    activeTab === 'overview'
                                        ? 'text-black border-black font-medium'
                                        : 'text-black/40 hover:text-black/60 border-transparent'
                                }`}
                            >
                                <LayoutDashboard className={activeTab === 'overview' ? 'text-black' : 'text-black/40'} />
                                <span>Overview</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
                                    activeTab === 'settings'
                                        ? 'text-black border-black font-medium'
                                        : 'text-black/40 hover:text-black/60 border-transparent'
                                }`}
                            >
                                <Settings className={activeTab === 'settings' ? 'text-black' : 'text-black/40'} />
                                <span>Settings</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Image Preview */}
                                    {isImage && imageUrl && (
                                        <div className="w-full rounded-lg overflow-hidden border bg-gray-100">
                                            <img
                                                src={imageUrl}
                                                alt={file.filename}
                                                className="w-full h-auto max-h-[400px] object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* File Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-16 w-16 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                                                <Icon className={`h-8 w-8 ${config.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {file.filename}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {file.type} • {file.size}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div>
                                                <Label className="text-xs text-gray-500">Filename</Label>
                                                <p className="text-sm font-medium mt-1">{file.filename}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Size</Label>
                                                <p className="text-sm font-medium mt-1">{file.size}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Type</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded border ${config.bgColor} ${config.borderColor}`}>
                                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                                    </div>
                                                    <p className="text-sm font-medium">{file.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="filename-input">Filename</Label>
                                        <Input
                                            id="filename-input"
                                            value={filename}
                                            onChange={(e) => handleFilenameChange(e.target.value)}
                                            placeholder="Enter filename"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setFilename(file.filename)}
                                            disabled={!hasChanges}
                                        >
                                            Reset
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete File
                                            </Button>
                                            <Button
                                                onClick={handleSaveFilename}
                                                disabled={!hasChanges}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <ConfirmationDialog
                title="Delete File"
                description={`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                Icon={Trash2}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
        </>
    );
}

