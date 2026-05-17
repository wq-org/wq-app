import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Text } from '@/components/ui/text'

import type { ClassroomMember } from '../types/classroom.types'
import { getInitial } from '../utils'

export type CoTeacherItemProps = {
  member: ClassroomMember
  onRemove: (member: ClassroomMember) => void
  isBusy?: boolean
}

export function CoTeacherItem({ member, onRemove, isBusy = false }: CoTeacherItemProps) {
  const { t } = useTranslation('features.institution-admin')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleRemove = () => {
    setIsPopoverOpen(false)
    onRemove(member)
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar size="default">
        {member.avatarUrl ? (
          <AvatarImage
            src={member.avatarUrl}
            alt={member.name}
          />
        ) : null}
        <AvatarFallback>{getInitial(member.name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-1">
        <Text
          as="p"
          variant="body"
          className="truncate font-medium"
        >
          {member.name}
        </Text>
        <Text
          as="p"
          variant="small"
          color="muted"
          className="truncate"
        >
          {member.email || t('classrooms.detail.mainTeacher.noEmail')}
        </Text>
      </div>
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={isBusy}
          >
            {t('classrooms.detail.coTeachers.edit')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-48 p-2"
        >
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="delete"
              size="sm"
              className="justify-start"
              disabled={isBusy}
              onClick={handleRemove}
            >
              {t('classrooms.detail.coTeachers.remove')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
