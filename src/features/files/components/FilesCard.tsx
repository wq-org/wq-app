import { useState, useEffect, useRef } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import type { FileItem } from '../types/files.types';
import { getFileBlobUrl, deleteFile, renameFile } from '../apis/filesApi';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

interface FilesCardProps {
    file: FileItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileDeleted?: () => void;
}

function SimplePDFViewer({ pdfUrl }: { pdfUrl: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !pdfUrl) return;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        loadingTask.promise
            .then((pdf: pdfjsLib.PDFDocumentProxy) => {
                return pdf.getPage(1);
            })
            .then((page: pdfjsLib.PDFPageProxy) => {
                if (!canvasRef.current) return;
                
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                } as any);
            })
            .catch((error: Error) => {
                console.error('Error rendering PDF:', error);
            });
    }, [pdfUrl]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function FilesCard({
    file,
    open,
    onOpenChange,
    onFileDeleted,
}: FilesCardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
    const [filename, setFilename] = useState(file.filename);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileUrlRef = useRef<string | null>(null);

    const isImage = file.type === 'Image';
    const isPDF = file.type === 'PDF';

    // Get blob URL when drawer opens (downloads file and creates blob URL)
    useEffect(() => {
        if ((isImage || isPDF) && file.storagePath && open) {
            setLoading(true);
            getFileBlobUrl(file.storagePath)
                .then((url) => {
                    if (url) {
                        // Clean up previous URL if exists
                        if (fileUrlRef.current) {
                            URL.revokeObjectURL(fileUrlRef.current);
                        }
                        fileUrlRef.current = url;
                        setFileUrl(url);
                    } else {
                        toast.error('Failed to load file');
                    }
                })
                .catch((error) => {
                    console.error('Error getting file blob URL:', error);
                    toast.error('Failed to load file');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (!open) {
            // Clean up blob URL when drawer closes
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
                setFileUrl(null);
            }
        }

        // Cleanup function - revoke URL when dependencies change or component unmounts
        return () => {
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
            }
        };
    }, [isImage, isPDF, file.storagePath, open]);

    // Reset filename when file changes
    useEffect(() => {
        setFilename(file.filename);
    }, [file.filename]);

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
            <Drawer  open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[100vh]">
                    <div className="flex flex-col h-full">
                        {/* Header with Title on top left */}
                        <DrawerHeader className="flex-shrink-0">
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

                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Tabs */}
                            <div className="flex gap-12 border-b px-6 pt-4 flex-shrink-0">
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
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'overview' && (
                                    <div className="flex flex-col space-y-6">
                                        {/* Image/PDF Preview - 16:9 aspect ratio */}
                                        {(isImage || isPDF) && (
                                            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                                                {loading ? (
                                                    <p className="text-gray-500">Loading...</p>
                                                ) : fileUrl ? (
                                                    isImage ? (
                                                        <img
                                                            src={fileUrl}
                                                            alt={file.filename}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : isPDF ? (
                                                        <SimplePDFViewer pdfUrl={fileUrl} />
                                                    ) : null
                                                ) : (
                                                    <p className="text-gray-500">Failed to load file</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Details Section */}
                                        <div className="space-y-4">
                                            <Separator />
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-gray-500">Filename</Label>
                                                    <p className="text-sm font-medium">{file.filename}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-gray-500">Size</Label>
                                                    <p className="text-sm font-medium">{file.size}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-gray-500">Type</Label>
                                                    <p className="text-sm font-medium">{file.type}</p>
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
