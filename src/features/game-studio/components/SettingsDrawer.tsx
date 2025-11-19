import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDrawer({
  open,
  onOpenChange,
}: SettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          {/* Empty content for now */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

