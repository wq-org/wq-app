import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getThemeBackgroundStyle, type ThemeId } from '@/lib/themes'

export interface Feature1BulletItem {
  title: string
  description: string
}

interface Feature1Props {
  badgeText?: string
  badeText?: string
  title?: string
  description?: string
  items?: Feature1BulletItem[]
  imageSrc?: string
  imageAlt?: string
  themeId?: ThemeId
}

const defaultItems: Feature1BulletItem[] = [
  {
    title: 'Easy to use',
    description: "We've made it easy to use and understand.",
  },
  {
    title: 'Fast and reliable',
    description: "We've made it fast and reliable.",
  },
  {
    title: 'Beautiful and modern',
    description: "We've made it beautiful and modern.",
  },
]

export function Feature1({
  badgeText,
  badeText,
  title = 'Something new!',
  description = 'Managing a small business today is already tough.',
  items = defaultItems,
  imageSrc,
  imageAlt,
  themeId = 'darkblue',
}: Feature1Props) {
  const resolvedBadgeText = badgeText ?? badeText ?? 'Platform'

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="container grid grid-cols-1 items-center gap-8 rounded-lg border py-8 lg:grid-cols-2">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div>
                <Badge variant="outline">{resolvedBadgeText}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="max-w-xl text-left text-3xl font-regular tracking-tighter lg:text-5xl">
                  {title}
                </h2>
                <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:pl-6">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-row items-start gap-6"
                >
                  <Check className="mt-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p>{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="aspect-square overflow-hidden rounded-md"
            style={!imageSrc ? getThemeBackgroundStyle(themeId) : undefined}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt ?? title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-6xl font-semibold text-white/35">
                  {title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
