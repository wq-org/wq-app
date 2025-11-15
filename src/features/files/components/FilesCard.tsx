import {useState, useEffect, useRef} from 'react';
import {LayoutDashboard, Settings, Trash2, X} from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {ConfirmationDialog} from '@/components/common/ConfirmationDialog';
import FailedToLoad from '@/components/common/FailedToLoad';
import type {FileItem} from '../types/files.types';
import {getFileBlobUrl, deleteFile, renameFile} from '../apis/filesApi';
import {toast} from 'sonner';
import Spinner from '@/components/ui/spinner';

interface FilesCardProps {
    file: FileItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileDeleted?: () => void;
}

interface SimplePDFViewerProps {
    pdfUrl: string;
    fileName?: string;
}

function SimplePDFViewer({pdfUrl, fileName = 'document.pdf'}: SimplePDFViewerProps) {
    return (
        <div className="w-full h-screen">
            <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={fileName}
            />
        </div>
    );
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
            console.log('Getting file blob URL for:', file.storagePath);
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
            <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
                <DrawerContent
                    className="h-[100vh] !w-[60vw] !max-w-2xl sm:!max-w-2xl"
                >
                    <div className="flex flex-col h-full w-full">
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
                            <div className="flex border-b px-6 pt-4 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab('overview')}
                                    className={`text-xl border-b-2 rounded-none h-auto px-0 pb-2 gap-2 ${activeTab === 'overview'
                                            ? 'text-black border-black font-medium'
                                            : 'text-black/40 hover:text-black/60 border-transparent'
                                        }`}
                                >
                                    <LayoutDashboard className={activeTab === 'overview' ? 'text-black' : 'text-black/40'} />
                                    <span>Overview</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab('settings')}
                                    className={`text-xl border-b-2 rounded-none h-auto px-0 pb-2 gap-2 ${activeTab === 'settings'
                                            ? 'text-black border-black font-medium'
                                            : 'text-black/40 hover:text-black/60 border-transparent'
                                        }`}
                                >
                                    <Settings className={activeTab === 'settings' ? 'text-black' : 'text-black/40'} />
                                    <span>Settings</span>
                                </Button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-6 pb-12">
                                {activeTab === 'overview' && (
                                    <div className="flex flex-col space-y-6">
                                        {isImage && (
                                            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                                                {loading ? (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Spinner variant="gray" size="xl" speed={1750} />
                                                    </div>
                                                ) : fileUrl ? (
                                                    <img
                                                        src={fileUrl}
                                                        alt={file.filename}
                                                        className="w-full h-full object-cover "
                                                    />
                                                ) : (
                                                    <FailedToLoad />
                                                )}
                                            </div>
                                        )}
                                        {isPDF && (
                                            <div className="w-full aspect-[9/16] rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                                                {fileUrl ? (
                                                    <SimplePDFViewer pdfUrl={fileUrl} fileName={file.filename} />
                                                ) : loading ? (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Spinner variant="gray" size="xl" speed={1750} />
                                                    </div>
                                                ) : (
                                                    <FailedToLoad />
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
                                                    <Trash2 className="h-4 w-4" />
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
