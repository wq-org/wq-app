import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
interface ClassroomCardProps {
  icon: LucideIcon
  name: string
  studentCount: number
  onClick?: () => void
  className?: string
}

export function ClassroomCard({
  icon: Icon,
  name,
  studentCount,
  onClick,
  className = '',
}: ClassroomCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        className,
        'w-45 h-35 rounded-3xl hover:border-blue-500 duration-200 ease-in-out cursor',
      )}
    >
      <CardHeader>
        <Icon
          className="w-4 h-4 text-white"
          strokeWidth={1.5}
        />
        <CardTitle className=" font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Text
          variant="small"
          muted
        >
          Students
        </Text>
        <Badge variant="secondary">{studentCount}</Badge>
      </CardContent>
    </Card>
  )
}
