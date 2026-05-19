import type { JSX } from 'react'
import type { LexicalEditor } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useDisclosure } from '@/hooks/use-disclosure'
import { cn } from '@/lib/utils'

import { EmojiPickerPanel } from '../components/EmojiPickerPanel'
import { OPEN_EMOJI_PICKER_COMMAND } from '../commands/emojiPickerCommands'
import {
  getSelectionAnchorRect,
  positionFloatingElementAtRect,
  readSavedEditorSelection,
  type SavedEditorSelection,
} from '../utils/emojiPickerPosition'
import { insertEmojiAtSelection } from '../utils/insertEmoji'

const floatingShellClassName = 'absolute top-0 left-0 z-50 opacity-0 will-change-transform'

type PickerAnchorState = {
  rect: DOMRect | null
  selection: SavedEditorSelection
}

type FloatingEmojiPickerProps = {
  editor: LexicalEditor
  anchorElem: HTMLElement
  pickerAnchor: PickerAnchorState
  onClose: () => void
}

function FloatingEmojiPicker({
  editor,
  anchorElem,
  pickerAnchor,
  onClose,
}: FloatingEmojiPickerProps): JSX.Element {
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const updatePosition = useCallback(() => {
    const pickerElem = pickerRef.current
    if (!pickerElem) {
      return
    }

    positionFloatingElementAtRect(pickerAnchor.rect, pickerElem, anchorElem)
  }, [anchorElem, pickerAnchor.rect])

  useEffect(() => {
    updatePosition()
    const frame = requestAnimationFrame(updatePosition)

    const scrollerElem = anchorElem.parentElement
    const handleWindowChange = () => updatePosition()
    window.addEventListener('resize', handleWindowChange)
    scrollerElem?.addEventListener('scroll', handleWindowChange, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleWindowChange)
      scrollerElem?.removeEventListener('scroll', handleWindowChange)
    }
  }, [anchorElem, updatePosition])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (pickerRef.current?.contains(target)) {
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
      className={cn(floatingShellClassName, 'opacity-100')}
    >
      <EmojiPickerPanel onSelect={handleEmojiSelect} />
    </div>
  )
}

type FloatingEmojiPickerPluginProps = {
  anchorElem: HTMLElement
}

export function FloatingEmojiPickerPlugin({
  anchorElem,
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

  return createPortal(
    <FloatingEmojiPicker
      editor={editor}
      anchorElem={anchorElem}
      pickerAnchor={pickerAnchor}
      onClose={handleClose}
    />,
    anchorElem,
  )
}
