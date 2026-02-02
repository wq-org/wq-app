import { X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import type { SettingsDrawerProps } from '../types/game-studio.types'

const GAME_VERSION = '1'

export default function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const handleClose = () => onOpenChange(false)

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
        <DrawerHeader>
          <div className="flex items-center justify-between w-full">
            <DrawerTitle>Settings</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4 flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Game version</p>
            <p className="text-sm">{GAME_VERSION}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {}}
          >
            Rollback version
          </Button>
          <HoldToDeleteButton onDelete={handleClose}>Hold to Delete</HoldToDeleteButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
