import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FollowersDrawer } from '@/components/shared'
import { getTeacherFollowers, ProfileListItem, type FollowProfileSummary } from '@/features/profile'

export interface TeacherFollowersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeacherFollowersDrawer({ open, onOpenChange }: TeacherFollowersDrawerProps) {
  const { t } = useTranslation('features.teacher')
  const [followers, setFollowers] = useState<FollowProfileSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let isCancelled = false

    async function loadFollowers() {
      setIsLoading(true)

      try {
        const nextFollowers = await getTeacherFollowers()

        if (!isCancelled) {
          setFollowers(nextFollowers)
        }
      } catch (error) {
        console.error('Failed to load followers:', error)

        if (!isCancelled) {
          setFollowers([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadFollowers()

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
      isEmpty={followers.length === 0}
    >
      {followers.map((follower) => (
        <ProfileListItem
          key={follower.user_id}
          title={
            follower.display_name?.trim() ||
            follower.username?.trim() ||
            t('followersDrawer.studentFallback')
          }
          email={follower.username ? `@${follower.username}` : null}
          avatarPath={follower.avatar_url}
          roleLabel={t('followersDrawer.studentRoleLabel')}
        />
      ))}
    </FollowersDrawer>
  )
}
