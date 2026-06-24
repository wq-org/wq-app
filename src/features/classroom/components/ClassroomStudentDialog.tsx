import { MessagesSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { isPlatformMessagingChatEnabled } from '@/lib/platformFeatures'

import type { ClassroomStudent } from '../types/classroom.types'
import { getStudentDisplayLabel, getStudentInitial } from '../utils/classroomStudent.utils'

type ClassroomStudentDialogProps = {
  student: ClassroomStudent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClassroomStudentDialog({
  student,
  open,
  onOpenChange,
}: ClassroomStudentDialogProps) {
  const { t } = useTranslation(['features.teacher', 'common'])
  const navigate = useNavigate()
  const { url: avatarUrl } = useAvatarUrl(student?.avatarUrl)
  const showChat = isPlatformMessagingChatEnabled()

  const displayLabel = student ? getStudentDisplayLabel(student) : ''
  const displayName = student?.displayName?.trim() || null
  const username = student?.username?.trim() || null
  const title = displayName || username || student?.name || ''
  const usernameLine = displayName && username ? `@${username}` : null
  const bio =
    student?.description?.trim() ||
    student?.email?.trim() ||
    t('pages.classroomDetail.sections.studentsNoBio')

  const handleOpenChat = () => {
    onOpenChange(false)
    navigate('/teacher/chat')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="gap-0 p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            aria-label={t('buttons.close', { ns: 'common' })}
          >
            <X
              className="size-4"
              aria-hidden
            />
          </Button>
        </DialogClose>

        <DialogHeader className="gap-0 p-6 pb-4">
          {student ? (
            <div className="flex items-start gap-4 pr-8">
              <Avatar size="lg">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayLabel}
                  />
                ) : null}
                <AvatarFallback>{getStudentInitial(displayLabel)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1.5">
                <DialogTitle asChild>
                  <Text
                    as="p"
                    variant="body"
                    className="text-lg font-semibold leading-tight tracking-tight"
                  >
                    {title}
                  </Text>
                </DialogTitle>
                {usernameLine ? (
                  <Text
                    as="p"
                    variant="small"
                    muted
                    className="leading-none"
                  >
                    {usernameLine}
                  </Text>
                ) : null}
                <DialogDescription asChild>
                  <Text
                    as="p"
                    variant="small"
                    muted
                    className="leading-snug"
                  >
                    {bio}
                  </Text>
                </DialogDescription>
              </div>
            </div>
          ) : null}
        </DialogHeader>

        {showChat ? (
          <>
            <Separator />

            <DialogFooter className="p-4 sm:justify-start">
              <Button
                type="button"
                variant="ghost"
                size="icon-xl"
                className="rounded-full"
                aria-label={t('pages.classroomDetail.sections.studentsOpenChat')}
                onClick={handleOpenChat}
              >
                <MessagesSquare
                  className="size-5"
                  aria-hidden
                />
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
