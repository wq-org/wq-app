import { LessonCard } from './LessonCard'
import type { Lesson } from '../types/lesson.types'

interface LessonCardListProps {
  lessons: Lesson[]
  onView?: (lessonId: string) => void
}

export function LessonCardList({ lessons, onView }: LessonCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson, index) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          index={index}
          onView={onView}
        />
      ))}
    </div>
  )
}
