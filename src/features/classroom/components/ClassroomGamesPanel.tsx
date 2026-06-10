import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingPage } from '@/components/shared'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { Gamepad2 } from 'lucide-react'

import { useClassroomGames } from '../hooks/useClassroomGames'
import { ClassroomGameCardList } from './ClassroomGameCardList'

const GAME_TITLE_SEARCH_FIELDS = ['title'] as const

type ClassroomGamesPanelProps = {
  classroomId: string
  parentLoading?: boolean
}

export function ClassroomGamesPanel({
  classroomId,
  parentLoading = false,
}: ClassroomGamesPanelProps) {
  const { t } = useTranslation('features.teacher')
  const [searchQuery, setSearchQuery] = useState('')
  const { games, loading, error } = useClassroomGames(classroomId)

  const filteredGames = useSearchFilter(games, searchQuery, GAME_TITLE_SEARCH_FIELDS)

  const emptyMessage = useMemo(() => {
    if (searchQuery.trim()) {
      return t('pages.classroomDetail.sections.gamesNoMatches')
    }
    return t('pages.classroomDetail.sections.gamesEmpty')
  }, [searchQuery, t])

  if (parentLoading || loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.classroomDetail.sections.gamesLoading')}
        size={72}
      />
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-sm text-destructive"
      >
        {t('pages.classroomDetail.sections.gamesLoadError')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        label={t('pages.classroomDetail.sections.gamesSearchLabel')}
        placeholder={t('pages.classroomDetail.sections.gamesSearchPlaceholder')}
        labelVisibility="sr-only"
        showSearchIcon
        size="compact"
        className="max-w-md"
      />

      {filteredGames.length === 0 ? (
        <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gamepad2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{emptyMessage}</EmptyTitle>
            <EmptyDescription>
              {t('pages.classroomDetail.sections.gamesEmptyDescription')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ClassroomGameCardList
          classroomId={classroomId}
          games={filteredGames}
        />
      )}
    </div>
  )
}
