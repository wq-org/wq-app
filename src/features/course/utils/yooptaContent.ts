import { buildBlockData, type YooptaBlockData } from '@yoopta/editor'

function hasSlateChildren(value: unknown): value is { children: unknown[] } {
  return typeof value === 'object' && value != null && 'children' in value
}

function setBlockText(block: YooptaBlockData, text: string): YooptaBlockData {
  const [firstElement, ...restElements] = Array.isArray(block.value) ? block.value : []

  if (!firstElement || !hasSlateChildren(firstElement) || !Array.isArray(firstElement.children)) {
    return block
  }

  return {
    ...block,
    value: [
      {
        ...firstElement,
        children: [{ text }],
      },
      ...restElements,
    ],
  }
}

function createTextBlock(type: string, text: string, order: number): YooptaBlockData {
  const block = buildBlockData({
    type,
    meta: {
      order,
      depth: 0,
    },
  })

  return setBlockText(block, text)
}

export function createYooptaStarterContentObject(): Record<string, unknown> {
  const blocks = [
    createTextBlock('HeadingOne', 'Lesson Title', 0),
    createTextBlock('Paragraph', 'Add a short introduction to this lesson.', 1),
    createTextBlock('BulletedList', 'Write one important takeaway here.', 2),
  ]

  return Object.fromEntries(
    blocks.map((block) => [block.id, block as unknown as Record<string, unknown>]),
  )
}

export function createYooptaStarterContentJson(): string {
  return JSON.stringify(createYooptaStarterContentObject())
}
