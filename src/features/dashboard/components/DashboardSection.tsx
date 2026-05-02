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
}

const expandButtonClassName = 'pointer-events-auto bg-transparent shadow-none hover:bg-accent/80'

export function DashboardSection({
  title,
  description,
  children,
  icon: Icon = CircleQuestionMark,
  classNameContainer,
  showExpandButton = false,
  expandTo,
  showContainerBorder = false,
}: DashboardSectionProps) {
  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in-0 slide-in-from-bottom-2 ">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-left-4">
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
        )}
      >
        {showExpandButton ? (
          <div className="relative min-h-0 flex-1">
            <div className="max-h-full min-h-0 overflow-y-auto px-6 py-4 pb-12">{children}</div>
            <div className="pointer-events-none absolute bottom-2 right-6 z-10 flex justify-end">
              {expandTo ? (
                <Button
                  asChild
                  size="icon"
                  variant="secondary"
                  className={expandButtonClassName}
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
                  className={expandButtonClassName}
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
