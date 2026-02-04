import { useState, useEffect } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { toast } from 'sonner'
import type { SettingsDrawerProps } from '../types/game-studio.types'

export default function SettingsDrawer({
  open,
  onOpenChange,
  title: initialTitle = '',
  description: initialDescription = '',
  version = 1,
  rollbackVersions = [],
  onSave,
  onRollback,
  onDelete,
}: SettingsDrawerProps) {
  const [localTitle, setLocalTitle] = useState(initialTitle)
  const [localDescription, setLocalDescription] = useState(initialDescription)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when props change (e.g., when drawer opens with new data)
  useEffect(() => {
    if (open) {
      setLocalTitle(initialTitle)
      setLocalDescription(initialDescription)
    }
  }, [open, initialTitle, initialDescription])

  const handleClose = () => onOpenChange(false)

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave({
        title: localTitle,
        description: localDescription,
      })
      toast.success('Settings saved')
      handleClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRollback = async (versionId: string) => {
    if (!onRollback) return

    try {
      await onRollback(versionId)
      toast.success('Rolled back to previous version')
      handleClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to rollback')
    }
  }

  const handleDelete = () => {
    if (!onDelete) return

    onDelete()
    handleClose()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[50vw]! max-w-none! h-screen!">
        <DrawerHeader>
          <div className="flex items-center justify-between w-full">
            <DrawerTitle>Settings</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4 flex flex-col gap-6 h-full overflow-y-auto">
          {/* Project Title */}
          <div className="space-y-2">
            <label
              htmlFor="project-title"
              className="text-sm font-medium"
            >
              Project Title
            </label>
            <Input
              id="project-title"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Enter project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label
              htmlFor="project-description"
              className="text-sm font-medium"
            >
              Project Description
            </label>
            <Textarea
              id="project-description"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          {/* Version Badge */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Version</label>
            <div>
              <Badge variant="outline">Version : {version}</Badge>
            </div>
          </div>

          {/* Rollback Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rollback</label>
            {rollbackVersions.length > 0 ? (
              <div className="space-y-2">
                {rollbackVersions.map((versionItem) => (
                  <Button
                    key={versionItem.id}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleRollback(versionItem.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Rollback to Version {versionItem.version}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No previous versions</p>
            )}
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            <HoldToDeleteButton onDelete={handleDelete}>Hold to Delete</HoldToDeleteButton>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
