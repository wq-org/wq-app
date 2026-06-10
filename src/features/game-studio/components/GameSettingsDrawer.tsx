import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
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
  onSave,
  onDelete,
}: SettingsDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [localTitle, setLocalTitle] = useState(initialTitle)
  const [localDescription, setLocalDescription] = useState(initialDescription)
  const [localThemeId, setLocalThemeId] = useState<ThemeId>(initialThemeId)
  const [isSaving, setIsSaving] = useState(false)

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
