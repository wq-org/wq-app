import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/layout'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import {
  EmptyProjectsView,
  GameProjectCardList,
  createGameForStudio,
  getTeacherFlowGames,
  type GameProjectCardListProps,
} from '@/features/game-studio'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useSearchFilter } from '@/hooks/useSearchFilter'

const GameStudio = () => {
  const { t } = useTranslation('features.gameStudio')
  const navigate = useNavigate()
  const { getUserId } = useUser()
  const [projects, setProjects] = useState<GameProjectCardListProps['projects']>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
            themeId: g.theme_id,
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

  const searchableProjects = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        title: p.title ?? '',
        description: p.description ?? '',
      })),
    [projects],
  )

  const filteredProjects = useSearchFilter(searchableProjects, searchQuery, [
    'title',
    'description',
  ])

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

  const showSearchAndList = !loading && projects.length > 0

  return (
    <AppShell
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
      role="teacher"
    >
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <Text
              as="h1"
              variant="h1"
            >
              {t('page.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              muted
            >
              {t('page.subtitle')}
            </Text>
          </div>
        </div>

        <div className="flex w-full justify-end">
          <Button
            type="button"
            size="xl"
            onClick={handleCreateGame}
            variant="darkblue"
            disabled={creating || loading}
            className="gap-2 active:animate-in active:zoom-in-95"
          >
            <Plus className="size-4" />
            {creating ? t('page.creating') : t('page.createGame')}
          </Button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner
                variant="gray"
                size="lg"
              />
            </div>
          ) : projects.length === 0 ? (
            <EmptyProjectsView
              onCreateGame={handleCreateGame}
              disableCreate={creating || loading}
            />
          ) : null}

          {showSearchAndList ? (
            <div className="flex flex-col gap-6">
              <FieldInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                label={t('page.searchLabel')}
                placeholder={t('page.searchPlaceholder')}
                className="max-w-md"
              />
              {filteredProjects.length === 0 ? (
                <Text
                  as="p"
                  variant="body"
                  className="text-sm text-muted-foreground"
                >
                  {t('page.noMatches')}
                </Text>
              ) : (
                <GameProjectCardList
                  projects={filteredProjects}
                  onOpen={(id) => navigate(`/teacher/canvas/${id}`)}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

export { GameStudio }
