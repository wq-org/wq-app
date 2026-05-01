import { useTranslation } from 'react-i18next'
import type { TabItem } from '@/components/shared'
import { SelectTabs } from '@/components/shared'
import { DashboardHeader } from '@/features/dashboard'
import { ProfileFollowActions } from './ProfileFollowActions'
import { ProfileMetaRow } from './ProfileMetaRow'

export type ProfileDashboardLayoutProps = {
  imageUrl?: string
  userName: string
  username?: string
  description: string
  children?: React.ReactNode
  role: string
  email?: string
  linkedInUrl?: string
  institutionName?: string
  institutionSlug?: string
  followCount?: number
  followedTeacherCount?: number
  onViewFollowerList?: () => void
  handleFollowClick?: () => void
  connectButtonLabel?: string
  tabs: readonly TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

export function ProfileDashboardLayout({
  imageUrl,
  userName,
  username,
  description,
  children,
  role,
  email = '',
  linkedInUrl,
  institutionName,
  institutionSlug,
  followCount,
  followedTeacherCount,
  onViewFollowerList,
  handleFollowClick,
  connectButtonLabel,
  tabs,
  activeTabId,
  onTabChange,
}: ProfileDashboardLayoutProps) {
  const { t: tTeacher } = useTranslation('features.teacher')
  const normalizedRole = role.toLowerCase()

  return (
    <div className="min-h-0 bg-background text-foreground">
      <section>
        <DashboardHeader
          imageUrl={imageUrl}
          userName={userName}
          username={username}
          description={description}
        />

        <div className="container pb-4">
          <ProfileMetaRow
            role={normalizedRole}
            followCount={followCount}
            followedTeacherCount={followedTeacherCount}
            onViewFollowerList={onViewFollowerList}
            institutionName={institutionName ?? tTeacher('meta.institutionFallbackName')}
            institutionSlug={institutionSlug}
            userEmail={email}
            linkedInUrl={linkedInUrl}
          />
        </div>

        <ProfileFollowActions
          userName={userName}
          handleFollowClick={handleFollowClick}
          connectButtonLabel={connectButtonLabel}
        />
      </section>

      <section className="min-h-[560px] bg-muted pb-8 pt-8">
        <div className="container flex h-full min-h-0 flex-col gap-8">
          <SelectTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={onTabChange}
          />
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </section>
    </div>
  )
}
