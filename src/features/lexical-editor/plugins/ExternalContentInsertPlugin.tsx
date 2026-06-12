import { useEffect } from 'react'
import { $createLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical'

/**
 * Imperative API handed to the host page so sibling surfaces (e.g. the note
 * agent PDF panel) can append content into this editor without owning a
 * Lexical context. All inserts land at the end of the document and are
 * scrolled into view. Returns `true` when content was actually inserted so
 * hosts can show success feedback only on real inserts.
 */
export type EditorExternalInsertApi = {
  appendText: (text: string) => boolean
  appendLink: (url: string, label?: string) => boolean
}

type ExternalContentInsertPluginProps = {
  onReady: (api: EditorExternalInsertApi | null) => void
}

function scrollNodeIntoView(editor: LexicalEditor, nodeKey: string) {
  const element = editor.getElementByKey(nodeKey)
  if (!element) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.requestAnimationFrame(() => {
    element.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  })
}

function appendAndReveal(editor: LexicalEditor, buildNodes: () => LexicalNode[]): boolean {
  let lastNodeKey: string | null = null

  editor.update(
    () => {
      const root = $getRoot()
      for (const node of buildNodes()) {
        root.append(node)
        lastNodeKey = node.getKey()
      }
    },
    {
      onUpdate: () => {
        if (lastNodeKey) scrollNodeIntoView(editor, lastNodeKey)
      },
    },
  )

  return lastNodeKey != null
}

export function ExternalContentInsertPlugin({ onReady }: ExternalContentInsertPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const api: EditorExternalInsertApi = {
      appendText: (text: string) => {
        const trimmed = text.trim()
        if (!trimmed) return false

        return appendAndReveal(editor, () =>
          trimmed
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((lineText) => {
              const paragraph = $createParagraphNode()
              paragraph.append($createTextNode(lineText))
              return paragraph
            }),
        )
      },
      appendLink: (url: string, label?: string) => {
        const trimmedUrl = url.trim()
        if (!trimmedUrl) return false

        return appendAndReveal(editor, () => {
          const linkNode = $createLinkNode(trimmedUrl, {
            target: '_blank',
            rel: 'noopener noreferrer',
          })
          linkNode.append($createTextNode(label?.trim() || trimmedUrl))
          const paragraph = $createParagraphNode()
          paragraph.append(linkNode)
          return [paragraph]
        })
      },
    }

    onReady(api)
    return () => onReady(null)
  }, [editor, onReady])

  return null
}
