export interface Lesson {
  id: string
  title: string
  content: string
  topic_id: string
  description: string
}

export interface CreateLessonData {
  title: string
  content: string
  topic_id: string
  description: string
}

export interface LessonCardProps {
  lesson: Lesson
  index: number
  onView?: (lessonId: string) => void
}
