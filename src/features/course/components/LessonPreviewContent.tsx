import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { getThemeBackgroundStyle } from '@/lib/themes'
import { getHeadingsFromLessonValue } from '@/features/course/utils/lessonHeadings'
import LessonEditor from '@/features/course/components/LessonEditor'
import Spinner from '@/components/ui/spinner'

interface LessonPreviewContentProps {
  title: string
  description: string
  value?: Record<string, unknown>
  loading?: boolean
  previewTitle: string
  previewHint: string
  headingsNavLabel: string
  loadingLabel: string
  editorPlaceholder: string
  themeId?: string
  className?: string
}

export default function LessonPreviewContent({
  title,
  description,
  value,
  loading = false,
  previewTitle,
  previewHint,
  headingsNavLabel,
  loadingLabel,
  editorPlaceholder,
  themeId,
  className,
}: LessonPreviewContentProps) {
  const previewHeadings = getHeadingsFromLessonValue(value)

  const scrollToHeading = (heading: { blockId: string; elementId?: string }) => {
    const el =
      (heading.elementId ? document.getElementById(heading.elementId) : null) ??
      document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
      document.getElementById(heading.blockId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heroBanner = (
    <div className="relative overflow-hidden rounded-2xl border min-h-[260px]">
      <div
        className="absolute inset-0 h-full w-full"
        style={getThemeBackgroundStyle(themeId)}
      />
      <div className="relative z-10 flex min-h-[260px] items-center justify-center px-6 py-10">
        <div className="max-w-3xl text-center text-foreground">
          <Text
            as="h1"
            variant="h1"
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            {title}
          </Text>
          <Text
            as="p"
            variant="body"
            className="mt-4 text-base leading-7 text-foreground/80 md:text-lg"
          >
            {description}
          </Text>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('relative', previewHeadings.length > 0 && 'flex gap-4', className)}>
      {previewHeadings.length > 0 && (
        <aside
          className="sticky top-24 z-30 w-52 shrink-0 self-start rounded-2xl border bg-card/50 px-4 py-3 backdrop-blur"
          role="navigation"
          aria-label={headingsNavLabel}
        >
          <Text
            as="p"
            variant="small"
            className="mb-2 font-semibold text-muted-foreground"
          >
            {headingsNavLabel}
          </Text>
          <nav className="flex flex-col gap-0.5">
            {previewHeadings.map((heading) => (
              <button
                key={heading.blockId}
                type="button"
                onClick={() => scrollToHeading(heading)}
                className={cn(
                  'text-left text-sm text-foreground hover:text-primary hover:underline',
                  heading.level === 1 && 'font-semibold',
                  heading.level === 2 && 'pl-2 font-medium',
                  heading.level === 3 && 'pl-4',
                  heading.level === 4 && 'pl-6 text-muted-foreground',
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <section className="min-w-0 flex-1 rounded-2xl border bg-white p-6 animate-in fade-in-0 slide-in-from-bottom-4">
        <Text
          as="h2"
          variant="h2"
          className="text-2xl font-semibold"
        >
          {previewTitle}
        </Text>
        <Text
          as="p"
          variant="body"
          className="mt-2 text-sm text-muted-foreground"
        >
          {previewHint}
        </Text>

        <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-4">{heroBanner}</div>

        {loading ? (
          <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-xl border bg-muted/30">
            <div className="flex flex-col items-center gap-2">
              <Spinner
                variant="gray"
                size="md"
                speed={1750}
              />
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                {loadingLabel}
              </Text>
            </div>
          </div>
        ) : (
          <LessonEditor
            className="mt-4 rounded-xl border bg-background"
            value={value ?? {}}
            readOnly
            placeholder={editorPlaceholder}
          />
        )}
      </section>
    </div>
  )
}
