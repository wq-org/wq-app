import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Settings2, X } from 'lucide-react'
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
import { useLesson } from '@/contexts/lesson'

type LessonSettingsDrawerProps = {
  lessonId: string
  lessonTitle?: string
}

export function LessonSettingsDrawer({ lessonId, lessonTitle }: LessonSettingsDrawerProps) {
  const { t } = useTranslation('features.lesson')
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const { deleteLesson, lesson } = useLesson()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentTitle =
    lesson?.title?.trim() || lessonTitle?.trim() || t('settings.deleteDialog.fallbackTitle')
  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await deleteLesson(lessonId)
      toast.success(t('settings.toasts.deleteSuccess'))
      setOpen(false)
      if (courseId) {
        navigate(`/teacher/course/${courseId}`)
      }
    } catch (error) {
      console.error(error)
      toast.error(t('settings.errors.deleteFailed'))
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
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto justify-start gap-2 px-0 py-1 text-muted-foreground"
        >
          <Settings2 className="size-4" />
          {t('settings.drawerTitle')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen!">
        <DrawerHeader>
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <Settings2 className="size-5 shrink-0 text-muted-foreground" />
                <DrawerTitle>
                  {t('settings.drawerTitle')} / {currentTitle}
                </DrawerTitle>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label={t('page.drawers.closeLabel')}
            >
              <X className="size-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4" />

        <DrawerFooter className="shrink-0 border-t">
          <HoldToDeleteButton
            className="w-full"
            loading={isDeleting}
            onDelete={handleDelete}
          >
            {t('settings.deleteAction')}
          </HoldToDeleteButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export type { LessonSettingsDrawerProps }
