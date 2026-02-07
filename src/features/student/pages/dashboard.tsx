import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { getPublishedGamesFromFollowedTeachers } from '@/features/game-studio/api/gameStudioApi'
import GameCardList from '@/features/game-studio/components/GameCardList'
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import Spinner from '@/components/ui/spinner'
import { EmptyCourseView, EmptyGamesView, EmptyTodosView } from '@/features/student'

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const navigate = useNavigate()
  const { profile, loading } = useUser()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

  useEffect(() => {
    if (!profile?.user_id || selectedTab !== 'games') return
    let cancelled = false
    setGamesLoading(true)
    getPublishedGamesFromFollowedTeachers()
      .then((data) => {
        if (!cancelled) setGames(data)
      })
      .catch(() => {
        if (!cancelled) setGames([])
      })
      .finally(() => {
        if (!cancelled) setGamesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [profile?.user_id, selectedTab])

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
        {selectedTab === 'games' &&
          (gamesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner
                variant="gray"
                size="lg"
                speed={1750}
              />
            </div>
          ) : games.length === 0 ? (
            <EmptyGamesView />
          ) : (
            <GameCardList
              games={games}
              onGamePlay={(route) => route && navigate(route)}
            />
          ))}
        {selectedTab === 'todos' && <EmptyTodosView />}
      </DashboardLayout>

      <CommandPalette commandBarContext="student" />
    </>
  )
}
