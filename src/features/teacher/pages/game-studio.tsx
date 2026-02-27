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
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

export default function GameStudio() {
  const { t } = useTranslation('features.gameStudio')
  const navigate = useNavigate()
  const { getUserId } = useUser()
  const [projects, setProjects] = useState<GameProjectCardListProps['projects']>([])
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
            title: g.title || t('page.fallbackUntitledGame'),
            description: g.description ?? t('page.fallbackNoDescription'),
            version: g.version ?? undefined,
            status: g.status === 'published' ? 'published' : 'draft',
          })),
        )
      })
      .catch((err) => {
        console.error(err)
        toast.error(t('page.toasts.loadFailed'))
      })
      .finally(() => setLoading(false))
  }, [getUserId, t])

  const handleCreateGame = async () => {
    const teacherId = getUserId()
    if (!teacherId) {
      toast.error(t('page.toasts.createRequiresSignin'))
      return
    }
    setCreating(true)
    try {
      const created = await createGameForStudio(teacherId, {
        title: t('page.fallbackUntitledGame'),
        description: '',
      })
      navigate(`/teacher/canvas/${created.id}`)
    } catch (err) {
      console.error(err)
      toast.error(t('page.toasts.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppWrapper
      className="flex flex-col gap-12 animate-in fade-in-0 slide-in-from-bottom-4"
      role="teacher"
    >
      <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-3">
        <Text
          as="h1"
          variant="h1"
          className="text-6xl"
        >
          {t('page.title')}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-gray-500 mt-2"
        >
          {t('page.subtitle')}
        </Text>
        <div className="flex justify-end w-full">
          <Button
            onClick={handleCreateGame}
            variant="darkblue"
            disabled={creating || loading}
            className="active:animate-in active:zoom-in-95"
          >
            <Plus size="4" />
            {creating ? t('page.creating') : t('page.createGame')}
          </Button>
        </div>
      </div>
      <div className="pb-14 animate-in fade-in-0 slide-in-from-bottom-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="lg"
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
