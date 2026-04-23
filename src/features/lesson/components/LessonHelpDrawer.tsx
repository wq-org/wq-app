import { useState } from 'react'
import { MessageCircleQuestionMark, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FaqList, type FaqItem } from '@/components/shared'
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

export type LessonHelpDrawerProps = {
  triggerLabel: string
  title: string
  description: string
  closeLabel: string
}

export function LessonHelpDrawer({
  triggerLabel,
  title,
  description,
  closeLabel,
}: LessonHelpDrawerProps) {
  const { t } = useTranslation('features.lesson')
  const [open, setOpen] = useState(false)

  const items: FaqItem[] = [
    {
      id: 'editor-basics',
      question: t('page.help.editorBasics.title'),
      answer: t('page.help.editorBasics.body'),
    },
  ]

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
          <MessageCircleQuestionMark className="h-4 w-4" />
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

        <ScrollArea className="h-[calc(100vh-5.5rem)] px-6 py-5">
          <div className="pb-8">
            <FaqList items={items} />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
