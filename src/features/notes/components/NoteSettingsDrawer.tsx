import { useState } from 'react'
import { Copy, Pin, PinOff, Settings2, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

import type { Note } from '../types/note.types'

type NoteSettingsDrawerProps = {
  note: Note
  onPin: (noteId: string, isPinned: boolean) => Promise<void>
  onDuplicate: (noteId: string) => Promise<void>
  onDelete: (noteId: string) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When false, the drawer is opened externally (e.g. editor settings row). */
  showTrigger?: boolean
}

export function NoteSettingsDrawer({
  note,
  onPin,
  onDuplicate,
  onDelete,
  open: openProp,
  onOpenChange,
  showTrigger = true,
}: NoteSettingsDrawerProps) {
  const { t } = useTranslation('features.notes')
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [isPinning, setIsPinning] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePin = async () => {
    if (isPinning) return
    setIsPinning(true)
    try {
      await onPin(note.id, !note.isPinned)
    } finally {
      setIsPinning(false)
    }
  }

  const handleDuplicate = async () => {
    if (isDuplicating) return
    setIsDuplicating(true)
    try {
      await onDuplicate(note.id)
      toast.success(t('settings.duplicateSuccess'))
      setOpen(false)
    } catch {
      toast.error(t('settings.duplicateError'))
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(note.id)
      toast.success(t('settings.deleteSuccess'))
      setOpen(false)
    } catch {
      toast.error(t('settings.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="right"
    >
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
            aria-label={t('settings.drawerTitle')}
          >
            <Settings2 className="size-4" />
          </Button>
        </DrawerTrigger>
      ) : null}
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
              onClick={() => setOpen(false)}
              aria-label={t('settings.close')}
            >
              <X className="size-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-foreground"
            disabled={isPinning}
            onClick={handlePin}
          >
            {note.isPinned ? (
              <>
                <PinOff className="size-4 text-muted-foreground" />
                {t('settings.unpinAction')}
              </>
            ) : (
              <>
                <Pin className="size-4 text-muted-foreground" />
                {t('settings.pinAction')}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-foreground"
            disabled={isDuplicating}
            onClick={handleDuplicate}
          >
            <Copy className="size-4 text-muted-foreground" />
            {t('settings.duplicateAction')}
          </Button>
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
