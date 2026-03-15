import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { LessonEditor } from '@/features/lesson'
import { getHeadingsFromLessonValue } from '@/features/course'
import { LessonHeadingsNavigation } from '@/features/lesson'
import type { LessonHeading } from '@/features/course'
import { LessonGuidePopoverSection } from './LessonGuidePopoverSection'
import { LessonHeroBannerSection } from './LessonHeroBannerSection'

export interface LessonPreviewProps {
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
  guides?: readonly {
    readonly value: string
    readonly label: string
    readonly description: string
  }[]
  selectedGuide?: string
  onGuideChange?: (guideValue: string) => void
  helpLabel?: string
}

export function LessonPreview({
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
  guides,
  selectedGuide,
  onGuideChange,
  helpLabel,
}: LessonPreviewProps) {
  const previewHeadings = getHeadingsFromLessonValue(value)

  const scrollToHeading = (heading: LessonHeading) => {
    const element =
      (heading.elementId ? document.getElementById(heading.elementId) : null) ??
      document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
      document.getElementById(heading.blockId)

    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={className ? `relative ${className}` : 'relative'}>
      <LessonHeadingsNavigation
        headings={previewHeadings}
        label={headingsNavLabel}
        onHeadingSelect={scrollToHeading}
        className="fixed top-24 right-4 z-50 hidden w-40 lg:block"
      />
      <section className="rounded-2xl border border-border bg-card p-6 animate-in fade-in-0 slide-in-from-bottom-4">
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

        <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-4">
          <LessonHeroBannerSection
            title={title}
            description={description}
            themeId={themeId}
          />
        </div>

        {guides && selectedGuide && onGuideChange ? (
          <div className="mt-4">
            <LessonGuidePopoverSection
              guides={guides}
              selectedGuide={selectedGuide}
              onSelectGuide={onGuideChange}
              helpLabel={helpLabel}
            />
          </div>
        ) : null}

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
