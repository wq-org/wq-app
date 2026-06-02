import { createCommand, type NodeKey } from 'lexical'

import type { DomRectSnapshot } from '../utils/emojiPickerPosition'

export const OPEN_IMAGE_PICKER_COMMAND = createCommand<void>('OPEN_IMAGE_PICKER_COMMAND')

export type { DomRectSnapshot } from '../utils/emojiPickerPosition'

export type OpenImageReplacePickerPayload = {
  nodeKey: NodeKey
  anchorRect: DomRectSnapshot
}

export const OPEN_IMAGE_REPLACE_PICKER_COMMAND = createCommand<OpenImageReplacePickerPayload>(
  'OPEN_IMAGE_REPLACE_PICKER_COMMAND',
)
