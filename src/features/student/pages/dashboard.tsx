import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import Spinner from '@/components/ui/spinner'
import { EmptyCourseView, EmptyGamesView, EmptyTodosView } from '@/features/student'

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const { profile, loading } = useUser()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="xl"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <>
      <DashboardLayout
        imageUrl={signedAvatarUrl || undefined}
        userName={profile?.display_name || 'Student'}
        username={profile?.username || undefined}
        email={profile?.email || undefined}
        linkedInUrl={profile?.linkedin_url || undefined}
        description={profile?.description || 'Welcome to your dashboard'}
        role="student"
        onClickTab={handleClickTab}
      >
        {selectedTab === 'courses' && <EmptyCourseView />}
        {selectedTab === 'games' && <EmptyGamesView />}
        {selectedTab === 'todos' && <EmptyTodosView />}
      </DashboardLayout>

      <CommandPalette commandBarContext="student" />
    </>
  )
}
