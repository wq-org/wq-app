import { Text } from '@/components/ui/text'
import { type LucideIcon } from 'lucide-react'
import { CircleQuestionMark } from 'lucide-react'
import { cn } from '@/lib/utils'
export function DashboardSection({
  title,
  description,
  children,
  icon: Icon = CircleQuestionMark,
  classNameContainer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon?: LucideIcon
  classNameContainer?: string
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

      <div className={cn('border rounded-3xl px-6 py-4', classNameContainer)}>{children}</div>
    </div>
  )
}
