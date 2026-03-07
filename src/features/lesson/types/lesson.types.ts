export interface Lesson {
  id: string
  title: string
  content: string
  topic_id: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface CreateLessonData {
  title: string
  content: string
  topic_id: string
  description: string
}
