'use client'

import { ChartBar, EllipsisVertical, Link, PowerOff, Trash2, Unlink } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDisclosure } from '@/hooks/use-disclosure'
import { cn } from '@/lib/utils'

import { takeGameDeliveriesOffline } from '../api/gameStudioApi'
import { GameDeleteDialog } from './GameDeleteDialog'
import { LinkGameDialog } from './LinkGameDialog'
import { UnlinkGameDialog } from './UnlinkGameDialog'

type GameProjectCardCourseMenuProps = {
  gameId: string
  linkedCourseIds?: string[]
  status?: 'draft' | 'published'
  onCourseLinkChanged?: () => void
  onViewAnalytics?: (gameId: string) => void
  compact?: boolean
  className?: string
}

export function GameProjectCardCourseMenu({
  gameId,
  linkedCourseIds = [],
  status = 'draft',
  onCourseLinkChanged,
  onViewAnalytics,
  compact = false,
  className,
}: GameProjectCardCourseMenuProps) {
  const { t } = useTranslation('features.gameStudio')
  const popover = useDisclosure()
  const linkDialog = useDisclosure()
  const unlinkDialog = useDisclosure()
  const deleteDialog = useDisclosure()
  const [isTakingOffline, setIsTakingOffline] = useState(false)

  const isPublished = status === 'published'

  const handleOpenLinkDialog = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    popover.onClose()
    linkDialog.onOpen()
  }

  const handleOpenUnlinkDialog = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    popover.onClose()
    unlinkDialog.onOpen()
  }

  const handleOpenDelete = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    popover.onClose()
    deleteDialog.onOpen()
  }

  const handleViewAnalytics = () => {
    popover.onClose()
    onViewAnalytics?.(gameId)
  }

  const handleTakeOffline = async () => {
    popover.onClose()
    setIsTakingOffline(true)
    try {
      const affectedCount = await takeGameDeliveriesOffline(gameId)
      if (affectedCount === 0) {
        toast.message(t('gameProjectCard.menu.toasts.offlineNothingToHide'))
        return
      }
      toast.success(t('gameProjectCard.menu.toasts.offlineSuccess'), {
        description: t('gameProjectCard.menu.toasts.offlineSuccessDescription', {
          count: affectedCount,
        }),
      })
      onCourseLinkChanged?.()
    } catch {
      toast.error(t('gameProjectCard.menu.toasts.offlineFailed'))
    } finally {
      setIsTakingOffline(false)
    }
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
            aria-label={t('gameProjectCard.courseMenu.triggerAriaLabel')}
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
              disabled={!isPublished || isTakingOffline}
              onClick={() => void handleTakeOffline()}
            >
              <PowerOff className="size-4" />
              {t('gameProjectCard.menu.takeOffline')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleOpenLinkDialog}
              onPointerDown={(event) => event.preventDefault()}
            >
              <Link className="size-4" />
              {t('gameProjectCard.courseMenu.linkToCourse')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              disabled={linkedCourseIds.length === 0}
              onClick={handleOpenUnlinkDialog}
              onPointerDown={(event) => event.preventDefault()}
            >
              <Unlink className="size-4" />
              {t('gameProjectCard.courseMenu.unlinkFromCourse')}
            </Button>
            {onViewAnalytics ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={handleViewAnalytics}
              >
                <ChartBar className="size-4" />
                {t('gameProjectCard.viewAnalytics')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              onClick={handleOpenDelete}
              onPointerDown={(event) => event.preventDefault()}
            >
              <Trash2 className="size-4" />
              {t('gameProjectCard.menu.deleteGame')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <LinkGameDialog
        gameId={gameId}
        linkedCourseIds={linkedCourseIds}
        open={linkDialog.isOpen}
        onOpenChange={linkDialog.onToggle}
        onLinked={onCourseLinkChanged}
      />
      <UnlinkGameDialog
        gameId={gameId}
        linkedCourseIds={linkedCourseIds}
        open={unlinkDialog.isOpen}
        onOpenChange={unlinkDialog.onToggle}
        onUnlinked={onCourseLinkChanged}
      />
      <GameDeleteDialog
        gameId={gameId}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.onToggle}
        onDeleted={onCourseLinkChanged}
      />
    </>
  )
}
