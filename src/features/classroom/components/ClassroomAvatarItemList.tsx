import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import type { ClassroomStudent } from '../types/classroom.types'
import { ClassroomAvatarItem } from './ClassroomAvatarItem'

type ClassroomAvatarItemListProps = {
  students: readonly ClassroomStudent[]
  max?: number
  onSelect: (student: ClassroomStudent) => void
  className?: string
}

export function ClassroomAvatarItemList({
  students,
  max = 8,
  onSelect,
  className,
}: ClassroomAvatarItemListProps) {
  const visibleStudents = students.slice(0, max)
  const remainingCount = Math.max(students.length - max, 0)

  return (
    <div className={cn('flex w-full flex-wrap items-start justify-start gap-4', className)}>
      {visibleStudents.map((student) => (
        <ClassroomAvatarItem
          key={student.id}
          student={student}
          onSelect={onSelect}
        />
      ))}
      {remainingCount > 0 ? (
        <div
          className="flex w-[4.5rem] flex-col items-center gap-1.5"
          aria-hidden
        >
          <Avatar
            size="default"
            className="ring-2 ring-background"
          >
            <AvatarFallback className="bg-muted-foreground text-white">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
    </div>
  )
}
