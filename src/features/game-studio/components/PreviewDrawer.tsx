import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { PreviewDrawerProps } from '../types/game-studio.types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function PreviewDrawer({ open, onOpenChange }: PreviewDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-screen! max-w-none! h-screen!">
        <DrawerHeader >
          <div className="flex items-center justify-between">
            <DrawerTitle>Preview</DrawerTitle>
            <Button
              variant="ghost" size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4">
            <Alert className="bg-slate-100 border border-slate-200">
              <InfoIcon className="text-slate-500" />
              <AlertTitle className="text-slate-800 font-semibold">Game Simulation</AlertTitle>
              <AlertDescription className="text-slate-700">
                This is where you’ll preview and test how your game works for players.
              </AlertDescription>
            </Alert>
          {/* Empty content for now */}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
