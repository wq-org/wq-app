import { useState } from 'react'
import { FolderSync, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

export type AutoImportDrawerProps = {
  triggerLabel: string
  title: string
  description: string
  placeholderTitle: string
  placeholderDescription: string
  footerNote: string
  closeLabel: string
}

export function AutoImportDrawer({
  triggerLabel,
  title,
  description,
  placeholderTitle,
  placeholderDescription,
  footerNote,
  closeLabel,
}: AutoImportDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="darkblue"
          className="w-full justify-start bg-card/80 backdrop-blur sm:w-auto lg:w-full"
        >
          <FolderSync className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-screen w-full border-border bg-background px-0 md:w-[50vw] md:min-w-[50vw] md:max-w-[50vw]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="px-4 py-6">
          <div className="rounded-4xl border border-dashed border-border bg-card/60 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border bg-background p-3">
                <FolderSync className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <Text
                  as="p"
                  variant="body"
                  className="font-semibold"
                >
                  {placeholderTitle}
                </Text>
                <Text
                  as="p"
                  variant="small"
                  className="text-muted-foreground"
                >
                  {placeholderDescription}
                </Text>
              </div>
            </div>

            <Separator className="my-5" />

            <Text
              as="p"
              variant="small"
              className="text-muted-foreground"
            >
              {footerNote}
            </Text>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
