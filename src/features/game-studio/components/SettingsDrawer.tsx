import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { SettingsDrawerProps } from '../types/game-studio.types'

export default function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">{/* Empty content for now */}</div>
      </DrawerContent>
    </Drawer>
  )
}
