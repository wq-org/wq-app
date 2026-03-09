import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { LessonEditor } from '@/features/lesson'
import { getHeadingsFromLessonValue } from '@/features/course'
import { LessonHeadingsNavigation } from '@/features/lesson'
import { getThemeBackgroundStyle, getThemeDescriptionStyle, getThemeTitleStyle } from '@/lib/themes'
import type { LessonHeading } from '@/features/course'

export interface LessonPreviewTabProps {
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

export function LessonPreviewTab({
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
}: LessonPreviewTabProps) {
  const previewHeadings = getHeadingsFromLessonValue(value)

  const scrollToHeading = (heading: LessonHeading) => {
    const element =
      (heading.elementId ? document.getElementById(heading.elementId) : null) ??
      document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
      document.getElementById(heading.blockId)

    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heroBanner = (
    <div className="relative min-h-[260px] overflow-hidden rounded-2xl border">
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
            style={getThemeTitleStyle(themeId)}
          >
            {title}
          </Text>
          <Text
            as="p"
            variant="body"
            className="mt-4 text-base font-semibold leading-7 md:text-lg"
            style={getThemeDescriptionStyle(themeId)}
          >
            {description}
          </Text>
        </div>
      </div>
    </div>
  )

  return (
    <div className={className ? `relative ${className}` : 'relative'}>
      <LessonHeadingsNavigation
        headings={previewHeadings}
        label={headingsNavLabel}
        onHeadingSelect={scrollToHeading}
        className="fixed top-24 right-4 z-50 hidden w-40 lg:block"
      />
      <section className="rounded-2xl border bg-white p-6 animate-in fade-in-0 slide-in-from-bottom-4">
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
