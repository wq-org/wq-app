import type { ThemeId } from '@/lib/themes'
import { EmptyLessonsView } from '@/features/course'
import type { Lesson } from '../types/lesson.types'
import { LessonCard } from './LessonCard'

export interface LessonCardListProps {
  lessons: Lesson[]
  themeId?: ThemeId
  onLessonOpen?: (lessonId: string) => void
}

export function LessonCardList({ lessons, themeId, onLessonOpen }: LessonCardListProps) {
  if (lessons.length === 0) {
    return <EmptyLessonsView />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          themeId={themeId}
          onOpen={onLessonOpen}
        />
      ))}
    </div>
  )
}
