import type { OpenQuestionAuthoredQuestion } from '../types/open-question.schema'

/** Normalizes legacy `{ text }` rows and ensures `question` / `answer` strings exist. */
export function normalizeAuthoredQuestion(
  raw: OpenQuestionAuthoredQuestion,
): OpenQuestionAuthoredQuestion {
  const legacyText = typeof raw.text === 'string' ? raw.text : ''
  const question =
    typeof raw.question === 'string' && raw.question.trim().length > 0 ? raw.question : legacyText
  const answer = typeof raw.answer === 'string' ? raw.answer : ''

  return {
    id: raw.id,
    question,
    answer,
  }
}

export function normalizeAuthoredQuestions(
  questions: readonly OpenQuestionAuthoredQuestion[] | undefined,
): OpenQuestionAuthoredQuestion[] {
  if (!Array.isArray(questions)) return []
  return questions.map(normalizeAuthoredQuestion)
}

/** Stable shape written to React Flow `node.data` (no legacy `text` field). */
export function serializeAuthoredQuestionsForPersistence(
  questions: readonly OpenQuestionAuthoredQuestion[],
): OpenQuestionAuthoredQuestion[] {
  return normalizeAuthoredQuestions(questions).map(({ id, question, answer }) => ({
    id,
    question,
    answer,
  }))
}
