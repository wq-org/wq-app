import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'

import type { StudentTeacherSummary } from '../api/studentCourseDeliveriesApi'

type TeacherProfileDialogProps = {
  teacher: StudentTeacherSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeacherProfileDialog({ teacher, open, onOpenChange }: TeacherProfileDialogProps) {
  const { t } = useTranslation('features.student')
  const { url: avatarUrl } = useAvatarUrl(teacher?.avatarUrl)

  const displayName = teacher?.name?.trim() || null
  const username = teacher?.username?.trim() || null
  const usernameLine = username ? `@${username}` : null
  const bio = teacher?.bio?.trim() || t('dashboard.sections.teachers.noBio')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="gap-0 p-6 pb-4">
          {teacher ? (
            <div className="flex items-start gap-4 pr-8">
              <Avatar size="lg">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName ?? teacher.initials}
                  />
                ) : null}
                <AvatarFallback>{teacher.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1.5">
                <DialogTitle asChild>
                  <Text
                    as="p"
                    variant="body"
                    className="text-lg font-semibold leading-tight tracking-tight"
                  >
                    {displayName}
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
      </DialogContent>
    </Dialog>
  )
}
