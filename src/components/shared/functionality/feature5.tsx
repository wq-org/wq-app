import { Badge } from '@/components/ui/badge'
import { getThemeBackgroundStyle, type ThemeId } from '@/lib/themes'

interface Feature5Props {
  badgeText?: string
  title?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  themeId?: ThemeId
}

export function Feature5({
  badgeText = 'Platform',
  title = 'This is the start of something new',
  description = 'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
  imageSrc,
  imageAlt,
  themeId = 'darkblue',
}: Feature5Props) {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <Badge>{badgeText}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-left text-xl font-regular tracking-tighter md:text-5xl lg:max-w-xl">
                {title}
              </h2>
              <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-sm">
                {description}
              </p>
            </div>
          </div>
          <div
            className="flex h-full w-full flex-1 overflow-hidden rounded-md aspect-video"
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

export const Feature4 = Feature5
