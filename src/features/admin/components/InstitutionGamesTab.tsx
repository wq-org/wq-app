import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  GameCardList,
  type GameCatalogItem,
  toGameCatalogCardProps,
  useGameCatalog,
} from '@/features/game-studio'
import { useSearchFilter } from '@/hooks/useSearchFilter'

type InstitutionGamesTabProps = {
  institutionId: string
}

type SearchableInstitutionGame = {
  game: GameCatalogItem
  title: string
  description: string
  teacher: string
  status: string
  type: string
}

const GAME_SEARCH_FIELDS = ['title', 'description', 'teacher', 'status', 'type'] as const

export function InstitutionGamesTab({ institutionId }: InstitutionGamesTabProps) {
  const { t } = useTranslation('features.admin')
  const navigate = useNavigate()
  const { games, isLoading, error } = useGameCatalog({ institutionId })
  const [searchQuery, setSearchQuery] = useState('')

  const searchableGames = useMemo<SearchableInstitutionGame[]>(
    () =>
      games.map((game) => ({
        game,
        title: game.title,
        description: game.description ?? '',
        teacher: game.teacherProfile?.display_name ?? '',
        status: game.status,
        type: game.gameType,
      })),
    [games],
  )

  const filteredGames = useSearchFilter(searchableGames, searchQuery, GAME_SEARCH_FIELDS).map(
    ({ game }) => game,
  )
  const gameCards = filteredGames.map((game) =>
    toGameCatalogCardProps(game, {
      route: `/super_admin/games/${game.id}`,
      button: t('games.cardButton', { defaultValue: 'Open' }),
      fallbackDescription: t('games.noDescription', { defaultValue: 'No description' }),
    }),
  )

  const showSearch = !isLoading && !error && games.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Text
          as="h2"
          variant="h3"
          className="text-xl font-semibold"
        >
          {t('institutions.details.games.title')}
        </Text>
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('institutions.details.games.description')}
        </Text>
      </div>

      {showSearch ? (
        <div className="flex flex-col gap-2">
          <FieldInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            label={t('institutions.details.games.searchLabel')}
            placeholder={t('institutions.details.games.searchPlaceholder')}
            showSearchIcon
            className="max-w-md"
          />
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('institutions.details.games.count', {
              shown: filteredGames.length,
              total: games.length,
            })}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      ) : error ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Gamepad2 />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('institutions.details.games.errorTitle')}</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : games.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Gamepad2 />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('institutions.details.games.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('institutions.details.games.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredGames.length === 0 ? (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('institutions.details.games.noMatches')}
        </Text>
      ) : (
        <GameCardList
          games={gameCards}
          onGamePlay={(route) => {
            if (route) navigate(route)
          }}
        />
      )}
    </div>
  )
}
