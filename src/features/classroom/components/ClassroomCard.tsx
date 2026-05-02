import { useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

type ClassroomCardProps = {
  id: string
  icon: LucideIcon
  name: string
  studentCount: number
  onView?: (id: string) => void
  className?: string
}

export function ClassroomCard({
  id,
  icon: Icon,
  name,
  studentCount,
  onView = () => {},
  className = '',
}: ClassroomCardProps) {
  const handleClick = useCallback(() => {
    onView(id)
  }, [id, onView])

  return (
    <Card
      onClick={handleClick}
      className={cn(
        className,
        'w-45 h-35 rounded-3xl hover:border-blue-500 duration-400 ease-in-out cursor animate-in fade-in-0 slide-in-from-left-4',
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
