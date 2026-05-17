import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Text } from '@/components/ui/text'

import type { ClassroomMember } from '../types/classroom.types'
import { getInitial } from '../utils'

export type MainTeacherCardProps = {
  primaryTeacher: ClassroomMember | null
  /** Opens the teacher picker — same flow drives both "Assign" and "Reassign". */
  onSelectTeacher: () => void
  /** Clears `classrooms.primary_teacher_id`. Disabled in the popover when no teacher is set. */
  onRemove: () => Promise<void> | void
  isBusy?: boolean
}

export function MainTeacherCard({
  primaryTeacher,
  onSelectTeacher,
  onRemove,
  isBusy = false,
}: MainTeacherCardProps) {
  const { t } = useTranslation('features.institution-admin')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const name = primaryTeacher?.name ?? t('classrooms.detail.mainTeacher.unassigned')
  const email = primaryTeacher?.email || t('classrooms.detail.mainTeacher.noEmail')
  const avatarUrl = primaryTeacher?.avatarUrl ?? null
  const hasTeacher = primaryTeacher !== null

  const handleAssign = () => {
    setIsPopoverOpen(false)
    onSelectTeacher()
  }

  const handleReassign = () => {
    setIsPopoverOpen(false)
    onSelectTeacher()
  }

  const handleRemove = () => {
    setIsPopoverOpen(false)
    void onRemove()
  }

  return (
    <Card variant="soft">
      <CardHeader className="gap-1">
        <CardTitle className="text-base font-semibold">
          {t('classrooms.detail.mainTeacher.title')}
        </CardTitle>
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('classrooms.detail.mainTeacher.description')}
        </Text>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar size="default">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={name}
              />
            ) : null}
            <AvatarFallback>{getInitial(name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <Text
              as="p"
              variant="body"
              className="truncate font-medium"
            >
              {name}
            </Text>
            <Text
              as="p"
              variant="small"
              color="muted"
              className="truncate"
            >
              {email}
            </Text>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Popover
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
            >
              {t('classrooms.detail.mainTeacher.edit')}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-48 p-2"
          >
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                disabled={hasTeacher || isBusy}
                onClick={handleAssign}
              >
                {t('classrooms.detail.mainTeacher.assign')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                disabled={!hasTeacher || isBusy}
                onClick={handleReassign}
              >
                {t('classrooms.detail.mainTeacher.reassign')}
              </Button>
              <Button
                type="button"
                variant="delete"
                size="sm"
                className="justify-start"
                disabled={!hasTeacher || isBusy}
                onClick={handleRemove}
              >
                {t('classrooms.detail.mainTeacher.remove')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  )
}
