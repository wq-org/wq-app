export const LESSON_GUIDES = [
  {
    value: 'learning-goal',
    label: 'Learning Goal',
    description:
      'Click inside the text editor first, then start with one or two sentences that explain what the learner should understand or be able to do by the end of this lesson.',
  },
] as const

export type LessonGuideValue = (typeof LESSON_GUIDES)[number]['value']
