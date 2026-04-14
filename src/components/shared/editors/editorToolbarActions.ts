import { $createParagraphNode, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { type LucideIcon, Heading1, Heading2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EditorBlockType = 'paragraph' | 'h1' | 'h2' | 'ol' | 'quote' | 'ul'

export type HeadingOption = {
  icon: LucideIcon
  label: 'Heading 1' | 'Heading 2'
  value: 'h1' | 'h2'
}

export type EditorToolbarState = {
  blockType: EditorBlockType
  isBold: boolean
  isItalic: boolean
  isLinkActive: boolean
  isSelectionActive: boolean
  isStrikethrough: boolean
  isUnderline: boolean
}

export const HEADING_OPTIONS: readonly HeadingOption[] = [
  { icon: Heading1, label: 'Heading 1', value: 'h1' },
  { icon: Heading2, label: 'Heading 2', value: 'h2' },
]

export const getToolbarButtonClassName = (isActive = false) =>
  cn('editor-toolbarButton', isActive && 'editor-toolbarButtonActive')

export const readEditorToolbarState = (editor: LexicalEditor): EditorToolbarState => {
  const nextState: EditorToolbarState = {
    blockType: 'paragraph',
    isBold: false,
    isItalic: false,
    isLinkActive: false,
    isSelectionActive: false,
    isStrikethrough: false,
    isUnderline: false,
  }

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    nextState.isSelectionActive = !selection.isCollapsed()
    nextState.isBold = selection.hasFormat('bold')
    nextState.isItalic = selection.hasFormat('italic')
    nextState.isUnderline = selection.hasFormat('underline')
    nextState.isStrikethrough = selection.hasFormat('strikethrough')

    const anchorNode = selection.anchor.getNode()
    const topLevelElement = anchorNode.getTopLevelElementOrThrow()
    const parentNode = topLevelElement.getParent()

    if ($isListNode(parentNode)) {
      nextState.blockType = parentNode.getListType() === 'number' ? 'ol' : 'ul'
      return
    }

    if ($isListNode(topLevelElement)) {
      nextState.blockType = topLevelElement.getListType() === 'number' ? 'ol' : 'ul'
      return
    }

    if ($isHeadingNode(topLevelElement)) {
      const tag = topLevelElement.getTag()
      nextState.blockType = tag === 'h1' ? 'h1' : tag === 'h2' ? 'h2' : 'paragraph'
      return
    }

    nextState.blockType = topLevelElement.getType() === 'quote' ? 'quote' : 'paragraph'
  })

  return nextState
}

export const applyParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode())
    }
  })
}

export const applyHeading = (editor: LexicalEditor, tag: 'h1' | 'h2') => {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(tag))
    }
  })
}

export const applyQuote = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createQuoteNode())
    }
  })
}

export const toggleList = (
  editor: LexicalEditor,
  currentType: EditorBlockType,
  nextType: 'ol' | 'ul',
) => {
  if (currentType === nextType) {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    return
  }

  editor.dispatchCommand(
    nextType === 'ul' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
    undefined,
  )
}
