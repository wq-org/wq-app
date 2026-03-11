import { Text } from '@/components/ui/text'
import { getThemeBackgroundStyle, getThemeDescriptionStyle, getThemeTitleStyle } from '@/lib/themes'

interface LessonHeroBannerSectionProps {
  title: string
  description: string
  themeId?: string
}

export function LessonHeroBannerSection({
  title,
  description,
  themeId,
}: LessonHeroBannerSectionProps) {
  return (
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
}
