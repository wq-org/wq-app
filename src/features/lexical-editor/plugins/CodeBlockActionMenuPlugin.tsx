import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { $isCodeNode, CodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNearestNodeFromDOMNode, isHTMLElement } from 'lexical'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

const CODE_BLOCK_SELECTOR = 'code.LCH__code'
const MENU_OFFSET_PX = 6
const MOUSE_MOVE_DEBOUNCE_MS = 50
const COPY_FEEDBACK_MS = 1200

type MenuPosition = {
  top: number
  right: number
}

function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useMemo(() => {
    const debounced = (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs)
    }
    debounced.cancel = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return debounced
  }, [delayMs])
}

function getHoveredCodeBlock(event: MouseEvent): {
  codeDomNode: HTMLElement | null
  isOutside: boolean
} {
  const target = event.target
  if (!isHTMLElement(target)) {
    return { codeDomNode: null, isOutside: true }
  }
  const codeDomNode = target.closest<HTMLElement>(CODE_BLOCK_SELECTOR)
  const isInsideMenu = target.closest('[data-code-action-menu]') != null
  return { codeDomNode, isOutside: !codeDomNode && !isInsideMenu }
}

type CodeBlockActionMenuPluginProps = {
  anchorElem: HTMLElement
}

/** Hover menu pinned to the top-right of the hovered code block with a copy action. */
export function CodeBlockActionMenuPlugin({
  anchorElem,
}: CodeBlockActionMenuPluginProps): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [isShown, setIsShown] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 })
  const [shouldTrackMouse, setShouldTrackMouse] = useState(false)
  const codeDomNodeRef = useRef<HTMLElement | null>(null)
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseMove = useDebouncedCallback((event: MouseEvent) => {
    const { codeDomNode, isOutside } = getHoveredCodeBlock(event)
    if (isOutside) {
      setIsShown(false)
      return
    }
    if (!codeDomNode) return

    codeDomNodeRef.current = codeDomNode

    const anchorRect = anchorElem.getBoundingClientRect()
    const codeRect = codeDomNode.getBoundingClientRect()
    setPosition({
      top: codeRect.top - anchorRect.top + MENU_OFFSET_PX,
      right: anchorRect.right - codeRect.right + MENU_OFFSET_PX,
    })
    setIsShown(true)
  }, MOUSE_MOVE_DEBOUNCE_MS)

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      () => {
        setShouldTrackMouse(anchorElem.querySelector(CODE_BLOCK_SELECTOR) != null)
      },
      { skipInitialization: false },
    )
  }, [editor, anchorElem])

  useEffect(() => {
    if (!shouldTrackMouse) return

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      setIsShown(false)
      handleMouseMove.cancel()
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [shouldTrackMouse, handleMouseMove])

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    const codeDomNode = codeDomNodeRef.current
    if (!codeDomNode || typeof navigator === 'undefined' || !navigator.clipboard) return

    let content = ''
    editor.getEditorState().read(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDomNode)
      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent()
      }
    })
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current)
      copyResetTimerRef.current = setTimeout(() => setIsCopied(false), COPY_FEEDBACK_MS)
    } catch (error) {
      console.error('CodeBlockActionMenu: copy failed', error)
    }
  }

  const menu = (
    <div
      data-code-action-menu
      className={
        isShown
          ? 'absolute z-40 flex items-center gap-1 rounded-lg bg-popover/80 p-1 shadow-sm ring-1 ring-foreground/10 backdrop-blur-xl'
          : 'hidden'
      }
      style={{ top: position.top, right: position.right }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {isCopied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )

  return createPortal(menu, anchorElem)
}
