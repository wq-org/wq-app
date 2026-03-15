import { useState, useEffect } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { SettingsDrawerProps } from '../types/game-studio.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/components/shared'
import type { ThemeId } from '@/lib/themes'

export function SettingsDrawer({
  open,
  onOpenChange,
  title: initialTitle = '',
  description: initialDescription = '',
  themeId: initialThemeId = 'blue',
  version = 1,
  rollbackVersions = [],
  onSave,
  onRollback,
  onDelete,
  isPublished = false,
  onUnpublish,
}: SettingsDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [localTitle, setLocalTitle] = useState(initialTitle)
  const [localDescription, setLocalDescription] = useState(initialDescription)
  const [localThemeId, setLocalThemeId] = useState<ThemeId>(initialThemeId)
  const [isSaving, setIsSaving] = useState(false)
  const [isUnpublishPending, setIsUnpublishPending] = useState(false)

  // Update local state when props change (e.g., when drawer opens with new data)
  useEffect(() => {
    if (open) {
      setLocalTitle(initialTitle)
      setLocalDescription(initialDescription)
      setLocalThemeId(initialThemeId)
    }
  }, [open, initialTitle, initialDescription, initialThemeId])

  const handleClose = () => onOpenChange(false)

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave({
        title: localTitle,
        description: localDescription,
        theme_id: localThemeId,
      })
      toast.success(t('settingsDrawer.toasts.saved'))
      handleClose()
    } catch (err) {
      console.error(err)
      toast.error(t('settingsDrawer.toasts.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleRollback = async (versionId: string) => {
    if (!onRollback) return

    try {
      await onRollback(versionId)
      toast.success(t('settingsDrawer.toasts.rolledBack'))
      handleClose()
    } catch (err) {
      console.error(err)
      toast.error(t('settingsDrawer.toasts.rollbackFailed'))
    }
  }

  const handleDelete = () => {
    if (!onDelete) return

    onDelete()
    handleClose()
  }

  const handleUnpublishToggle = async (checked: boolean) => {
    if (checked) return
    if (!onUnpublish) return
    setIsUnpublishPending(true)
    try {
      await onUnpublish()
      toast.success(t('settingsDrawer.toasts.unpublished'))
    } catch (err) {
      console.error(err)
      toast.error(t('settingsDrawer.toasts.unpublishFailed'))
    } finally {
      setIsUnpublishPending(false)
    }
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
            <DrawerTitle>{t('settingsDrawer.title')}</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label={t('settingsDrawer.closeAriaLabel')}
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
              {t('settingsDrawer.projectTitleLabel')}
            </label>
            <Input
              id="project-title"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder={t('settingsDrawer.projectTitlePlaceholder')}
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label
              htmlFor="project-description"
              className="text-sm font-medium"
            >
              {t('settingsDrawer.projectDescriptionLabel')}
            </label>
            <Textarea
              id="project-description"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder={t('settingsDrawer.projectDescriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('settingsDrawer.themeLabel')}</Label>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('settingsDrawer.themeHint')}
            </Text>
            <ColorPicker
              selectedId={localThemeId}
              onSelect={setLocalThemeId}
            />
          </div>

          {/* Publish status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('settingsDrawer.publishStatusLabel')}</Label>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Text
                  as="p"
                  variant="body"
                  className="text-sm font-medium"
                >
                  {isPublished
                    ? t('settingsDrawer.publishStatus.published')
                    : t('settingsDrawer.publishStatus.draft')}
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="text-xs text-muted-foreground"
                >
                  {isPublished
                    ? t('settingsDrawer.publishStatus.publishedHint')
                    : t('settingsDrawer.publishStatus.draftHint')}
                </Text>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={handleUnpublishToggle}
                disabled={!isPublished || isUnpublishPending}
              />
            </div>
          </div>

          {/* Version Badge */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settingsDrawer.versionLabel')}</label>
            <div>
              <Badge variant="outline">{t('settingsDrawer.versionValue', { version })}</Badge>
            </div>
          </div>

          {/* Rollback Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settingsDrawer.rollbackLabel')}</label>
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
                    {t('settingsDrawer.rollbackToVersion', { version: versionItem.version })}
                  </Button>
                ))}
              </div>
            ) : (
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                {t('settingsDrawer.noPreviousVersions')}
              </Text>
            )}
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="darkblue"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
            <HoldToDeleteButton onDelete={handleDelete}>
              {t('settingsDrawer.holdToDelete')}
            </HoldToDeleteButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
