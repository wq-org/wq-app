import { defineExtension, signal } from '@lexical/extension'
import { $isLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useExtensionDependency } from '@lexical/react/useExtensionComponent'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
} from 'lexical'
import {
  Bold,
  Code,
  Italic,
  Link,
  MessageSquareText,
  Strikethrough,
  Underline,
  type LucideIcon,
} from 'lucide-react'

import { OPEN_COMMENT_DIALOG_COMMAND } from '../commands/commentCommands'
import { useCallback, useEffect, useRef, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { TextHighlightToolbarButton } from './TextHighlightPlugin/TextHighlightPlugin'

import { getDOMRangeRect } from '../utils/getDOMRangeRect'
import { getSelectedNode } from '../utils/getSelectedNode'
import { setFloatingElemPosition } from '../utils/setFloatingElemPosition'
import { useSignalValue } from '../utils/useExtensionHooks'
import {
  DEFAULT_FLOATING_TOOLBAR_FEATURES,
  type FloatingToolbarFeatures,
} from '../types/floatingToolbarFeatures'

export const FloatingFormatExtension = defineExtension({
  build() {
    return {
      isText: signal(false),
      isLink: signal(false),
      isBold: signal(false),
      isItalic: signal(false),
      isUnderline: signal(false),
      isStrikethrough: signal(false),
      isCode: signal(false),
    }
  },
  dependencies: [],
  name: '@wq/lexical/floating-format',
  register(editor, _config, state) {
    const out = state.getOutput()

    const update = () => {
      editor.getEditorState().read(
        () => {
          if (editor.isComposing()) return

          const selection = $getSelection()
          const nativeSelection = getDOMSelection(editor._window)
          const rootElement = editor.getRootElement()

          if (
            nativeSelection !== null &&
            (!$isRangeSelection(selection) ||
              rootElement === null ||
              !rootElement.contains(nativeSelection.anchorNode))
          ) {
            out.isText.value = false
            out.isLink.value = false
            return
          }

          if (!$isRangeSelection(selection)) return

          const node = getSelectedNode(selection)
          out.isBold.value = selection.hasFormat('bold')
          out.isItalic.value = selection.hasFormat('italic')
          out.isUnderline.value = selection.hasFormat('underline')
          out.isStrikethrough.value = selection.hasFormat('strikethrough')
          out.isCode.value = selection.hasFormat('code')

          const parent = node.getParent()
          out.isLink.value = $isLinkNode(parent) || $isLinkNode(node)

          const rawText = selection.getTextContent().replace(/\n/g, '')
          const hasText =
            ($isTextNode(node) || $isParagraphNode(node)) && selection.getTextContent() !== ''
          const isEmptyMultiline = !selection.isCollapsed() && rawText === ''

          out.isText.value = hasText && !isEmptyMultiline
        },
        { editor },
      )
    }

    const onSelectionChange = () => update()
    document.addEventListener('selectionchange', onSelectionChange)

    return mergeRegister(
      editor.registerUpdateListener(update),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          update()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      () => document.removeEventListener('selectionchange', onSelectionChange),
    )
  },
})

type FormatId = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'

type FormatFlag = 'isBold' | 'isItalic' | 'isUnderline' | 'isStrikethrough' | 'isCode'

type FormatButton = {
  id: FormatId
  Icon: LucideIcon
  label: string
  flag: FormatFlag
}

const FORMAT_BUTTONS: readonly FormatButton[] = [
  { id: 'bold', Icon: Bold, label: 'Bold', flag: 'isBold' },
  { id: 'italic', Icon: Italic, label: 'Italic', flag: 'isItalic' },
  { id: 'underline', Icon: Underline, label: 'Underline', flag: 'isUnderline' },
  { id: 'strikethrough', Icon: Strikethrough, label: 'Strikethrough', flag: 'isStrikethrough' },
  { id: 'code', Icon: Code, label: 'Code', flag: 'isCode' },
]

type FormatFlags = Record<FormatFlag, boolean>

const toolbarButtonClassName =
  'flex h-7 w-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted'

const toolbarShellClassName =
  'absolute top-0 left-0 z-30 flex items-center gap-0.5 rounded-full border border-border bg-popover/95 px-1 py-1 opacity-0 text-popover-foreground shadow-xl backdrop-blur-md transition-opacity will-change-transform supports-backdrop-filter:bg-popover/90'

type FloatingPopupProps = {
  editor: LexicalEditor
  anchorElem: HTMLElement
  formats: FormatFlags
  features: FloatingToolbarFeatures
  isLink: boolean
  isText: boolean
  onRequestLinkDialog: () => void
}

function FloatingPopup({
  editor,
  anchorElem,
  formats,
  features,
  isLink,
  isText,
  onRequestLinkDialog,
}: FloatingPopupProps): JSX.Element {
  const popupRef = useRef<HTMLDivElement | null>(null)

  const updatePosition = useCallback(() => {
    const popupElem = popupRef.current
    if (!popupElem) return

    const nativeSelection = getDOMSelection(editor._window)
    const rootElement = editor.getRootElement()
    if (nativeSelection === null || rootElement === null) return
    if (!rootElement.contains(nativeSelection.anchorNode)) return

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      if (!nativeSelection.isCollapsed) {
        const rangeRect = getDOMRangeRect(nativeSelection, rootElement)
        setFloatingElemPosition(rangeRect, popupElem, anchorElem)
        return
      }

      const node = getSelectedNode(selection)
      const parent = node.getParent()
      const linkNode = $isLinkNode(node) ? node : $isLinkNode(parent) ? parent : null
      if (!linkNode) return

      const linkElement = editor.getElementByKey(linkNode.getKey())
      if (!linkElement) return

      setFloatingElemPosition(linkElement.getBoundingClientRect(), popupElem, anchorElem)
    })
  }, [editor, anchorElem])

  useEffect(() => {
    editor.getEditorState().read(updatePosition)
    const scrollerElem = anchorElem.parentElement
    const onUpdate = () => editor.getEditorState().read(updatePosition)
    window.addEventListener('resize', onUpdate)
    if (scrollerElem) scrollerElem.addEventListener('scroll', onUpdate)
    return () => {
      window.removeEventListener('resize', onUpdate)
      if (scrollerElem) scrollerElem.removeEventListener('scroll', onUpdate)
    }
  }, [editor, anchorElem, updatePosition])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => editorState.read(updatePosition)),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePosition()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updatePosition])

  const handleLinkClick = () => {
    onRequestLinkDialog()
  }

  const handleCommentClick = () => {
    editor.dispatchCommand(OPEN_COMMENT_DIALOG_COMMAND, undefined)
  }

  return (
    <div
      ref={popupRef}
      className={toolbarShellClassName}
    >
      {FORMAT_BUTTONS.filter(({ id }) => features[id]).map(({ id, Icon, label, flag }) => {
        const active = formats[flag]
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, id)}
            className={`${toolbarButtonClassName} ${active ? 'bg-muted' : ''}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
      {features.link ? (
        <button
          type="button"
          title={isLink ? 'Edit link' : 'Add link'}
          aria-label={isLink ? 'Edit link' : 'Add link'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleLinkClick}
          className={`${toolbarButtonClassName} ${isLink ? 'bg-muted' : ''}`}
        >
          <Link className="h-4 w-4" />
        </button>
      ) : null}
      {features.comment ? (
        <button
          type="button"
          title="Add comment"
          aria-label="Add comment"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleCommentClick}
          className={toolbarButtonClassName}
        >
          <MessageSquareText className="h-4 w-4" />
        </button>
      ) : null}
      {features.highlight ? (
        <TextHighlightToolbarButton
          editor={editor}
          className={toolbarButtonClassName}
          enabled={isText}
        />
      ) : null}
    </div>
  )
}

type FloatingTextFormatToolbarPluginProps = {
  anchorElem: HTMLElement
  onRequestLinkDialog: () => void
  features?: FloatingToolbarFeatures
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
  onRequestLinkDialog,
  features = DEFAULT_FLOATING_TOOLBAR_FEATURES,
}: FloatingTextFormatToolbarPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const out = useExtensionDependency(FloatingFormatExtension).output

  const isText = useSignalValue(out.isText)
  const isLink = useSignalValue(out.isLink)
  const isBold = useSignalValue(out.isBold)
  const isItalic = useSignalValue(out.isItalic)
  const isUnderline = useSignalValue(out.isUnderline)
  const isStrikethrough = useSignalValue(out.isStrikethrough)
  const isCode = useSignalValue(out.isCode)

  if (!isText && !isLink) return null

  return createPortal(
    <FloatingPopup
      editor={editor}
      anchorElem={anchorElem}
      formats={{ isBold, isItalic, isUnderline, isStrikethrough, isCode }}
      features={features}
      isLink={isLink}
      isText={isText}
      onRequestLinkDialog={onRequestLinkDialog}
    />,
    anchorElem,
  )
}
