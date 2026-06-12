import { $isCodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $createNodeSelection,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical'
import { useEffect } from 'react'

const CODE_BLOCK_SELECTOR = 'code.LCH__code'
const SELECTED_CLASS = 'LCH__code--selected'

type CodeBlockSelectionPluginProps = {
  enabled?: boolean
}

function resolveCodeNodeFromDom(codeDomNode: HTMLElement, editor: LexicalEditor) {
  return editor.read(() => {
    let node: LexicalNode | null = $getNearestNodeFromDOMNode(codeDomNode)
    while (node != null && !$isCodeNode(node)) {
      node = node.getParent()
    }
    return $isCodeNode(node) ? node : null
  })
}

function selectCodeBlockFromDomEvent(
  event: MouseEvent,
  codeDomNode: HTMLElement,
  editor: LexicalEditor,
): boolean {
  if (event.button !== 0 || event.detail >= 2) {
    return false
  }

  const codeNode = resolveCodeNodeFromDom(codeDomNode, editor)
  if (!codeNode) {
    return false
  }

  const nodeKey = codeNode.getKey()
  const isAlreadySelected = editor.read(() => {
    const selection = $getSelection()
    return (
      $isNodeSelection(selection) && selection.getNodes().some((node) => node.getKey() === nodeKey)
    )
  })
  if (isAlreadySelected) {
    return false
  }

  event.preventDefault()
  editor.update(() => {
    const selection = $createNodeSelection()
    selection.add(nodeKey)
    $setSelection(selection)
  })
  return true
}

function syncCodeBlockSelectedClass(editor: LexicalEditor) {
  const root = editor.getRootElement()
  if (!root) {
    return
  }

  root.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR).forEach((element) => {
    element.classList.remove(SELECTED_CLASS)
  })

  editor.getEditorState().read(
    () => {
      const selection = $getSelection()
      if (!$isNodeSelection(selection)) {
        return
      }

      for (const node of selection.getNodes()) {
        if (!$isCodeNode(node)) {
          continue
        }
        const element = editor.getElementByKey(node.getKey())
        if (element instanceof HTMLElement) {
          element.classList.add(SELECTED_CLASS)
        }
      }
    },
    { editor },
  )
}

/** Single-click selects a code block; double-click edits; Backspace deletes when selected. */
export function CodeBlockSelectionPlugin({ enabled = true }: CodeBlockSelectionPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const syncSelectedClass = () => syncCodeBlockSelectedClass(editor)

    const handleMouseDown = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return
      }
      if (event.target.closest('[data-code-action-menu]')) {
        return
      }

      const codeDomNode = event.target.closest<HTMLElement>(CODE_BLOCK_SELECTOR)
      if (!codeDomNode) {
        return
      }

      selectCodeBlockFromDomEvent(event, codeDomNode, editor)
    }

    return mergeRegister(
      editor.registerRootListener((rootElement, prevRootElement) => {
        prevRootElement?.removeEventListener('mousedown', handleMouseDown)
        rootElement?.addEventListener('mousedown', handleMouseDown)
        return () => {
          rootElement?.removeEventListener('mousedown', handleMouseDown)
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          syncSelectedClass()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(syncSelectedClass),
    )
  }, [editor, enabled])

  return null
}
