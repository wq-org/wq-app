import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronsLeftRight, LayoutDashboard, Settings, X } from 'lucide-react'
import { Text } from '@/components/ui/text'
import SelectTabs from '@/components/shared/tabs/SelectTabs'
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
import { SimplePDFViewer, SimpleVideoPlayer } from '@/components/shared'
import FileDropzone from '@/components/shared/upload-files/components/FileDropzone'
import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { useUser } from '@/contexts/user'
import type { FileItem } from '../types/files.types'
import { getFileBlobUrl, deleteFile, renameFile } from '../api/filesApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import Spinner from '@/components/ui/spinner'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
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
  const [expanded, setExpanded] = useState(false)
  const [filename, setFilename] = useState(file.filename)
  const [deleteInProgress, setDeleteInProgress] = useState(false)
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
            toast.error(t('toasts.loadFailed'))
          }
        })
        .catch((error) => {
          console.error('Error getting file blob URL:', error)
          toast.error(t('toasts.loadFailed'))
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
  }, [isImage, isPDF, isVideo, file.storagePath, open, t])

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
      console.log('role filesCard.tsx :>> ', role);
      let normalizedRole = role.toLowerCase().trim()
      if (normalizedRole === 'teachers') normalizedRole = 'teacher'
      if (normalizedRole === 'students') normalizedRole = 'student'
      if (normalizedRole === 'admins' || normalizedRole === 'institution_admin')
        normalizedRole = 'institution_admin'
      if (normalizedRole === 'superadmins') normalizedRole = 'super_admin'

      return {
        role: normalizedRole,
        userId,
      }
    }

    return null
  }, [file.storagePath, getUserId, getRole])

  const handleDelete = async () => {
    if (!file.storagePath) {
      toast.error(t('toasts.filePathMissingDelete'))
      return
    }

    setDeleteInProgress(true)
    try {
      const result = await deleteFile(file.storagePath)
      if (result.success) {
        toast.success(t('toasts.deleteSuccess'))
        onFileDeleted?.()
        onOpenChange(false)
      } else {
        toast.error(result.error || t('toasts.deleteFailed'))
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error(t('toasts.deleteUnexpected'))
    } finally {
      setDeleteInProgress(false)
    }
  }

  const handleFilenameChange = (value: string) => {
    setFilename(value)
  }

  const hasChanges = filename !== file.filename || newFile !== null

  const handleSaveChanges = async () => {
    if (!file.storagePath) {
      toast.error(t('toasts.filePathMissingSave'))
      return
    }

    const pathInfo = extractPathInfo()
    if (!pathInfo) {
      toast.error(t('toasts.fileLocationUnknown'))
      return
    }

    try {
      let newStoragePath = file.storagePath
      let newFilename = file.filename

      // Handle filename change
      if (filename !== file.filename) {
        if (!filename.trim()) {
          toast.error(t('toasts.filenameEmpty'))
          return
        }

        // Get file extension from original filename
        const fileExtension = file.filename.split('.').pop() || ''
        newFilename = filename.endsWith(`.${fileExtension}`)
          ? filename
          : `${filename}.${fileExtension}`

        const renameResult = await renameFile(file.storagePath, newFilename)
        if (!renameResult.success) {
          toast.error(renameResult.error || t('toasts.renameFailed'))
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
          institutionId: "",
          teacherId: pathInfo.userId,
          file: newFile,
          title: newFilename.split('.')[0],
          role: pathInfo.role,
        })

        if (!uploadResult.success) {
          toast.error(uploadResult.error || t('toasts.uploadFailed'))
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

      toast.success(t('toasts.saveSuccess'))
      onFileDeleted?.() // Trigger refresh
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error(t('toasts.saveUnexpected'))
    }
  }

  return (
    <>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={onOpenChange}
      >
        <DrawerContent
          className={cn(
            'h-screen data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-right-52 data-[state=closed]:slide-out-to-right-52 transition-[width] duration-200',
            expanded ? 'w-screen! max-w-[100vw]!' : 'w-[60vw]! max-w-2xl! sm:max-w-2xl!',
          )}
        >
          <div className="flex flex-col h-full w-full">
            <DrawerHeader className="shrink-0">
              <div className="flex items-center justify-between gap-2">
                <DrawerTitle>{t('drawer.title')}</DrawerTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded((e) => !e)}
                    aria-label={expanded ? t('drawer.collapse') : t('drawer.expand')}
                  >
                    <ChevronsLeftRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DrawerDescription className="sr-only">{t('drawer.description')}</DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="border-b px-6 pt-4 shrink-0">
                <SelectTabs
                  variant="compact"
                  tabs={[
                    { id: 'overview', icon: LayoutDashboard, title: t('drawer.tabs.overview') },
                    { id: 'settings', icon: Settings, title: t('drawer.tabs.settings') },
                  ]}
                  activeTabId={activeTab}
                  onTabChange={(id) => setActiveTab(id as 'overview' | 'settings')}
                />
              </div>

              {/* Tab Content */}
              <div
                key={activeTab}
                className="flex-1 overflow-y-auto p-6 pb-12 animate-in fade-in-0 slide-in-from-bottom-3"
              >
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
                      <div className="w-full aspect-9/16 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
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
                          <Label className="text-xs text-gray-500">
                            {t('drawer.overview.filename')}
                          </Label>
                          <Text
                            as="p"
                            variant="body"
                            className="text-sm font-medium"
                          >
                            {file.filename}
                          </Text>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-500">
                            {t('drawer.overview.size')}
                          </Label>
                          <Text
                            as="p"
                            variant="body"
                            className="text-sm font-medium"
                          >
                            {file.size}
                          </Text>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-500">
                            {t('drawer.overview.type')}
                          </Label>
                          <Text
                            as="p"
                            variant="body"
                            className="text-sm font-medium"
                          >
                            {file.type}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="filename-input">{t('drawer.settings.filename')}</Label>
                      <Input
                        id="filename-input"
                        value={filename}
                        onChange={(e) => handleFilenameChange(e.target.value)}
                        placeholder={t('editor.filenamePlaceholder')}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('drawer.settings.replaceFile')}</Label>
                      {newFilePreview ? (
                        <div className="space-y-2">
                          <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                            <img
                              src={newFilePreview}
                              alt={t('drawer.settings.newFilePreviewAlt')}
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
                            className="w-full active:animate-in active:zoom-in-95"
                          >
                            {t('editor.removeNewFile')}
                          </Button>
                        </div>
                      ) : newFile ? (
                        <div className="space-y-2">
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <Text
                              as="p"
                              variant="body"
                              className="text-sm font-medium"
                            >
                              {newFile.name}
                            </Text>
                            <Text
                              as="p"
                              variant="body"
                              className="text-xs text-gray-500"
                            >
                              {(newFile.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewFile(null)
                              setNewFilePreview(null)
                            }}
                            className="w-full active:animate-in active:zoom-in-95"
                          >
                            {t('editor.removeNewFile')}
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
                        className="active:animate-in active:zoom-in-95"
                        disabled={!hasChanges}
                      >
                        {t('editor.reset')}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveChanges}
                          disabled={!hasChanges}
                          className="active:animate-in active:zoom-in-95"
                        >
                          {t('editor.saveChanges')}
                        </Button>
                        <HoldToDeleteButton
                          onDelete={handleDelete}
                          loading={deleteInProgress}
                          className="active:animate-in active:zoom-in-95"
                        >
                          {t('deleteDialog.action')}
                        </HoldToDeleteButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
