import { AspectRatio } from '@/components/ui/aspect-ratio'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Text } from '@/components/ui/text'
import { THEME_IDS, getThemeBackgroundStyle, type ThemeId } from '@/lib/themes'
import { cn } from '@/lib/utils'

type ColorPickerProps = {
  selectedId: ThemeId
  onSelect: (id: ThemeId) => void
  className?: string
  compact?: boolean
}

export function ColorPicker({
  selectedId,
  onSelect,
  className,
  compact = false,
}: ColorPickerProps) {
  return (
    <BlurredScrollArea
      className={cn('w-full max-w-full rounded-xl border', className)}
      scrollbars="horizontal"
    >
      <div
        className={cn(
          'flex w-max min-w-full',
          compact ? 'gap-2 px-2 py-2' : 'gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4',
        )}
      >
        {THEME_IDS.map((themeId) => {
          const isSelected = selectedId === themeId
          return (
            <button
              key={themeId}
              type="button"
              onClick={() => onSelect(themeId)}
              aria-pressed={isSelected}
              aria-label={`Select ${themeId} theme`}
              className={cn('group shrink-0 text-left', compact ? 'w-6' : 'w-14 sm:w-16')}
            >
              <AspectRatio ratio={1}>
                <div
                  className={cn(
                    'h-full w-full transition-transform duration-200 group-hover:scale-[0.98]',
                    compact ? 'rounded-md border-2' : 'rounded-xl border-4',
                    isSelected ? 'border-blue-500' : 'border-transparent',
                  )}
                  style={getThemeBackgroundStyle(themeId)}
                />
              </AspectRatio>
              {!compact ? (
                <Text
                  as="span"
                  variant="small"
                  className="mt-1 block truncate text-center uppercase text-muted-foreground"
                >
                  {themeId.charAt(0).toUpperCase() + themeId.slice(1)}
                </Text>
              ) : null}
            </button>
          )
        })}
      </div>
    </BlurredScrollArea>
  )
}
