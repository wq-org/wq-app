import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { $isCodeNode, CodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNearestNodeFromDOMNode, isHTMLElement } from 'lexical'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner-toast'

const CODE_BLOCK_SELECTOR = 'code.LCH__code'
const MENU_OFFSET_PX = 6
const MOUSE_MOVE_DEBOUNCE_MS = 50
const MENU_HIDE_DELAY_MS = 400

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

function resolveCodeNodeFromDom(codeDomNode: HTMLElement) {
  let node = $getNearestNodeFromDOMNode(codeDomNode)
  while (node != null && !$isCodeNode(node)) {
    node = node.getParent()
  }
  return $isCodeNode(node) ? node : null
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
  const [isMenuHovered, setIsMenuHovered] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 })
  const [shouldTrackMouse, setShouldTrackMouse] = useState(false)
  const codeDomNodeRef = useRef<HTMLElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setIsShown(false)
    }, MENU_HIDE_DELAY_MS)
  }, [clearHideTimer])

  const showForCodeBlock = useCallback(
    (codeDomNode: HTMLElement) => {
      clearHideTimer()
      codeDomNodeRef.current = codeDomNode

      const anchorRect = anchorElem.getBoundingClientRect()
      const codeRect = codeDomNode.getBoundingClientRect()
      setPosition({
        top: codeRect.top - anchorRect.top + MENU_OFFSET_PX,
        right: anchorRect.right - codeRect.right + MENU_OFFSET_PX,
      })
      setIsShown(true)
    },
    [anchorElem, clearHideTimer],
  )

  const isMenuHoveredRef = useRef(false)
  isMenuHoveredRef.current = isMenuHovered

  const handleMouseMove = useDebouncedCallback((event: MouseEvent) => {
    const { codeDomNode, isOutside } = getHoveredCodeBlock(event)

    if (codeDomNode) {
      showForCodeBlock(codeDomNode)
      return
    }

    if (isOutside && !isMenuHoveredRef.current) {
      scheduleHide()
    }
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
      clearHideTimer()
      handleMouseMove.cancel()
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [shouldTrackMouse, handleMouseMove, clearHideTimer])

  useEffect(() => clearHideTimer, [clearHideTimer])

  const handleCopy = useCallback(async () => {
    const codeDomNode = codeDomNodeRef.current
    if (!codeDomNode) {
      toast.error('Could not copy code.')
      return
    }

    let content = editor.read(() => {
      const codeNode = resolveCodeNodeFromDom(codeDomNode)
      return codeNode?.getTextContent() ?? ''
    })

    if (!content.trim()) {
      content = codeDomNode.innerText.trim()
    }

    if (!content) {
      toast.error('Nothing to copy.')
      return
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      toast.error('Clipboard is not available.')
      return
    }

    try {
      await toast.promise(navigator.clipboard.writeText(content), {
        success: 'Code copied.',
        error: 'Could not copy code.',
      })
    } catch (error) {
      console.error('CodeBlockActionMenu: copy failed', error)
    }
  }, [editor])

  const menu = (
    <div
      data-code-action-menu
      className={
        isShown
          ? 'absolute z-40 flex items-center gap-1 rounded-lg bg-popover/80 p-1 shadow-sm ring-1 ring-foreground/10 backdrop-blur-xl'
          : 'pointer-events-none absolute z-40 hidden'
      }
      style={{ top: position.top, right: position.right }}
      onMouseEnter={() => {
        setIsMenuHovered(true)
        clearHideTimer()
      }}
      onMouseLeave={() => {
        setIsMenuHovered(false)
        scheduleHide()
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  )

  return createPortal(menu, anchorElem)
}
