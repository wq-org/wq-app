import type { ComponentType } from 'react'
import { useState } from 'react'
import { DoorOpen, EllipsisVertical, PackageCheck, Play, Save, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GlobeOffIcon } from '@/components/shared/icons'
import { cn } from '@/lib/utils'

import { GameUnpublishConfirmDialog } from '../components/GameUnpublishConfirmDialog'

export type GameEditorToolbarProps = {
  onSave: () => void
  onPreview: () => void
  onLeave: () => void
  onPublish: () => void
  onUnpublish: () => void | Promise<void>
  isPublished: boolean
  onOpenSettings: () => void
}

const menuButtonClassName =
  'h-auto min-h-8 w-full flex-wrap items-start justify-start gap-2 whitespace-normal rounded-lg py-2 text-left leading-snug'

function MenuActionButton({
  variant,
  disabled,
  onClick,
  icon: Icon,
  label,
}: {
  variant: 'ghost' | 'delete'
  disabled?: boolean
  onClick: () => void
  icon: ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      disabled={disabled}
      className={cn(menuButtonClassName, variant === 'ghost' && 'dark:hover:bg-zinc-800')}
      onClick={onClick}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0 flex-1 text-left">{label}</span>
    </Button>
  )
}

export function GameEditorToolbar({
  onSave,
  onPreview,
  onLeave,
  onPublish,
  onUnpublish,
  isPublished,
  onOpenSettings,
}: GameEditorToolbarProps) {
  const { t } = useTranslation('features.gameStudio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)

  return (
    <>
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/70 p-1.5 backdrop-blur-sm pointer-events-auto dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
        <Popover
          open={menuOpen}
          onOpenChange={setMenuOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-52 max-w-[min(100vw-2rem,14rem)] rounded-2xl p-2 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <div className="flex flex-col gap-1">
              <MenuActionButton
                variant="ghost"
                onClick={onSave}
                icon={Save}
                label={t('editorCanvas.actions.save')}
              />
              <MenuActionButton
                variant="ghost"
                onClick={onPreview}
                icon={Play}
                label={t('editorCanvas.actions.preview')}
              />
              <MenuActionButton
                variant="ghost"
                onClick={onLeave}
                icon={DoorOpen}
                label={t('editorCanvas.actions.leave')}
              />
              <MenuActionButton
                variant="ghost"
                onClick={onPublish}
                icon={PackageCheck}
                label={t('editorCanvas.actions.publish')}
              />
              <MenuActionButton
                variant="delete"
                onClick={() => {
                  setMenuOpen(false)
                  setUnpublishDialogOpen(true)
                }}
                disabled={!isPublished}
                icon={GlobeOffIcon}
                label={t('editorCanvas.actions.unpublish')}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onOpenSettings}
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </div>

      <GameUnpublishConfirmDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
        onConfirm={onUnpublish}
      />
    </>
  )
}
