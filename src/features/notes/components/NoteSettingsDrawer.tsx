import { useState } from 'react'
import { Settings2, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

import type { Note } from '../types/note.types'

type NoteSettingsDrawerProps = {
  note: Note
  onDelete: (noteId: string) => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteSettingsDrawer({
  note,
  onDelete,
  open,
  onOpenChange,
}: NoteSettingsDrawerProps) {
  const { t } = useTranslation('features.notes')
  const [isDeleting, setIsDeleting] = useState(false)

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

        <DrawerFooter className="mt-auto shrink-0 border-t">
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
