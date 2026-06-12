/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { $createParagraphNode, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  ListTodo,
  SmilePlus,
  Table2,
  TvMinimalPlay,
  type LucideIcon,
} from 'lucide-react'

import type { LessonBlockTypeRegistryRow } from '@/features/lesson'

import { OPEN_EMOJI_PICKER_COMMAND } from '../commands/emojiPickerCommands'
import { OPEN_IMAGE_PICKER_COMMAND } from '../commands/imagePickerCommands'
import { OPEN_YOUTUBE_DIALOG_COMMAND } from '../commands/youtubeDialogCommands'
import type { FloatingToolbarFeatures } from '../types/floatingToolbarFeatures'
import { $createCodeNode } from './code-highlight-plugin'

const DEFAULT_TABLE_ROWS = '3'
const DEFAULT_TABLE_COLUMNS = '3'
const DEFAULT_CODE_LANGUAGE = 'typescript'

export const ICON_URLS = {
  bullet: '/img/list-ul.svg',
  h1: '/img/type-h1.svg',
  h2: '/img/type-h2.svg',
  h3: '/img/type-h3.svg',
  number: '/img/list-ol.svg',
  paragraph: '/img/text-paragraph.svg',
  quote: '/img/chat-square-quote.svg',
} as const

export type IconKey = keyof typeof ICON_URLS

interface BlockOptionConfig {
  Icon?: LucideIcon
  iconKey?: IconKey
  keywords?: string[]
  isDisabled?: boolean
  onSelect: () => void
}

export class BlockOption extends MenuOption {
  title: string
  Icon?: LucideIcon
  iconKey?: IconKey
  keywords: string[]
  isDisabled: boolean
  onSelect: () => void

  constructor(
    title: string,
    { Icon, iconKey, keywords = [], isDisabled = false, onSelect }: BlockOptionConfig,
  ) {
    super(title)
    this.title = title
    this.Icon = Icon
    this.iconKey = iconKey
    this.keywords = keywords
    this.isDisabled = isDisabled
    this.onSelect = onSelect
  }
}

export function getBlockOptions(
  editor: LexicalEditor,
  registry?: LessonBlockTypeRegistryRow[],
  features?: Pick<FloatingToolbarFeatures, 'table'>,
): BlockOption[] {
  const pendingRegistryPlugins =
    registry?.filter((row) => row.plugin_key != null && row.plugin_key !== '').length ?? 0
  void pendingRegistryPlugins
  const isTableEnabled = features?.table ?? true

  return [
    new BlockOption('Text', {
      iconKey: 'paragraph',
      keywords: ['paragraph', 'text', 'p', 'normal'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        }),
    }),
    new BlockOption('Heading 1', {
      Icon: Heading1,
      keywords: ['heading', 'title', 'h1'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'))
          }
        }),
    }),
    new BlockOption('Heading 2', {
      Icon: Heading2,
      keywords: ['heading', 'subtitle', 'h2'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'))
          }
        }),
    }),
    new BlockOption('Heading 3', {
      Icon: Heading3,
      keywords: ['heading', 'h3'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'))
          }
        }),
    }),
    new BlockOption('Image', {
      Icon: Image,
      keywords: ['image', 'picture', 'photo', 'media'],
      onSelect: () => editor.dispatchCommand(OPEN_IMAGE_PICKER_COMMAND, undefined),
    }),
    new BlockOption('Emoji', {
      Icon: SmilePlus,
      keywords: ['emoji', 'emoticon', 'smile'],
      onSelect: () => editor.dispatchCommand(OPEN_EMOJI_PICKER_COMMAND, undefined),
    }),
    new BlockOption('Embed YouTube', {
      Icon: TvMinimalPlay,
      keywords: ['youtube', 'embed', 'video'],
      onSelect: () => editor.dispatchCommand(OPEN_YOUTUBE_DIALOG_COMMAND, undefined),
    }),
    new BlockOption('Todo List', {
      Icon: ListTodo,
      keywords: ['todo', 'checklist', 'task', 'checkbox'],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new BlockOption('Table', {
      Icon: Table2,
      keywords: ['table', 'tables', 'grid', 'rows', 'columns'],
      isDisabled: !isTableEnabled,
      onSelect: () =>
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: DEFAULT_TABLE_COLUMNS,
          rows: DEFAULT_TABLE_ROWS,
          includeHeaders: true,
        }),
    }),
    new BlockOption('Bulleted List', {
      iconKey: 'bullet',
      keywords: ['bulleted list', 'unordered list', 'ul'],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new BlockOption('Numbered List', {
      iconKey: 'number',
      keywords: ['numbered list', 'ordered list', 'ol'],
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new BlockOption('Quote', {
      iconKey: 'quote',
      keywords: ['quote', 'blockquote'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode())
          }
        }),
    }),
    new BlockOption('Code Block', {
      Icon: Code,
      keywords: ['code', 'codeblock', 'snippet', 'pre', 'syntax'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode(DEFAULT_CODE_LANGUAGE))
          }
        }),
    }),
  ]
}
