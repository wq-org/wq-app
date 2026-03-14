import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppNavigation } from '@/components/layout'
import { getDashboardTabs } from '../config/dashboardTabs'
import type { DashboardRole, DashboardTab } from '../types/dashboard.types'
import { DashboardActions } from './DashboardActions'
import { DashboardContent } from './DashboardContent'
import { DashboardBadgeRow } from './DashboardBadgeRow'
import { DashboardHeader } from './DashboardHeader'
import { DashboardTabs } from './DashboardTabs'

export type LearningDashboardShellProps = {
  imageUrl?: string
  userName: string
  username?: string
  description: string
  children?: React.ReactNode
  role: DashboardRole | string
  email?: string
  linkedInUrl?: string
  handleFollowClick?: () => void
  connectButtonLabel?: string
  onClickTab?: (tabId: string) => void
  institutionName?: string
  institutionSlug?: string
  followCount?: number
  followedTeacherCount?: number
  customTabs?: DashboardTab[]
  onViewFollowerList?: () => void
}

export function LearningDashboardShell({
  imageUrl,
  userName,
  username,
  description,
  children,
  role,
  email = '',
  linkedInUrl,
  handleFollowClick,
  connectButtonLabel,
  onClickTab,
  institutionName,
  institutionSlug,
  followCount,
  followedTeacherCount,
  customTabs,
  onViewFollowerList,
}: LearningDashboardShellProps) {
  const [activeTab, setActiveTab] = useState('courses')
  const { t: tTeacher } = useTranslation('features.teacher')
  const { t: tLayout } = useTranslation('layout.dashboardLayout')
  const normalizedRole = role.toLowerCase()
  const defaultTabs = getDashboardTabs(role)
  const dashboardTabs = customTabs || defaultTabs
  const translatedTabs = useMemo(
    () =>
      dashboardTabs.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        title: tLayout(tab.labelKey),
      })),
    [dashboardTabs, tLayout],
  )

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    onClickTab?.(tabId)
  }

  return (
    <div>
      <AppNavigation />

      <div className="flex flex-col">
        <section className="rounded-2xl h-full">
          <DashboardHeader
            imageUrl={imageUrl}
            userName={userName}
            username={username}
            description={description}
          />

          <div className="container pb-4">
            <DashboardBadgeRow
              role={normalizedRole}
              followCount={followCount}
              followedTeacherCount={followedTeacherCount}
              onViewFollowerList={onViewFollowerList}
              institutionName={institutionName || tTeacher('meta.institutionFallbackName')}
              institutionSlug={institutionSlug}
              userEmail={email}
              linkedInUrl={linkedInUrl}
            />
          </div>

          <DashboardActions
            userName={userName}
            handleFollowClick={handleFollowClick}
            connectButtonLabel={connectButtonLabel}
          />

          <section className="pt-8 rounded-2xl bg-muted-foreground/10 min-h-[560px] pb-8">
            <div className="container h-full min-h-0 flex flex-col gap-8">
              <div className="flex flex-wrap justify-between  items-center">
                <DashboardTabs
                  tabs={translatedTabs}
                  activeTabId={activeTab}
                  onTabChange={handleTabClick}
                />
              </div>

              <DashboardContent>{children}</DashboardContent>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
