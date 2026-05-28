import type {
  GameOpenQuestionNodeData,
  OpenQuestionAuthoredQuestion,
} from '../types/open-question.schema'
import { serializeAuthoredQuestionsForPersistence } from './normalizeOpenQuestion'

export type PersistOpenQuestionExercisesPatch = Pick<
  GameOpenQuestionNodeData,
  'questions' | 'activeExerciseId'
>

/**
 * Builds a node patch for exercise tabs — always serializes `question` + `answer`
 * so autosave persists a clean JSON shape on the canvas node.
 */
export function buildPersistOpenQuestionExercisesPatch(
  questions: readonly OpenQuestionAuthoredQuestion[],
  activeExerciseId: string,
): PersistOpenQuestionExercisesPatch {
  return {
    questions: serializeAuthoredQuestionsForPersistence(questions),
    activeExerciseId,
  }
}
