/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical'
import { Image, type LucideIcon } from 'lucide-react'

import type { LessonBlockTypeRegistryRow } from '@/features/lesson'

import { $createImageNode } from '../nodes/ImageNode'
import { readImageFileAsDataUrl } from '../utils/localImageFile'

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
  onSelect: () => void
}

export class BlockOption extends MenuOption {
  title: string
  Icon?: LucideIcon
  iconKey?: IconKey
  keywords: string[]
  onSelect: () => void

  constructor(title: string, { Icon, iconKey, keywords = [], onSelect }: BlockOptionConfig) {
    super(title)
    this.title = title
    this.Icon = Icon
    this.iconKey = iconKey
    this.keywords = keywords
    this.onSelect = onSelect
  }
}

function insertImageWithSrc(editor: LexicalEditor, src: string, altText: string) {
  editor.focus(() => {
    editor.update(() => {
      const imageNode = $createImageNode({
        altText,
        maxWidth: 720,
        src,
      })
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertNodes([imageNode])
        return
      }

      const paragraph = $createParagraphNode()
      paragraph.append(imageNode)
      $getRoot().append(paragraph)
    })
  })
}

function insertLocalImageFile(editor: LexicalEditor, file: File) {
  if (!file.type.startsWith('image/')) {
    return
  }

  void readImageFileAsDataUrl(file).then((src) => {
    insertImageWithSrc(editor, src, file.name)
  })
}

function openImagePicker(editor: LexicalEditor) {
  const input = document.createElement('input')
  input.accept = 'image/*'
  input.type = 'file'
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) {
      insertLocalImageFile(editor, file)
    }
  }
  input.click()
}

export function getBlockOptions(
  editor: LexicalEditor,
  registry?: LessonBlockTypeRegistryRow[],
): BlockOption[] {
  const pendingRegistryPlugins =
    registry?.filter((row) => row.plugin_key != null && row.plugin_key !== '').length ?? 0
  void pendingRegistryPlugins

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
      iconKey: 'h1',
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
      iconKey: 'h2',
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
      iconKey: 'h3',
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
      onSelect: () => openImagePicker(editor),
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
  ]
}
