import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isHeadingNode, HeadingNode, type HeadingTagType } from '@lexical/rich-text'
import { $getRoot, $isElementNode, type LexicalNode, type NodeKey } from 'lexical'

const SUPPORTED_HEADING_TAGS = new Set<HeadingTagType>(['h1', 'h2', 'h3'])

function getSlugBase(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getHeadingId(text: string, nodeKey: NodeKey, isDuplicate: boolean): string {
  const base = getSlugBase(text)
  if (base.length === 0) {
    return `heading-${nodeKey}`
  }
  return isDuplicate ? `${base}-${nodeKey}` : base
}

function collectHeadings(node: LexicalNode, headings: Array<{ key: NodeKey; text: string }>): void {
  if ($isHeadingNode(node) && SUPPORTED_HEADING_TAGS.has(node.getTag())) {
    headings.push({
      key: node.getKey(),
      text: node.getTextContent(),
    })
  }

  if (!$isElementNode(node)) {
    return
  }

  node.getChildren().forEach((child) => collectHeadings(child, headings))
}

export function HeadingIdPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const syncHeadingIds = () => {
      editor.getEditorState().read(() => {
        const headings: Array<{ key: NodeKey; text: string }> = []
        collectHeadings($getRoot(), headings)

        const slugCounts = new Map<string, number>()
        headings.forEach(({ text }) => {
          const base = getSlugBase(text)
          if (base.length > 0) {
            slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1)
          }
        })

        headings.forEach(({ key, text }) => {
          const domEl = editor.getElementByKey(key)
          if (!domEl) {
            return
          }

          const tag = domEl.tagName.toLowerCase()
          if (!['h1', 'h2', 'h3'].includes(tag)) {
            return
          }

          const base = getSlugBase(text)
          const id = getHeadingId(text, key, base.length > 0 && (slugCounts.get(base) ?? 0) > 1)
          if (domEl.id !== id) {
            domEl.id = id
          }
        })
      })
    }

    syncHeadingIds()

    const unregisterUpdate = editor.registerUpdateListener(() => {
      syncHeadingIds()
    })
    const unregisterHeadingMutation = editor.registerMutationListener(HeadingNode, () => {
      syncHeadingIds()
    })

    return () => {
      unregisterUpdate()
      unregisterHeadingMutation()
    }
  }, [editor])

  return null
}
