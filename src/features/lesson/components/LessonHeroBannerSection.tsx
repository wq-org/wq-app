import { Text } from '@/components/ui/text'

export type LessonHeroBannerSectionProps = {
  title: string
  description: string
}

export function LessonHeroBannerSection({ title, description }: LessonHeroBannerSectionProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <Text
        as="h1"
        variant="h1"
        className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl"
      >
        {title}
      </Text>
      <Text
        as="p"
        variant="body"
        className="max-w-3xl text-base text-muted-foreground md:text-lg"
      >
        {description}
      </Text>
    </header>
  )
}
