import { useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isHeadingNode, type HeadingTagType } from '@lexical/rich-text'
import { $getRoot, $isElementNode, type LexicalNode, type NodeKey } from 'lexical'

import type { ScrollDrivenIndexItem } from '@/components/shared/scroll-driven-index'

export type LessonHeadingItem = ScrollDrivenIndexItem

const SUPPORTED_HEADING_TAGS = new Set<HeadingTagType>(['h1', 'h2', 'h3'])

type HeadingRecord = {
  key: NodeKey
  text: string
}

type HeadingExtractorPluginProps = {
  onHeadingsChange: (items: LessonHeadingItem[]) => void
}

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

function collectHeadings(node: LexicalNode, headings: HeadingRecord[]): void {
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

function getHeadingItems(): LessonHeadingItem[] {
  const headings: HeadingRecord[] = []
  collectHeadings($getRoot(), headings)

  const slugCounts = new Map<string, number>()
  headings.forEach(({ text }) => {
    const base = getSlugBase(text)
    if (base.length > 0) {
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1)
    }
  })

  return headings.map(({ key, text }) => {
    const base = getSlugBase(text)
    const id = getHeadingId(text, key, base.length > 0 && (slugCounts.get(base) ?? 0) > 1)
    return {
      id,
      label: text,
      href: `#${id}`,
    }
  })
}

export function HeadingExtractorPlugin({ onHeadingsChange }: HeadingExtractorPluginProps): null {
  const [editor] = useLexicalComposerContext()
  const previousItemsRef = useRef('')

  useEffect(() => {
    const emitHeadings = () => {
      editor.getEditorState().read(() => {
        const items = getHeadingItems()
        const serializedItems = JSON.stringify(items)
        if (serializedItems === previousItemsRef.current) {
          return
        }

        previousItemsRef.current = serializedItems
        onHeadingsChange(items)
      })
    }

    emitHeadings()

    return editor.registerUpdateListener(() => {
      emitHeadings()
    })
  }, [editor, onHeadingsChange])

  return null
}
