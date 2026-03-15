import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FollowersDrawer } from '@/components/shared'
import {
  getFollowedTeacherProfiles,
  ProfileListItem,
  type FollowProfileSummary,
} from '@/features/profiles'

export interface StudentFollowersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentFollowersDrawer({ open, onOpenChange }: StudentFollowersDrawerProps) {
  const { t } = useTranslation('features.student')
  const [teachers, setTeachers] = useState<FollowProfileSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let isCancelled = false

    async function loadTeachers() {
      setIsLoading(true)

      try {
        const nextTeachers = await getFollowedTeacherProfiles()

        if (!isCancelled) {
          setTeachers(nextTeachers)
        }
      } catch (error) {
        console.error('Failed to load followed teachers:', error)

        if (!isCancelled) {
          setTeachers([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTeachers()

    return () => {
      isCancelled = true
    }
  }, [open])

  return (
    <FollowersDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('followersDrawer.title')}
      closeLabel={t('followersDrawer.close')}
      loadingLabel={t('followersDrawer.loading')}
      emptyLabel={t('followersDrawer.empty')}
      isLoading={isLoading}
      isEmpty={teachers.length === 0}
    >
      {teachers.map((teacher) => (
        <ProfileListItem
          key={teacher.user_id}
          title={
            teacher.display_name?.trim() ||
            teacher.username?.trim() ||
            t('followersDrawer.teacherFallback')
          }
          email={teacher.username ? `@${teacher.username}` : null}
          avatarPath={teacher.avatar_url}
          roleLabel={t('followersDrawer.teacherRoleLabel')}
        />
      ))}
    </FollowersDrawer>
  )
}
