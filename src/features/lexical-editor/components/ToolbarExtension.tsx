import { $isDecoratorTextNode, signal } from '@lexical/extension'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useExtensionDependency } from '@lexical/react/useExtensionComponent'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $findMatchingParent } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  mergeRegister,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { Bold, Italic, Redo2, Underline, Undo2, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

import { useSignalValue } from '../utils/useExtensionHooks'

const BLOCK_TYPES = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Quote', value: 'quote' },
] as const

const KNOWN_BLOCK_VALUES = new Set<string>(BLOCK_TYPES.map((entry) => entry.value))

function applyBlockType(editor: LexicalEditor, type: string) {
  editor.update(() => {
    const selection = $getSelection()
    if (type === 'paragraph') {
      $setBlocksType(selection, $createParagraphNode)
    } else if (type === 'quote') {
      $setBlocksType(selection, $createQuoteNode)
    } else {
      const headingTag = type as 'h1' | 'h2' | 'h3'
      $setBlocksType(selection, () => $createHeadingNode(headingTag))
    }
  })
}

function Divider() {
  return <div className="mx-1 h-5 w-px self-center bg-zinc-200 dark:bg-zinc-700" />
}

type ToolbarSnapshot = {
  blockType: string
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
}

function $getToolbarState(): ToolbarSnapshot | null {
  const selection = $getSelection()

  if ($isNodeSelection(selection)) {
    const decoratorNode = selection.getNodes().find($isDecoratorTextNode)
    if (decoratorNode) {
      return {
        blockType: 'paragraph',
        isBold: decoratorNode.hasFormat('bold'),
        isItalic: decoratorNode.hasFormat('italic'),
        isUnderline: decoratorNode.hasFormat('underline'),
      }
    }
    return null
  }

  if (!$isRangeSelection(selection)) return null

  const anchorNode = selection.anchor.getNode()
  const topLevelElement =
    $findMatchingParent(anchorNode, (node) => {
      const parent = node.getParent()
      return parent !== null && $isRootOrShadowRoot(parent)
    }) || anchorNode.getTopLevelElementOrThrow()

  return {
    blockType: $isHeadingNode(topLevelElement)
      ? topLevelElement.getTag()
      : topLevelElement.getType(),
    isBold: selection.hasFormat('bold'),
    isItalic: selection.hasFormat('italic'),
    isUnderline: selection.hasFormat('underline'),
  }
}

export const ToolbarExtension = defineExtension({
  build() {
    return {
      blockType: signal('paragraph'),
      canRedo: signal(false),
      canUndo: signal(false),
      isBold: signal(false),
      isItalic: signal(false),
      isUnderline: signal(false),
    }
  },
  dependencies: [],
  name: '@wq/lexical/toolbar',
  register(editor, _config, state) {
    const output = state.getOutput()
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            const snapshot = $getToolbarState()
            if (!snapshot) return
            output.blockType.value = snapshot.blockType
            output.isBold.value = snapshot.isBold
            output.isItalic.value = snapshot.isItalic
            output.isUnderline.value = snapshot.isUnderline
          },
          { editor },
        )
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          output.canUndo.value = payload
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          output.canRedo.value = payload
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  },
})

function useToolbar() {
  const output = useExtensionDependency(ToolbarExtension).output
  return {
    blockType: useSignalValue(output.blockType),
    canRedo: useSignalValue(output.canRedo),
    canUndo: useSignalValue(output.canUndo),
    isBold: useSignalValue(output.isBold),
    isItalic: useSignalValue(output.isItalic),
    isUnderline: useSignalValue(output.isUnderline),
  }
}

type FormatId = 'bold' | 'italic' | 'underline'

type FormatButton = {
  id: FormatId
  Icon: LucideIcon
  label: string
  flag: 'isBold' | 'isItalic' | 'isUnderline'
}

const FORMAT_BUTTONS: readonly FormatButton[] = [
  { id: 'bold', Icon: Bold, label: 'Bold', flag: 'isBold' },
  { id: 'italic', Icon: Italic, label: 'Italic', flag: 'isItalic' },
  { id: 'underline', Icon: Underline, label: 'Underline', flag: 'isUnderline' },
]

const BTN_BASE =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-zinc-200'
const BTN_INACTIVE = 'enabled:hover:bg-zinc-200 dark:enabled:hover:bg-zinc-700'
const BTN_ACTIVE =
  'bg-zinc-900 text-white enabled:hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'

export function Toolbar(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const toolbar = useToolbar()

  const selectValue = KNOWN_BLOCK_VALUES.has(toolbar.blockType) ? toolbar.blockType : 'paragraph'

  const handleBlockTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    applyBlockType(editor, event.target.value)
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-white/95 px-2 py-1.5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
      <select
        className="cursor-pointer appearance-none rounded-md border-0 bg-transparent px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-zinc-200 dark:hover:bg-zinc-700"
        value={selectValue}
        onChange={handleBlockTypeChange}
        aria-label="Block type"
      >
        {BLOCK_TYPES.map(({ label, value }) => (
          <option
            key={value}
            value={value}
          >
            {label}
          </option>
        ))}
      </select>
      <Divider />
      <button
        type="button"
        disabled={!toolbar.canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className={`${BTN_BASE} ${BTN_INACTIVE}`}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={!toolbar.canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className={`${BTN_BASE} ${BTN_INACTIVE}`}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
      <Divider />
      {FORMAT_BUTTONS.map(({ id, Icon, label, flag }) => {
        const isActive = toolbar[flag]
        return (
          <button
            key={id}
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, id)}
            className={`${BTN_BASE} ${isActive ? BTN_ACTIVE : BTN_INACTIVE}`}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
