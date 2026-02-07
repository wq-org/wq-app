import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeacherFlowGames } from '@/features/game-studio/api/gameStudioApi'
import type { GameForStudio } from '@/features/game-studio/api/gameStudioApi'
import { GameCard } from './GameCard'
import Spinner from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import EmptyGamesView from '@/features/student/components/EmptyGamesView'

export function GamePlayList() {
  const [games, setGames] = useState<GameForStudio[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { getUserId } = useUser()

  const loadGames = useCallback(async () => {
    const teacherId = getUserId()
    if (!teacherId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await getTeacherFlowGames(teacherId)
      const publishedOnly = list.filter((game) => game.status === 'published')
      setGames(publishedOnly)
    } catch (err) {
      console.error('Failed to fetch teacher games:', err)
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [getUserId])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  const handlePlay = (gameId: string) => {
    navigate(`/play/${gameId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  if (games.length === 0) {
    return <EmptyGamesView />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          id={game.id}
          title={game.title || 'Untitled Game'}
          description={game.description || 'No description'}
          version={game.version ?? undefined}
          status="published"
          onPlay={() => handlePlay(game.id)}
        />
      ))}
    </div>
  )
}
