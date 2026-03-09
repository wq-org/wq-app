import { useState } from 'react'
import { X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { LessonHeading } from '@/features/course'
import { cn } from '@/lib/utils'

export interface LessonHeadingsNavigationProps {
  headings: LessonHeading[]
  label: string
  onHeadingSelect: (heading: LessonHeading) => void
  className?: string
}

export function LessonHeadingsNavigation({
  headings,
  label,
  onHeadingSelect,
  className,
}: LessonHeadingsNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (headings.length === 0) {
    return null
  }

  return (
    <div className={cn('pointer-events-auto', className)}>
      <div className="sticky top-24">
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}
          modal={false}
        >
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-center rounded-xl bg-background/70 backdrop-blur-md"
              aria-label="Open table of contents"
            >
              <span>View Content</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            showCloseButton={false}
            overlayClassName="pointer-events-none bg-black/30 backdrop-blur-md"
            className="w-[22rem] border-l border-border/60 bg-background/72 p-0 shadow-2xl backdrop-blur-xl sm:max-w-[22rem]"
          >
            <SheetHeader className="border-b border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="text-sm font-semibold text-muted-foreground">
                  {label}
                </SheetTitle>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close table of contents"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </SheetHeader>

            <div className="px-4 pb-4">
              <ScrollArea className="h-[calc(100vh-7.25rem)]">
                <nav className="flex flex-col gap-1 pt-3">
                  {headings.map((heading) => (
                    <button
                      key={heading.blockId}
                      type="button"
                      onClick={() => onHeadingSelect(heading)}
                      className={cn(
                        'text-left text-sm text-foreground hover:text-blue-500',
                        heading.level === 1 && 'font-semibold',
                        heading.level === 2 && 'pl-2 font-medium',
                        heading.level === 3 && 'pl-4',
                        heading.level === 4 && 'pl-6 text-muted-foreground',
                      )}
                    >
                      <span className="line-clamp-2 block break-words leading-snug">
                        {heading.text}
                      </span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
