import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { ClassroomGamePlayPanel, PublishedCoursePageShell } from '@/features/classroom'

export function ClassroomGamePlayPage() {
  const { t } = useTranslation('features.teacher')
  const { classroomId, gameId } = useParams<{ classroomId: string; gameId: string }>()

  const trimmedClassroomId = classroomId?.trim()
  const trimmedGameId = gameId?.trim()

  if (!trimmedClassroomId || !trimmedGameId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('pages.classroomGamePlay.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell layout="fullBleed">
      <div className="container flex h-[calc(100dvh-5rem)] min-h-0 flex-col py-4">
        <ClassroomGamePlayPanel
          classroomId={trimmedClassroomId}
          gameId={trimmedGameId}
        />
      </div>
    </PublishedCoursePageShell>
  )
}
