import { createLessonTextBlock } from './lessonPages'

export function createLessonStarterContentObject(): Record<string, unknown> {
  const blocks = [
    createLessonTextBlock('HeadingOne', 'Lesson Title', 0),
    createLessonTextBlock('Paragraph', 'Add a short introduction to this lesson.', 1),
    createLessonTextBlock('BulletedList', 'Write one important takeaway here.', 2),
  ]

  return Object.fromEntries(
    blocks.map((block) => [block.id, block as unknown as Record<string, unknown>]),
  )
}

export function createLessonStarterContentJson(): string {
  return JSON.stringify(createLessonStarterContentObject())
}
