import { Link } from 'react-router-dom'
import { Text } from '@/components/ui/text'
import { CircleQuestionMark, MoveDiagonal2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DashboardSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  icon?: LucideIcon
  classNameContainer?: string
  showExpandButton?: boolean
  /** When set with `showExpandButton`, the expand control navigates to this path. */
  expandTo?: string
  showContainerBorder?: boolean
  /**
   * When true, the title row is muted (`opacity-20`); the rounded body is non-interactive
   * (`pointer-events-none`), visually muted (`opacity-50`), and `inert` so focus does not
   * enter the block. Description text is unchanged.
   */
  disabled?: boolean
}

const expandButtonClassName =
  'pointer-events-auto size-9 shrink-0 rounded-full bg-transparent shadow-none hover:bg-accent/80'

export function DashboardSection({
  title,
  description,
  children,
  icon: Icon = CircleQuestionMark,
  classNameContainer,
  showExpandButton = false,
  expandTo,
  showContainerBorder = false,
  disabled = false,
}: DashboardSectionProps) {
  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in-0 slide-in-from-bottom-2 ">
      <div className="flex flex-col">
        <div
          className={cn(
            'flex items-center gap-2 animate-in fade-in-0 slide-in-from-left-4',
            disabled && 'opacity-20',
          )}
        >
          <Icon className="h-4 w-4 stroke-2 text-foreground" />
          <Text
            variant="small"
            bold
            muted
          >
            {title}
          </Text>
        </div>

        {description ? <Text variant="small">{description}</Text> : null}
      </div>

      <div
        className={cn(
          'rounded-3xl flex min-h-0 flex-col overflow-hidden',
          !showExpandButton && 'px-6 py-4',
          classNameContainer,
          showContainerBorder ? 'border' : '',
          disabled && 'pointer-events-none opacity-50',
        )}
        aria-disabled={disabled || undefined}
        inert={disabled ? true : undefined}
      >
        {showExpandButton ? (
          <div className="relative min-h-0 flex-1">
            <div className="max-h-full min-h-0 overflow-y-auto px-6 py-4 pb-12 pr-14">
              {children}
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2 z-10 flex justify-end sm:bottom-2.5 sm:right-2.5">
              {expandTo ? (
                <Button
                  asChild
                  size="icon"
                  variant="secondary"
                  className={cn(expandButtonClassName, disabled && 'pointer-events-none')}
                >
                  <Link
                    to={expandTo}
                    aria-label="Open full list"
                  >
                    <MoveDiagonal2 className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Expand"
                  className={cn(expandButtonClassName, disabled && 'pointer-events-none')}
                >
                  <MoveDiagonal2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
