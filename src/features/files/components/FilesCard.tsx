import { useState, useEffect, useRef, useCallback } from 'react'
import { LayoutDashboard, Settings, Trash2, X } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ConfirmationDialog, SimplePDFViewer, SimpleVideoPlayer } from '@/components/shared'
import FileDropzone from '@/features/upload-files/components/FileDropzone'
import { uploadFile } from '@/features/upload-files/api/uploadFilesApi'
import { useUser } from '@/contexts/user'
import type { FileItem } from '../types/files.types'
import { getFileBlobUrl, deleteFile, renameFile } from '../api/filesApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/spinner'
import { FailedToLoad } from '@/components'

interface FilesCardProps {
  file: FileItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileDeleted?: () => void
}

export default function FilesCard({ file, open, onOpenChange, onFileDeleted }: FilesCardProps) {
  const { getUserId, getRole } = useUser()
  const { t } = useTranslation('features.files')
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')
  const [filename, setFilename] = useState(file.filename)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null)
  const fileUrlRef = useRef<string | null>(null)

  const isImage = file.type === 'Image'
  const isPDF = file.type === 'PDF'
  const isVideo = file.type === 'Video'

  // Get blob URL when drawer opens (downloads file and creates blob URL)
  useEffect(() => {
    if ((isImage || isPDF || isVideo) && file.storagePath && open) {
      setLoading(true)
      console.log('Getting file blob URL for:', file.storagePath)
      getFileBlobUrl(file.storagePath)
        .then((url) => {
          if (url) {
            // Clean up previous URL if exists
            if (fileUrlRef.current) {
              URL.revokeObjectURL(fileUrlRef.current)
            }
            fileUrlRef.current = url
            setFileUrl(url)
          } else {
            toast.error('Failed to load file')
          }
        })
        .catch((error) => {
          console.error('Error getting file blob URL:', error)
          toast.error('Failed to load file')
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (!open) {
      // Clean up blob URL when drawer closes
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current)
        fileUrlRef.current = null
        setFileUrl(null)
      }
    }

    // Cleanup function - revoke URL when dependencies change or component unmounts
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current)
        fileUrlRef.current = null
      }
    }
  }, [isImage, isPDF, isVideo, file.storagePath, open])

  // Reset filename when file changes
  useEffect(() => {
    setFilename(file.filename)
    setNewFile(null)
    setNewFilePreview(null)
  }, [file.filename])

  // Handle new file selection
  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length === 0) return

    const selectedFile = files[0]
    setNewFile(selectedFile)

    // Create preview for images only
    if (selectedFile.type.startsWith('image/') && selectedFile.type !== 'image/webp') {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewFilePreview(reader.result as string)
      }
      reader.onerror = () => {
        setNewFilePreview(null)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setNewFilePreview(null)
    }
  }, [])

  // Extract role and userId from storage path
  const extractPathInfo = useCallback(() => {
    if (!file.storagePath) return null

    const pathParts = file.storagePath.split('/')
    if (pathParts.length >= 2) {
      return {
        role: pathParts[0],
        userId: pathParts[1],
      }
    }

    // Fallback to useUser if path parsing fails
    const userId = getUserId()
    const role = getRole()
    if (userId && role) {
      // Normalize role to singular
      let normalizedRole = role.toLowerCase().trim()
      if (normalizedRole === 'teachers') normalizedRole = 'teacher'
      if (normalizedRole === 'students') normalizedRole = 'student'
      if (normalizedRole === 'admins' || normalizedRole === 'institutionadmins')
        normalizedRole = 'institutionAdmin'
      if (normalizedRole === 'superadmins') normalizedRole = 'superAdmin'

      return {
        role: normalizedRole,
        userId,
      }
    }

    return null
  }, [file.storagePath, getUserId, getRole])

  const handleDelete = async () => {
    if (!file.storagePath) {
      toast.error('File path not available. Cannot delete file.')
      return
    }

    try {
      const result = await deleteFile(file.storagePath)
      if (result.success) {
        toast.success('File deleted successfully')
        onFileDeleted?.()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('An unexpected error occurred while deleting the file')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleFilenameChange = (value: string) => {
    setFilename(value)
  }

  const hasChanges = filename !== file.filename || newFile !== null

  const handleSaveChanges = async () => {
    if (!file.storagePath) {
      toast.error('File path not available. Cannot save changes.')
      return
    }

    const pathInfo = extractPathInfo()
    if (!pathInfo) {
      toast.error('Unable to determine file location. Please try again.')
      return
    }

    try {
      let newStoragePath = file.storagePath
      let newFilename = file.filename

      // Handle filename change
      if (filename !== file.filename) {
        if (!filename.trim()) {
          toast.error('Filename cannot be empty')
          return
        }

        // Get file extension from original filename
        const fileExtension = file.filename.split('.').pop() || ''
        newFilename = filename.endsWith(`.${fileExtension}`)
          ? filename
          : `${filename}.${fileExtension}`

        const renameResult = await renameFile(file.storagePath, newFilename)
        if (!renameResult.success) {
          toast.error(renameResult.error || 'Failed to rename file')
          return
        }

        if (renameResult.newPath) {
          newStoragePath = renameResult.newPath
        }
      }

      // Handle file replacement
      if (newFile) {
        // Delete the file at the target path (either old path or new path after rename)
        // This ensures we can upload the new file without conflicts
        const targetPath = filename !== file.filename ? newStoragePath : file.storagePath
        const deleteResult = await deleteFile(targetPath)
        if (!deleteResult.success) {
          console.warn('Failed to delete old file before upload:', deleteResult.error)
          // Continue anyway - upload might still work if file doesn't exist
        }

        // Upload new file with the target filename
        const uploadResult = await uploadFile({
          teacherId: pathInfo.userId,
          file: newFile,
          title: newFilename.split('.')[0],
          role: pathInfo.role,
        })

        if (!uploadResult.success) {
          toast.error(uploadResult.error || 'Failed to upload new file')
          return
        }

        if (uploadResult.path) {
          newStoragePath = uploadResult.path
        }
      }

      // Update file object
      file.filename = newFilename
      file.storagePath = newStoragePath

      // Clear new file state
      setNewFile(null)
      setNewFilePreview(null)

      toast.success('Changes saved successfully')
      onFileDeleted?.() // Trigger refresh
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('An unexpected error occurred while saving changes')
    }
  }

  return (
    <>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={onOpenChange}
      >
        <DrawerContent className="h-[100vh] !w-[60vw] !max-w-2xl sm:!max-w-2xl">
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
                  className={`text-xl border-b-2 rounded-none h-auto px-0 pb-2 gap-2 ${
                    activeTab === 'overview'
                      ? 'text-black border-black font-medium'
                      : 'text-black/40 hover:text-black/60 border-transparent'
                  }`}
                >
                  <LayoutDashboard
                    className={activeTab === 'overview' ? 'text-black' : 'text-black/40'}
                  />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('settings')}
                  className={`text-xl border-b-2 rounded-none h-auto px-0 pb-2 gap-2 ${
                    activeTab === 'settings'
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
                            <Spinner
                              variant="gray"
                              size="xl"
                              speed={1750}
                            />
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
                          <SimplePDFViewer
                            pdfUrl={fileUrl}
                            fileName={file.filename}
                          />
                        ) : loading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Spinner
                              variant="gray"
                              size="xl"
                              speed={1750}
                            />
                          </div>
                        ) : (
                          <FailedToLoad />
                        )}
                      </div>
                    )}
                    {isVideo && (
                      <div className="w-full rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center p-4">
                        {fileUrl ? (
                          <SimpleVideoPlayer
                            videoUrl={fileUrl}
                            fileName={file.filename}
                          />
                        ) : loading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Spinner
                              variant="gray"
                              size="xl"
                              speed={1750}
                            />
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
                        placeholder={t('editor.filenamePlaceholder')}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Replace File</Label>
                      {newFilePreview ? (
                        <div className="space-y-2">
                          <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                            <img
                              src={newFilePreview}
                              alt="New file preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewFile(null)
                              setNewFilePreview(null)
                            }}
                            className="w-full"
                          >
                            {t('editor.removeNewFile', { defaultValue: 'Remove New File' })}
                          </Button>
                        </div>
                      ) : newFile ? (
                        <div className="space-y-2">
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <p className="text-sm font-medium">{newFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(newFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewFile(null)
                              setNewFilePreview(null)
                            }}
                            className="w-full"
                          >
                            {t('editor.removeNewFile', { defaultValue: 'Remove New File' })}
                          </Button>
                        </div>
                      ) : (
                        <FileDropzone
                          onFilesSelected={handleFileSelected}
                          disabled={false}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilename(file.filename)
                          setNewFile(null)
                          setNewFilePreview(null)
                        }}
                        disabled={!hasChanges}
                      >
                        {t('editor.reset', { defaultValue: 'Reset' })}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('deleteDialog.action', { defaultValue: 'Delete File' })}
                        </Button>
                        <Button
                          onClick={handleSaveChanges}
                          disabled={!hasChanges}
                        >
                          {t('editor.saveChanges', { defaultValue: 'Save Changes' })}
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
        title={t('deleteDialog.title')}
        description={t('deleteDialog.description', {
          filename: file.filename,
        })}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        Icon={Trash2}
        confirmText={t('deleteDialog.confirm')}
        cancelText={t('deleteDialog.cancel')}
        confirmVariant="destructive"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  )
}
