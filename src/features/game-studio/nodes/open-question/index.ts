import { MessageCircleQuestion } from 'lucide-react'

import { GAME_FEATURE_KEY_OPEN_QUESTION } from '../../constants/gameFeatureKeys'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameOpenQuestionDialog } from './GameOpenQuestionDialog'
import { GameOpenQuestionNode } from './GameOpenQuestionNode'
import {
  GAME_OPEN_QUESTION_TYPE,
  gameOpenQuestionDefaultConfig,
  validateGameOpenQuestionConfig,
} from './open-question.schema'

export const gameOpenQuestionEntry: GameNodeRegistryEntry = {
  type: GAME_OPEN_QUESTION_TYPE,
  label: 'Open question',
  category: 'games',
  accent: 'blue',
  Icon: MessageCircleQuestion,
  NodeComponent: GameOpenQuestionNode,
  DialogComponent: GameOpenQuestionDialog,
  defaultConfig: gameOpenQuestionDefaultConfig,
  validateConfig: validateGameOpenQuestionConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: true,
  featureKey: GAME_FEATURE_KEY_OPEN_QUESTION,
}

export { GameOpenQuestionDialog } from './GameOpenQuestionDialog'
export { GameOpenQuestionNode } from './GameOpenQuestionNode'
export type { GameOpenQuestionNodeData } from './open-question.schema'
