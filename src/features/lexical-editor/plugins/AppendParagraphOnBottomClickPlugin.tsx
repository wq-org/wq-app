import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical'
import { useEffect } from 'react'

type AppendParagraphOnBottomClickPluginProps = {
  enabled?: boolean
}

const BOTTOM_CLICK_THRESHOLD_PX = 8

const IGNORED_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[contenteditable="false"]',
  '[data-block-gutter]',
  '[data-code-action-menu]',
  '[data-lexical-youtube]',
  '.ImageNode__image',
  '.ImageNode__frame',
  'code.LCH__code',
].join(',')

function isHTMLElement(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement
}

function getLastElementChild(rootElement: HTMLElement): HTMLElement | null {
  const childElements = Array.from(rootElement.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  )
  return childElements.at(-1) ?? null
}

function isClickInsideRootBounds(event: MouseEvent, rootElement: HTMLElement): boolean {
  const rect = rootElement.getBoundingClientRect()
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  )
}

function isBottomEmptyAreaClick(event: MouseEvent, rootElement: HTMLElement): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.detail > 1 ||
    !isHTMLElement(event.target) ||
    !rootElement.contains(event.target) ||
    !isClickInsideRootBounds(event, rootElement)
  ) {
    return false
  }

  if (event.target.closest(IGNORED_TARGET_SELECTOR)) {
    return false
  }

  const lastChild = getLastElementChild(rootElement)
  if (!lastChild) {
    return true
  }

  const lastChildRect = lastChild.getBoundingClientRect()
  return event.clientY > lastChildRect.bottom + BOTTOM_CLICK_THRESHOLD_PX
}

function isEmptyTextOnlyNode(node: LexicalNode): boolean {
  return $isTextNode(node) && node.getTextContentSize() === 0
}

function isReusableEmptyParagraph(node: LexicalNode | null): node is ElementNode {
  if (!$isParagraphNode(node) || node.getTextContentSize() !== 0) {
    return false
  }

  const children = node.getChildren()
  return children.length === 0 || children.every(isEmptyTextOnlyNode)
}

function focusBottomParagraph(editor: LexicalEditor) {
  editor.focus()
  editor.update(() => {
    const root = $getRoot()
    const lastChild = root.getLastChild()
    if (isReusableEmptyParagraph(lastChild)) {
      lastChild.selectStart()
      return
    }

    const paragraph = $createParagraphNode()
    root.append(paragraph)
    paragraph.selectStart()
  })
}

export function AppendParagraphOnBottomClickPlugin({
  enabled = true,
}: AppendParagraphOnBottomClickPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      const rootElement = editor.getRootElement()
      if (!rootElement || !isBottomEmptyAreaClick(event, rootElement)) {
        return
      }

      event.preventDefault()
      focusBottomParagraph(editor)
    }

    return editor.registerRootListener((rootElement, prevRootElement) => {
      prevRootElement?.removeEventListener('mousedown', handleMouseDown)
      rootElement?.addEventListener('mousedown', handleMouseDown)
      return () => {
        rootElement?.removeEventListener('mousedown', handleMouseDown)
      }
    })
  }, [editor, enabled])

  return null
}
