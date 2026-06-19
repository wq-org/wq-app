import { EllipsisVertical, PowerOff, Trash2 } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDisclosure } from '@/hooks/use-disclosure'
import { cn } from '@/lib/utils'

import { takeCourseDeliveriesOffline } from '../api/courseVersionApi'
import type { CourseCardReleaseStatus } from '../types/course.types'
import { CourseDeleteDialog } from './CourseDeleteDialog'

type CourseCardActionsMenuProps = {
  courseId: string
  releaseStatus?: CourseCardReleaseStatus
  onChanged?: () => void
  compact?: boolean
  className?: string
}

export function CourseCardActionsMenu({
  courseId,
  releaseStatus = 'draft',
  onChanged,
  compact = false,
  className,
}: CourseCardActionsMenuProps) {
  const { t } = useTranslation('features.course')
  const popover = useDisclosure()
  const deleteDialog = useDisclosure()
  const [isTakingOffline, setIsTakingOffline] = useState(false)

  const canTakeOffline = releaseStatus === 'live'

  const handleTakeOffline = async () => {
    popover.onClose()
    setIsTakingOffline(true)
    try {
      const affectedCount = await takeCourseDeliveriesOffline(courseId)
      if (affectedCount === 0) {
        toast.message(t('cardMenu.toasts.offlineNothingToHide'))
        return
      }
      toast.success(t('settings.toasts.offlineSuccess'), {
        description: t('settings.toasts.offlineSuccessDescription', { count: affectedCount }),
      })
      onChanged?.()
    } catch {
      toast.error(t('settings.toasts.offlineFailed'))
    } finally {
      setIsTakingOffline(false)
    }
  }

  const handleOpenDelete = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    popover.onClose()
    deleteDialog.onOpen()
  }

  return (
    <>
      <Popover
        open={popover.isOpen}
        onOpenChange={popover.onToggle}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              'absolute z-20 rounded-full bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background',
              compact ? 'top-2 right-2 size-6' : 'top-3 right-3 size-8',
              className,
            )}
            aria-label={t('cardMenu.triggerAriaLabel')}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <EllipsisVertical className={compact ? 'size-3.5' : 'size-4'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-52 rounded-lg bg-popover/80 p-2 backdrop-blur-md dark:bg-zinc-900/80"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              disabled={!canTakeOffline || isTakingOffline}
              onClick={() => void handleTakeOffline()}
            >
              <PowerOff className="size-4" />
              {t('cardMenu.takeOffline')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              onClick={handleOpenDelete}
              onPointerDown={(event) => event.preventDefault()}
            >
              <Trash2 className="size-4" />
              {t('cardMenu.deleteCourse')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CourseDeleteDialog
        courseId={courseId}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.onToggle}
        onDeleted={onChanged}
      />
    </>
  )
}
