import { useEffect, useState } from 'react'
import AppWrapper from '@/components/layout/AppWrapper'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import EmptyProjectsView from '@/features/game-studio/components/EmptyProjectsView'
import GameProjectCardList from '@/features/game-studio/components/GameProjectCardList'
import type { GameProjectCardListProps } from '@/features/game-studio/types/game-studio.types'
import { Button } from '@/components/ui/button'
import { createGameForStudio, getTeacherFlowGames } from '@/features/game-studio/api/gameStudioApi'
import { toast } from 'sonner'
import DotWaveLoader from '@/components/shared/loaders/DotWaveLoader'
import { Text } from '@/components/ui/text'

export default function GameStudio() {
  const navigate = useNavigate()
  const { getUserId } = useUser()
  const [projects, setProjects] = useState<
    GameProjectCardListProps['projects']
  >([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const teacherId = getUserId()
    if (!teacherId) {
      setLoading(false)
      return
    }
    getTeacherFlowGames(teacherId)
      .then((data) => {
        setProjects(
          data.map((g) => ({
            id: g.id,
            title: g.title || 'Untitled Game',
            description: g.description ?? 'No description',
            version: g.version ?? undefined,
            status: g.status === 'published' ? 'published' : 'draft',
          })),
        )
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load games')
      })
      .finally(() => setLoading(false))
  }, [getUserId])

  const handleCreateGame = async () => {
    const teacherId = getUserId()
    if (!teacherId) {
      toast.error('You must be signed in to create a game')
      return
    }
    setCreating(true)
    try {
      const created = await createGameForStudio(teacherId, {
        title: 'Untitled Game',
        description: '',
      })
      navigate(`/teacher/canvas/${created.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create game')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppWrapper
      className="flex flex-col gap-12"
      role="teacher"
    >
      <div className="flex flex-col gap-2">
        <Text
          as="h1"
          variant="h1"
          className="text-6xl"
        >
          Game Studio
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-gray-500 mt-2"
        >
          Create and manage educational games for your students.
        </Text>
        <div className="flex justify-end w-full">
          <Button
            onClick={handleCreateGame}
            variant="default"
            disabled={creating || loading}
          >
            {creating ? 'Creating…' : 'Create game'}
          </Button>
        </div>
      </div>
      <div className="pb-14">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <DotWaveLoader
              variant="default"
              size={48}
            />
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjectsView />
        ) : (
          <GameProjectCardList
            projects={projects}
            onOpen={(id) => navigate(`/teacher/canvas/${id}`)}
          />
        )}
      </div>
    </AppWrapper>
  )
}
