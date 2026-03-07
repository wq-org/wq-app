import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import type { LessonHeading } from '@/features/course/utils/lessonHeadings'
import { cn } from '@/lib/utils'

export interface LessonHeadingsNavigationProps {
  headings: LessonHeading[]
  label: string
  onHeadingSelect: (heading: LessonHeading) => void
  className?: string
}

export default function LessonHeadingsNavigation({
  headings,
  label,
  onHeadingSelect,
  className,
}: LessonHeadingsNavigationProps) {
  if (headings.length === 0) {
    return null
  }

  return (
    <aside
      className={cn(
        'sticky top-24 z-30 h-112 w-52 shrink-0 self-start rounded-2xl border bg-card/50 px-4 py-3 backdrop-blur',
        className,
      )}
      role="navigation"
      aria-label={label}
    >
      <Text
        as="p"
        variant="small"
        className="mb-2 font-semibold text-muted-foreground"
      >
        {label}
      </Text>

      <ScrollArea className="h-[calc(100%-2rem)]">
        <nav className="flex flex-col gap-1">
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
              <span className="line-clamp-2 block wrap-break-word">{heading.text}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
