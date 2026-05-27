import type { JSX } from 'react'
import type { LexicalEditor } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useDisclosure } from '@/hooks/use-disclosure'

import { EmojiPickerPanel } from '../components/EmojiPickerPanel'
import { OPEN_EMOJI_PICKER_COMMAND } from '../commands/emojiPickerCommands'
import {
  getSelectionAnchorRect,
  positionFloatingPickerBelowSelection,
  readSavedEditorSelection,
  type SavedEditorSelection,
} from '../utils/emojiPickerPosition'
import { observeFloatingPlacementUpdates } from '../utils/floatingPlacementViewport'
import { resolveLexicalFloatingPortalTarget } from '../utils/floatingPortalTarget'
import { insertEmojiAtSelection } from '../utils/insertEmoji'

const floatingShellClassName =
  'pointer-events-auto top-0 left-0 z-[200] opacity-0 will-change-[top,left]'
const PICKER_OFFSET = 8
const DEFAULT_PICKER_HEIGHT = 320
const DEFAULT_PICKER_WIDTH = 352

type PickerAnchorState = {
  rect: DOMRect | null
  selection: SavedEditorSelection
}

type FloatingEmojiPickerProps = {
  editor: LexicalEditor
  anchorElem: HTMLElement
  pickerAnchor: PickerAnchorState
  onClose: () => void
  portalRoot: HTMLElement
}

function FloatingEmojiPicker({
  editor,
  anchorElem,
  pickerAnchor,
  onClose,
  portalRoot,
}: FloatingEmojiPickerProps): JSX.Element {
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const updatePosition = useCallback(() => {
    const pickerElem = pickerRef.current
    const rect = pickerAnchor.rect
    if (!pickerElem || !rect) {
      return
    }

    const pickerHeight = pickerElem.offsetHeight || DEFAULT_PICKER_HEIGHT
    const pickerWidth = pickerElem.offsetWidth || DEFAULT_PICKER_WIDTH

    positionFloatingPickerBelowSelection({
      anchorRect: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
      anchorElem,
      floatingElem: pickerElem,
      pickerWidth,
      pickerHeight,
      offsetPx: PICKER_OFFSET,
      portalRoot,
    })
  }, [anchorElem, pickerAnchor.rect, portalRoot])

  useEffect(() => {
    updatePosition()
    const frame = requestAnimationFrame(updatePosition)
    const stopObserving = observeFloatingPlacementUpdates(anchorElem, updatePosition)

    return () => {
      cancelAnimationFrame(frame)
      stopObserving()
    }
  }, [anchorElem, updatePosition])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      const pickerElem = pickerRef.current
      if (!pickerElem) {
        return
      }
      if (event.composedPath().includes(pickerElem)) {
        return
      }
      onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    const outsideListenerTimer = window.setTimeout(() => {
      window.addEventListener('mousedown', handlePointerDown)
    }, 0)

    return () => {
      window.clearTimeout(outsideListenerTimer)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose])

  const handleEmojiSelect = (emoji: string) => {
    insertEmojiAtSelection(editor, emoji)
    onClose()
  }

  return (
    <div
      ref={pickerRef}
      className={floatingShellClassName}
    >
      <EmojiPickerPanel onSelect={handleEmojiSelect} />
    </div>
  )
}

type FloatingEmojiPickerPluginProps = {
  anchorElem: HTMLElement
  portalToDocumentBody?: boolean
}

export function FloatingEmojiPickerPlugin({
  anchorElem,
  portalToDocumentBody = false,
}: FloatingEmojiPickerPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [pickerAnchor, setPickerAnchor] = useState<PickerAnchorState | null>(null)

  const openPicker = useCallback(() => {
    const savedSelection = readSavedEditorSelection(editor)
    setPickerAnchor({
      rect: getSelectionAnchorRect(editor, savedSelection),
      selection: savedSelection,
    })
    onOpen()
  }, [editor, onOpen])

  const handleClose = useCallback(() => {
    setPickerAnchor(null)
    onClose()
  }, [onClose])

  useEffect(() => {
    return editor.registerCommand(
      OPEN_EMOJI_PICKER_COMMAND,
      () => {
        openPicker()
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, openPicker])

  if (!isOpen || pickerAnchor === null) {
    return null
  }

  const portalRoot = portalToDocumentBody
    ? resolveLexicalFloatingPortalTarget(anchorElem)
    : anchorElem

  return createPortal(
    <FloatingEmojiPicker
      editor={editor}
      anchorElem={anchorElem}
      pickerAnchor={pickerAnchor}
      onClose={handleClose}
      portalRoot={portalRoot}
    />,
    portalRoot,
  )
}
