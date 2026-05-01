import { Text } from '@/components/ui/text'
import { CircleQuestionMark, MoveDiagonal2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function DashboardSection({
  title,
  description,
  children,
  icon: Icon = CircleQuestionMark,
  classNameContainer,
  showExpandButton = false,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon?: LucideIcon
  classNameContainer?: string
  showExpandButton?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 w-full ">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
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
          'border rounded-3xl px-6 py-4 flex flex-col justify-between',
          classNameContainer,
        )}
      >
        <div>{children}</div>

        {showExpandButton && (
          <div className="flex justify-end">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Expand"
            >
              <MoveDiagonal2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
