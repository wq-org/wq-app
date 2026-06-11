import { useState } from 'react'
import { Settings2, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ColorPicker } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { isThemeId, type ThemeId } from '@/lib/themes'

import type { Note } from '../types/note.types'

const FALLBACK_THEME: ThemeId = 'blue'

type NoteSettingsDrawerProps = {
  note: Note
  onThemeChange: (themeId: ThemeId) => Promise<void>
  onDelete: (noteId: string) => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteSettingsDrawer({
  note,
  onThemeChange,
  onDelete,
  open,
  onOpenChange,
}: NoteSettingsDrawerProps) {
  const { t } = useTranslation('features.notes')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingTheme, setIsSavingTheme] = useState(false)

  const selectedThemeId: ThemeId =
    note.themeId && isThemeId(note.themeId) ? note.themeId : FALLBACK_THEME

  const handleThemeSelect = async (themeId: ThemeId) => {
    if (themeId === selectedThemeId || isSavingTheme) return
    setIsSavingTheme(true)
    try {
      await onThemeChange(themeId)
    } catch {
      toast.error(t('settings.themeError'))
    } finally {
      setIsSavingTheme(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(note.id)
      toast.success(t('settings.deleteSuccess'))
      onOpenChange(false)
    } catch {
      toast.error(t('settings.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="h-screen!">
        <DrawerHeader>
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Settings2 className="size-5 shrink-0 text-muted-foreground" />
              <DrawerTitle className="truncate">
                {t('settings.drawerTitle')} / {note.title || t('card.untitled')}
              </DrawerTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label={t('settings.close')}
            >
              <X className="size-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex min-w-0 flex-col gap-3">
            <Label className="font-normal text-foreground">{t('settings.themeLabel')}</Label>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('settings.themeHint')}
            </Text>
            <ColorPicker
              selectedId={selectedThemeId}
              onSelect={handleThemeSelect}
              compact
            />
          </div>
        </div>

        <DrawerFooter className="shrink-0 border-t">
          <HoldToDeleteButton
            className="w-full text-muted-foreground"
            variant="ghost"
            loading={isDeleting}
            icon={
              <Trash2
                className="size-4 shrink-0"
                aria-hidden
              />
            }
            onDelete={handleDelete}
          >
            {t('settings.deleteAction')}
          </HoldToDeleteButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
