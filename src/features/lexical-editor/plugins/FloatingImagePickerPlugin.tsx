import type { JSX } from 'react'
import type { LexicalEditor, NodeKey } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useDisclosure } from '@/hooks/use-disclosure'

import {
  CloudImagePickerPanel,
  type CloudImagePickerSelection,
} from '../components/CloudImagePickerPanel'
import {
  OPEN_IMAGE_PICKER_COMMAND,
  OPEN_IMAGE_REPLACE_PICKER_COMMAND,
} from '../commands/imagePickerCommands'
import { useLessonImageUpload } from '../hooks/useLessonImageUpload'
import type { DomRectSnapshot } from '../commands/imagePickerCommands'
import {
  getSelectionAnchorRect,
  positionFloatingPickerBelowReplaceButton,
  positionFloatingPickerBelowSelection,
  readSavedEditorSelection,
  type SavedEditorSelection,
} from '../utils/emojiPickerPosition'
import {
  insertCloudImageAtSelection,
  insertImagePlaceholderAtSelection,
  removeImagePlaceholder,
  replaceImageNodeWithCloudImage,
  replaceImagePlaceholderWithImage,
} from '../utils/insertCloudImage'

const floatingShellClassName = 'absolute top-0 left-0 z-50 opacity-0 will-change-[top,left]'
const PICKER_OFFSET = 2
const DEFAULT_PICKER_HEIGHT = 200
const DEFAULT_PICKER_WIDTH = 450

type PickerAnchorState = {
  rect: DOMRect | null
  selection: SavedEditorSelection
}

type PickerMode =
  | { kind: 'insert'; anchor: PickerAnchorState }
  | { kind: 'replace'; nodeKey: NodeKey; anchorRect: DomRectSnapshot }

type FloatingImagePickerProps = {
  editor: LexicalEditor
  anchorElem: HTMLElement
  pickerMode: PickerMode
  onClose: () => void
}

function FloatingImagePicker({
  editor,
  anchorElem,
  pickerMode,
  onClose,
}: FloatingImagePickerProps): JSX.Element {
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation('features.lesson')

  const updatePosition = useCallback(() => {
    const pickerElem = pickerRef.current
    if (!pickerElem) {
      return
    }

    const pickerHeight = pickerElem.offsetHeight || DEFAULT_PICKER_HEIGHT
    const pickerWidth = pickerElem.offsetWidth || DEFAULT_PICKER_WIDTH

    if (pickerMode.kind === 'replace') {
      positionFloatingPickerBelowReplaceButton({
        anchorRect: pickerMode.anchorRect,
        anchorElem,
        floatingElem: pickerElem,
        pickerWidth,
        pickerHeight,
        offsetPx: PICKER_OFFSET,
      })
      return
    }

    const selectionRect = pickerMode.anchor.rect
    if (!selectionRect) {
      return
    }

    positionFloatingPickerBelowSelection({
      anchorRect: {
        top: selectionRect.top,
        left: selectionRect.left,
        right: selectionRect.right,
        bottom: selectionRect.bottom,
        width: selectionRect.width,
        height: selectionRect.height,
      },
      anchorElem,
      floatingElem: pickerElem,
      pickerWidth,
      pickerHeight,
      offsetPx: PICKER_OFFSET,
    })
  }, [anchorElem, pickerMode])

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

  const { uploadLessonImageFile } = useLessonImageUpload()

  const handleImageSelect = (payload: CloudImagePickerSelection) => {
    if (pickerMode.kind === 'replace') {
      onClose()
      void (async () => {
        const applied = await replaceImageNodeWithCloudImage(editor, pickerMode.nodeKey, payload)
        if (!applied) {
          toast.error(t('editor.image.replaceFailed'))
        }
      })()
      return
    }

    insertCloudImageAtSelection(editor, payload)
    onClose()
  }

  const handleUpload = (file: File) => {
    if (pickerMode.kind === 'replace') {
      const replaceNodeKey = pickerMode.nodeKey
      onClose()

      void (async () => {
        const result = await uploadLessonImageFile(file)
        if (!result) {
          return
        }

        const payload: CloudImagePickerSelection = {
          src: result.publicUrl,
          altText: file.name,
          filepath: result.filepath,
          cloudFileId: result.cloudFileId,
        }

        const applied = await replaceImageNodeWithCloudImage(editor, replaceNodeKey, payload)
        if (!applied) {
          toast.error(t('editor.image.replaceFailed'))
        }
      })()
      return
    }

    const placeholderKey = insertImagePlaceholderAtSelection(editor)
    onClose()

    void (async () => {
      const result = await uploadLessonImageFile(file)
      if (!result) {
        if (placeholderKey) {
          removeImagePlaceholder(editor, placeholderKey)
        }
        return
      }

      const payload: CloudImagePickerSelection = {
        src: result.publicUrl,
        altText: file.name,
        filepath: result.filepath,
        cloudFileId: result.cloudFileId,
      }

      if (placeholderKey) {
        replaceImagePlaceholderWithImage(editor, placeholderKey, payload)
      } else {
        insertCloudImageAtSelection(editor, payload)
      }
    })()
  }

  return (
    <div
      ref={pickerRef}
      className={floatingShellClassName}
    >
      <CloudImagePickerPanel
        onSelect={handleImageSelect}
        onUpload={handleUpload}
      />
    </div>
  )
}

type FloatingImagePickerPluginProps = {
  anchorElem: HTMLElement
}

export function FloatingImagePickerPlugin({
  anchorElem,
}: FloatingImagePickerPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null)

  const openInsertPicker = useCallback(() => {
    const savedSelection = readSavedEditorSelection(editor)
    setPickerMode({
      kind: 'insert',
      anchor: {
        rect: getSelectionAnchorRect(editor, savedSelection),
        selection: savedSelection,
      },
    })
    onOpen()
  }, [editor, onOpen])

  const openReplacePicker = useCallback(
    (nodeKey: NodeKey, anchorRect: DomRectSnapshot) => {
      setPickerMode({
        kind: 'replace',
        nodeKey,
        anchorRect,
      })
      onOpen()
    },
    [onOpen],
  )

  const handleClose = useCallback(() => {
    setPickerMode(null)
    onClose()
  }, [onClose])

  useEffect(() => {
    return editor.registerCommand(
      OPEN_IMAGE_PICKER_COMMAND,
      () => {
        openInsertPicker()
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, openInsertPicker])

  useEffect(() => {
    return editor.registerCommand(
      OPEN_IMAGE_REPLACE_PICKER_COMMAND,
      (payload) => {
        openReplacePicker(payload.nodeKey, payload.anchorRect)
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, openReplacePicker])

  if (!isOpen || pickerMode === null) {
    return null
  }

  return createPortal(
    <FloatingImagePicker
      editor={editor}
      anchorElem={anchorElem}
      pickerMode={pickerMode}
      onClose={handleClose}
    />,
    anchorElem,
  )
}
