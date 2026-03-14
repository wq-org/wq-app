import { ACCENT_COLORS } from '@/lib/themes'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

type AccentPickerProps = {
  className?: string
}

export function AccentPicker({ className }: AccentPickerProps) {
  const { accent, setAccent } = useTheme()

  return (
    <div className={cn('grid grid-cols-5 gap-3', className)}>
      <button
        type="button"
        onClick={() => setAccent('default')}
        aria-pressed={accent === 'default'}
        aria-label="Select default accent"
        title="Default"
        className="flex items-center justify-center rounded-full p-1 transition-transform hover:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            accent === 'default' && 'ring-2 ring-white ring-offset-2 ring-offset-background',
          )}
        >
          <span
            className="h-10 w-10 rounded-full border border-border/60"
            style={{ backgroundColor: 'oklch(0.205 0 0)' }}
          />
        </span>
      </button>

      {ACCENT_COLORS.map((accentColor) => {
        const isSelected = accent === accentColor.id

        return (
          <button
            key={accentColor.id}
            type="button"
            onClick={() => setAccent(accentColor.id)}
            aria-pressed={isSelected}
            aria-label={`Select ${accentColor.label} accent`}
            title={accentColor.label}
            className="flex items-center justify-center rounded-full p-1 transition-transform hover:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-background',
              )}
            >
              <span
                className="h-10 w-10 rounded-full border border-border/60"
                style={{ backgroundColor: `oklch(${accentColor.oklch})` }}
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}
