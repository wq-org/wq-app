import { MapPin } from 'lucide-react'

import { GAME_FEATURE_KEY_GAME_IMAGE_PIN } from '../../constants/gameFeatureKeys'
import type {
  GameNodePreviewComponent,
  GameNodeRegistryEntry,
} from '../_registry/game-node-registry.types'
import { ImagePinDialog, ImagePinNode, ImagePinPreview } from './components'
import {
  GAME_IMAGE_PIN_TYPE,
  gameImagePinDefaultConfig,
  validateGameImagePinConfig,
} from './image-pin.schema'

export const gameImagePinEntry: GameNodeRegistryEntry = {
  type: GAME_IMAGE_PIN_TYPE,
  label: 'Image Pin',
  category: 'games',
  accent: 'blue',
  Icon: MapPin,
  NodeComponent: ImagePinNode,
  DialogComponent: ImagePinDialog,
  PreviewComponent: ImagePinPreview as unknown as GameNodePreviewComponent,
  defaultConfig: gameImagePinDefaultConfig,
  validateConfig: validateGameImagePinConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: true,
  featureKey: GAME_FEATURE_KEY_GAME_IMAGE_PIN,
}

export { ImagePinDialog, ImagePinNode } from './components'
export type { GameImagePinNodeData, GameImagePinRect } from './image-pin.schema'
