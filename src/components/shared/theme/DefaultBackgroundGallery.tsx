import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { THEME_IDS, getThemeBackgroundStyle, type ThemeId } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface DefaultBackgroundGalleryProps {
  selectedId: ThemeId
  onSelect: (id: ThemeId) => void
  className?: string
}

export default function DefaultBackgroundGallery({
  selectedId,
  onSelect,
  className,
}: DefaultBackgroundGalleryProps) {
  return (
    <ScrollArea
      className={cn('w-full rounded-xl border', className)}
      scrollbars="horizontal"
    >
      <div className="flex min-w-max gap-3 px-4 py-4">
        {THEME_IDS.map((themeId) => {
          const isSelected = selectedId === themeId
          return (
            <button
              key={themeId}
              type="button"
              onClick={() => onSelect(themeId)}
              aria-pressed={isSelected}
              aria-label={`Select ${themeId} theme`}
              className="group w-20 shrink-0 text-left"
            >
              <AspectRatio ratio={1}>
                <div
                  className={cn(
                    'h-full w-full rounded-xl border-4 transition-transform duration-200 group-hover:scale-[0.98]',
                    isSelected ? 'border-[oklch(var(--oklch-darkblue))]' : 'border-transparent',
                  )}
                  style={getThemeBackgroundStyle(themeId)}
                />
              </AspectRatio>
              <Text
                as="span"
                variant="small"
                className="mt-2 block uppercase text-muted-foreground"
              >
                {themeId.charAt(0).toUpperCase() + themeId.slice(1)}
              </Text>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
