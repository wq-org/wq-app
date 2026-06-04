'use client'

import { EllipsisVertical, Link, Unlink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDisclosure } from '@/hooks/use-disclosure'
import { LinkGameDialog } from './LinkGameDialog'
import { UnlinkGameDialog } from './UnlinkGameDialog'

export function GameProjectCardCourseMenu() {
  const { t } = useTranslation('features.gameStudio')
  const popover = useDisclosure()
  const linkDialog = useDisclosure()
  const unlinkDialog = useDisclosure()

  const handleOpenLinkDialog = () => {
    popover.onClose()
    linkDialog.onOpen()
  }

  const handleOpenUnlinkDialog = () => {
    popover.onClose()
    unlinkDialog.onOpen()
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
            className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background"
            aria-label={t('gameProjectCard.courseMenu.triggerAriaLabel')}
            onClick={(event) => event.stopPropagation()}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-52 rounded-lg bg-popover/80 p-2 backdrop-blur-md dark:bg-zinc-900/80"
        >
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleOpenLinkDialog}
            >
              <Link className="size-4" />
              {t('gameProjectCard.courseMenu.linkToCourse')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleOpenUnlinkDialog}
            >
              <Unlink className="size-4" />
              {t('gameProjectCard.courseMenu.unlinkFromCourse')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <LinkGameDialog
        open={linkDialog.isOpen}
        onOpenChange={linkDialog.onToggle}
      />
      <UnlinkGameDialog
        open={unlinkDialog.isOpen}
        onOpenChange={unlinkDialog.onToggle}
      />
    </>
  )
}
