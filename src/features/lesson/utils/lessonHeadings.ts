import type { YooptaContentValue } from '@yoopta/editor'
import type { LessonPage } from '../types/lesson.types'

const HEADING_TYPES = ['HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour'] as const
const HEADING_LEVEL_MAP: Record<string, 1 | 2 | 3 | 4> = {
  HeadingOne: 1,
  HeadingTwo: 2,
  HeadingThree: 3,
  HeadingFour: 4,
}

function getSlateText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node !== 'object' || node == null) return ''

  const record = node as Record<string, unknown>
  if (typeof record.text === 'string') return record.text
  if (!Array.isArray(record.children)) return ''

  return record.children.map(getSlateText).join('')
}

function getElementId(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const first = value[0]
  if (typeof first !== 'object' || first == null) return undefined
  const id = (first as Record<string, unknown>).id
  return typeof id === 'string' ? id : undefined
}

export type LessonHeading = {
  blockId: string
  elementId?: string
  level: 1 | 2 | 3 | 4
  pageId: string
  pageNumber: number
  text: string
}

export function getHeadingsFromLessonContent(
  content: YooptaContentValue | undefined,
  pageId: string,
  pageNumber: number,
): LessonHeading[] {
  if (!content) return []

  return Object.values(content)
    .filter((block) => HEADING_TYPES.includes(block.type as (typeof HEADING_TYPES)[number]))
    .sort((left, right) => {
      const leftOrder = typeof left.meta?.order === 'number' ? left.meta.order : 0
      const rightOrder = typeof right.meta?.order === 'number' ? right.meta.order : 0
      return leftOrder - rightOrder
    })
    .map((block) => {
      const text = Array.isArray(block.value) ? block.value.map(getSlateText).join('').trim() : ''

      return {
        blockId: block.id,
        elementId: getElementId(block.value),
        level: HEADING_LEVEL_MAP[block.type],
        pageId,
        pageNumber,
        text: text || 'Untitled',
      }
    })
}

export function getHeadingsFromLessonPages(pages: readonly LessonPage[]): LessonHeading[] {
  return pages.flatMap((page, index) =>
    getHeadingsFromLessonContent(page.content, page.id, index + 1),
  )
}
