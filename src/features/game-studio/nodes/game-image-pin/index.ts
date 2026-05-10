import { MapPin } from 'lucide-react'

import { GAME_FEATURE_KEY_GAME_IMAGE_PIN } from '../../constants/gameFeatureKeys'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameImagePinNode } from './GameImagePinNode'
import { GameImagePinDialog } from './GameImagePinDialog'
import {
  GAME_IMAGE_PIN_TYPE,
  gameImagePinDefaultConfig,
  validateGameImagePinConfig,
} from './game-image-pin.schema'

export const gameImagePinEntry: GameNodeRegistryEntry = {
  type: GAME_IMAGE_PIN_TYPE,
  label: 'Image Pin',
  category: 'games',
  accent: 'blue',
  Icon: MapPin,
  NodeComponent: GameImagePinNode,
  DialogComponent: GameImagePinDialog,
  defaultConfig: gameImagePinDefaultConfig,
  validateConfig: validateGameImagePinConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: true,
  featureKey: GAME_FEATURE_KEY_GAME_IMAGE_PIN,
}

export { GameImagePinNode } from './GameImagePinNode'
export { GameImagePinDialog } from './GameImagePinDialog'
export type { GameImagePinNodeData, ImagePinSquare } from './game-image-pin.schema'
