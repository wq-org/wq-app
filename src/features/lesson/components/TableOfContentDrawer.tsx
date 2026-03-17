import { useState } from 'react'
import { TableOfContents, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { LessonHeading } from '../utils/lessonHeadings'
import { LessonHeadingsNavigation } from './LessonHeadingsNavigation'

export type TableOfContentDrawerProps = {
  headings: readonly LessonHeading[]
  loading?: boolean
  triggerLabel: string
  title: string
  description: string
  emptyLabel: string
  closeLabel: string
  onHeadingSelect: (heading: LessonHeading) => void
}

export function TableOfContentDrawer({
  headings,
  loading = false,
  triggerLabel,
  title,
  description,
  emptyLabel,
  closeLabel,
  onHeadingSelect,
}: TableOfContentDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleHeadingSelect = (heading: LessonHeading) => {
    onHeadingSelect(heading)
    setOpen(false)
  }

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
          <TableOfContents className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-screen w-full border-border bg-background px-0 md:w-[50vw] md:max-w-[50vw]">
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

        <ScrollArea className="h-[calc(100vh-5.5rem)] px-4 pb-6">
          <LessonHeadingsNavigation
            headings={headings}
            loading={loading}
            emptyLabel={emptyLabel}
            onHeadingSelect={handleHeadingSelect}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
