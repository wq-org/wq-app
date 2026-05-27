import { MessageCircleQuestion } from 'lucide-react'

import { GAME_FEATURE_KEY_OPEN_QUESTION } from '../../constants/gameFeatureKeys'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { OpenQuestionDialog, OpenQuestionNode } from './components'
import { GAME_OPEN_QUESTION_TYPE, gameOpenQuestionDefaultConfig } from './constants'
import { validateOpenQuestionConfig } from './utils'

export const gameOpenQuestionEntry: GameNodeRegistryEntry = {
  type: GAME_OPEN_QUESTION_TYPE,
  label: 'Open question',
  category: 'games',
  accent: 'blue',
  Icon: MessageCircleQuestion,
  NodeComponent: OpenQuestionNode,
  DialogComponent: OpenQuestionDialog,
  defaultConfig: gameOpenQuestionDefaultConfig,
  validateConfig: validateOpenQuestionConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: true,
  featureKey: GAME_FEATURE_KEY_OPEN_QUESTION,
}

export { OpenQuestionDialog, OpenQuestionNode } from './components'
export {
  GAME_OPEN_QUESTION_TYPE,
  GAME_OPEN_QUESTION_DEFAULT_POINTS,
  gameOpenQuestionDefaultConfig,
} from './constants'
export type { GameOpenQuestionNodeData } from './types'
export {
  validateOpenQuestionConfig,
  resolveGameOpenQuestionPoints,
  buildOpenQuestionScoreBreakdown,
} from './utils'
export type { OpenQuestionScoreBreakdown } from './utils'
