import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { PublishDrawerProps } from '../types/game-studio.types';

export default function PublishDrawer({
  open,
  onOpenChange,
}: PublishDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="!w-[50vw] !max-w-none">
        <DrawerHeader>
          <DrawerTitle>Publish</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          {/* Empty content for now */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

