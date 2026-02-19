/**
 * Extract h1–h4 headings from Yoopta lesson content for table-of-contents / jump links.
 * Yoopta value can be: Record<blockId, block> or { blocks: block[] }.
 * Block: { id: string, type: string, value: SlateElement[], meta?: object }.
 */

const HEADING_TYPES = ['HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour'] as const
const HEADING_LEVEL_MAP: Record<string, 1 | 2 | 3 | 4> = {
  HeadingOne: 1,
  HeadingTwo: 2,
  HeadingThree: 3,
  HeadingFour: 4,
}

/** Get id of first Slate element in block value; Yoopta renders headings with id={element.id}. */
function getFirstElementId(value: unknown): string | undefined {
  if (value == null || !Array.isArray(value)) return undefined
  const first = value[0]
  if (typeof first !== 'object' || first === null) return undefined
  const id = (first as Record<string, unknown>).id
  return typeof id === 'string' ? id : undefined
}

function getTextFromSlateValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return value.map((node) => getTextFromSlateNode(node)).join('')
}

function getTextFromSlateNode(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (typeof node !== 'object' || node === null) return ''
  const obj = node as Record<string, unknown>
  if ('text' in obj && typeof obj.text === 'string') return obj.text
  if (Array.isArray(obj.children)) {
    return obj.children.map((c: unknown) => getTextFromSlateNode(c)).join('')
  }
  return ''
}

function isBlockLike(obj: unknown): obj is { id: string; type: string; value?: unknown } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'type' in obj &&
    typeof (obj as Record<string, unknown>).type === 'string'
  )
}

function* iterateBlocks(value: Record<string, unknown>): Generator<{ id: string; type: string; value: unknown }> {
  const blocks = value.blocks
  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      if (isBlockLike(b)) yield { id: b.id, type: b.type, value: b.value }
    }
    return
  }
  for (const v of Object.values(value)) {
    if (isBlockLike(v)) yield { id: v.id, type: v.type, value: v.value }
  }
}

export interface LessonHeading {
  level: 1 | 2 | 3 | 4
  text: string
  blockId: string
  /** First Slate element id; Yoopta heading DOM uses this as id for scroll target. */
  elementId?: string
}

export function getHeadingsFromLessonValue(
  value: Record<string, unknown> | undefined,
): LessonHeading[] {
  if (value == null || typeof value !== 'object') return []

  const result: LessonHeading[] = []
  for (const block of iterateBlocks(value)) {
    const level = HEADING_LEVEL_MAP[block.type]
    if (!level || !HEADING_TYPES.includes(block.type as (typeof HEADING_TYPES)[number])) continue
    const text = getTextFromSlateValue(block.value).trim()
    const elementId = getFirstElementId(block.value)
    result.push({
      level,
      text: text || '(Untitled)',
      blockId: block.id,
      elementId,
    })
  }
  return result
}
