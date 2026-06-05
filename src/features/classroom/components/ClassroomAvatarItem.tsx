import type { KeyboardEvent } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { cn } from '@/lib/utils'

import type { ClassroomStudent } from '../types/classroom.types'
import { getStudentDisplayLabel, getStudentInitial } from '../utils/classroomStudent.utils'

type ClassroomAvatarItemProps = {
  student: ClassroomStudent
  onSelect: (student: ClassroomStudent) => void
}

export function ClassroomAvatarItem({ student, onSelect }: ClassroomAvatarItemProps) {
  const { url: avatarUrl } = useAvatarUrl(student.avatarUrl)
  const displayLabel = getStudentDisplayLabel(student)
  const displayName = student.displayName?.trim() || student.username || student.name

  const handleClick = () => {
    onSelect(student)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleClick()
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-[4.5rem] flex-col items-center gap-1.5 rounded-lg border-0 bg-transparent p-0',
        'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={displayLabel}
    >
      <Avatar
        size="default"
        className="ring-2 ring-background transition-[box-shadow,ring-color] hover:ring-primary"
      >
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt={displayLabel}
          />
        ) : null}
        <AvatarFallback>{getStudentInitial(displayLabel)}</AvatarFallback>
      </Avatar>
      <Text
        as="span"
        variant="small"
        className="w-full truncate text-center leading-tight"
      >
        {displayName}
      </Text>
    </button>
  )
}
