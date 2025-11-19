import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface PreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreviewDrawer({
  open,
  onOpenChange,
}: PreviewDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
        <DrawerHeader>
          <DrawerTitle>Preview</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          {/* Empty content for now */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

