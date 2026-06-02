import { useState, useEffect } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { SettingsDrawerProps } from '../types/game-studio.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/components/shared'
import type { ThemeId } from '@/lib/themes'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Spinner } from '@/components/ui/spinner'

export function GameSettingsDrawer({
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
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            <FieldInput
              id="project-title"
              value={localTitle}
              onValueChange={setLocalTitle}
              label={t('settingsDrawer.projectTitleLabel')}
              placeholder={t('settingsDrawer.projectTitlePlaceholder')}
            />

            <FieldTextarea
              id="project-description"
              value={localDescription}
              onValueChange={setLocalDescription}
              label={t('settingsDrawer.projectDescriptionLabel')}
              placeholder={t('settingsDrawer.projectDescriptionPlaceholder')}
              rows={4}
            />

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
              <Label className="text-sm font-medium">
                {t('settingsDrawer.publishStatusLabel')}
              </Label>
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
          </div>

          <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t bg-background/95 p-4 backdrop-blur-sm">
            <HoldToDeleteButton
              onDelete={handleDelete}
              className="flex-1"
            >
              {t('settingsDrawer.holdToDelete')}
            </HoldToDeleteButton>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="darkblue"
              className="flex-1"
            >
              {isSaving ? (
                <Spinner
                  variant="white"
                  size="xs"
                />
              ) : (
                <Check className="size-4 text-inherit" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
