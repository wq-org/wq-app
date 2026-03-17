import {
  buildBlockData,
  type SlateElement,
  type YooptaBlockData,
  type YooptaContentValue,
} from '@yoopta/editor'
import { LESSON_YOOPTA_PLUGINS, type LessonBlockType } from '../config/yooptaBlocks'
import type { LessonPage } from '../types/lesson.types'

type LessonPluginDefinition = (typeof LESSON_YOOPTA_PLUGINS)[number]['getPlugin']
type SlateTextNode = {
  text: string
  [key: string]: unknown
}

function getLessonPluginMap(): Map<string, LessonPluginDefinition> {
  return new Map(
    LESSON_YOOPTA_PLUGINS.map((plugin) => {
      const definition = plugin.getPlugin
      return [definition.type, definition]
    }),
  )
}

function getSafeRootElementType(elements: LessonPluginDefinition['elements']): string | null {
  if (!isRecord(elements)) {
    return null
  }

  const entries = Object.entries(elements).filter(
    (entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]),
  )

  if (entries.length === 0) {
    return null
  }

  if (entries.length === 1) {
    return entries[0][0]
  }

  const rootEntry = entries.find(
    ([, elementDefinition]) => isRecord(elementDefinition) && elementDefinition.asRoot === true,
  )
  return rootEntry?.[0] ?? null
}

function getLessonBlockTypeAliases(
  pluginMap: Map<string, LessonPluginDefinition>,
): Map<string, string> {
  const aliases = new Map<string, string>()

  pluginMap.forEach((plugin, blockType) => {
    aliases.set(blockType.toLowerCase(), blockType)

    const rootElementType = getSafeRootElementType(plugin.elements)
    if (rootElementType) {
      aliases.set(rootElementType.toLowerCase(), blockType)
    }
  })

  return aliases
}

const LESSON_PLUGIN_MAP = getLessonPluginMap()
const LESSON_BLOCK_TYPE_ALIASES = getLessonBlockTypeAliases(LESSON_PLUGIN_MAP)

function createPageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `lesson-page-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isYooptaBlockData(value: unknown): value is YooptaBlockData {
  if (typeof value !== 'object' || value == null) return false

  const block = value as Record<string, unknown>

  return (
    typeof block.id === 'string' &&
    typeof block.type === 'string' &&
    Array.isArray(block.value) &&
    typeof block.meta === 'object' &&
    block.meta != null
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

function parsePossiblyEncodedJson(raw: unknown, remainingParses = 2): unknown {
  if (typeof raw !== 'string' || remainingParses <= 0) {
    return raw
  }

  try {
    return parsePossiblyEncodedJson(JSON.parse(raw), remainingParses - 1)
  } catch {
    return raw
  }
}

function isSlateTextNode(value: unknown): value is SlateTextNode {
  return isRecord(value) && typeof value.text === 'string'
}

function normalizeTextNode(rawNode: unknown, fallbackNode: SlateTextNode): SlateTextNode {
  if (!isRecord(rawNode)) {
    return fallbackNode
  }

  const { text, ...textMarks } = rawNode

  return {
    ...fallbackNode,
    ...textMarks,
    text: typeof text === 'string' ? text : fallbackNode.text,
  }
}

function buildDefaultElementStructure(
  elementType: string,
  elements: LessonPluginDefinition['elements'],
): SlateElement {
  const elementDefinition = elements[elementType]

  if (!elementDefinition) {
    return {
      id: createPageId(),
      type: elementType,
      children: [{ text: '' }],
      props: {
        nodeType: 'block',
      },
    } as SlateElement
  }

  const childTypes = Array.isArray(elementDefinition.children) ? elementDefinition.children : []

  return {
    id: createPageId(),
    type: elementType,
    props: elementDefinition.props,
    children:
      childTypes.length > 0
        ? childTypes.map((childType) =>
            elements[childType] ? buildDefaultElementStructure(childType, elements) : { text: '' },
          )
        : [{ text: '' }],
  } as SlateElement
}

function resolveBlockTypeAlias(rawType: unknown): string | null {
  if (typeof rawType !== 'string') return null

  const normalizedType = rawType.trim().toLowerCase()
  if (!normalizedType) return null

  return LESSON_BLOCK_TYPE_ALIASES.get(normalizedType) ?? null
}

function getFirstElementType(rawValue: unknown): string | null {
  if (Array.isArray(rawValue)) {
    const firstEntry = rawValue.find((entry) => isRecord(entry) && typeof entry.type === 'string')
    return typeof firstEntry?.type === 'string' ? firstEntry.type : null
  }

  if (isRecord(rawValue)) {
    const firstEntry = Object.values(rawValue).find(
      (entry) => isRecord(entry) && typeof entry.type === 'string',
    )
    return typeof firstEntry?.type === 'string' ? firstEntry.type : null
  }

  return null
}

function resolveLessonBlockType(rawBlock: Record<string, unknown>): LessonBlockType | null {
  const directType = resolveBlockTypeAlias(rawBlock.type)
  if (directType) {
    return directType as LessonBlockType
  }

  const rootElementType =
    getFirstElementType(rawBlock.value) ?? getFirstElementType(rawBlock.elements)
  const inferredType = resolveBlockTypeAlias(rootElementType)

  return inferredType ? (inferredType as LessonBlockType) : null
}

function createLessonBlockData(blockType: LessonBlockType, order: number): YooptaBlockData | null {
  const plugin = LESSON_PLUGIN_MAP.get(blockType)
  if (!plugin) return null

  const rootElementType = getSafeRootElementType(plugin.elements)
  if (!rootElementType) return null

  return buildBlockData({
    type: blockType,
    meta: {
      order,
      depth: 0,
    },
    value: [buildDefaultElementStructure(rootElementType, plugin.elements)],
  })
}

function normalizeSlateChildren(
  rawChildren: unknown,
  fallbackChildren: readonly unknown[],
): unknown[] {
  if (fallbackChildren.length === 0) {
    return [{ text: '' }]
  }

  if (!Array.isArray(rawChildren) || rawChildren.length === 0) {
    return [...fallbackChildren]
  }

  return fallbackChildren.map((fallbackChild, index) => {
    const rawChild = rawChildren[index]

    if (isSlateTextNode(fallbackChild)) {
      return normalizeTextNode(rawChild, fallbackChild)
    }

    if (isRecord(rawChild) && isRecord(fallbackChild)) {
      return normalizeSlateElement(rawChild, fallbackChild as SlateElement)
    }

    return fallbackChild
  })
}

function normalizeSlateElement(
  rawElement: Record<string, unknown>,
  fallbackElement: SlateElement,
): SlateElement {
  const { id, props, children, ...elementData } = rawElement
  const rawProps = isRecord(props) ? props : {}
  const fallbackProps = isRecord(fallbackElement.props) ? fallbackElement.props : {}
  const fallbackChildren = Array.isArray(fallbackElement.children)
    ? fallbackElement.children
    : [{ text: '' }]

  return {
    ...fallbackElement,
    ...elementData,
    id: typeof id === 'string' && id.trim() ? id : fallbackElement.id,
    type: fallbackElement.type,
    props: {
      ...fallbackProps,
      ...rawProps,
    },
    children: normalizeSlateChildren(children, fallbackChildren),
  } as SlateElement
}

function normalizeBlockValue(
  value: unknown,
  fallbackValue: YooptaBlockData['value'],
): YooptaBlockData['value'] | null {
  if (!Array.isArray(value) || value.length === 0 || fallbackValue.length === 0) {
    return null
  }

  const normalizedElements = value
    .map((item, index) => {
      if (!isRecord(item)) return null

      const fallbackElement = fallbackValue[Math.min(index, fallbackValue.length - 1)]
      return normalizeSlateElement(item, fallbackElement as SlateElement)
    })
    .filter((item): item is YooptaBlockData['value'][number] => item != null)

  if (normalizedElements.length === 0) {
    return null
  }

  return normalizedElements
}

function createBlankLessonContent(): YooptaContentValue {
  const block = createLessonBlockData('Paragraph', 0)

  if (!block) {
    const fallbackBlock = buildBlockData({
      type: 'Paragraph',
      meta: {
        order: 0,
        depth: 0,
      },
    })

    return {
      [fallbackBlock.id]: fallbackBlock,
    } as YooptaContentValue
  }

  return {
    [block.id]: block,
  } as YooptaContentValue
}

function createNormalizedBlock(rawBlock: unknown, index: number): YooptaBlockData | null {
  if (!isRecord(rawBlock)) {
    return null
  }

  const blockType = resolveLessonBlockType(rawBlock)
  if (!blockType) {
    return null
  }

  const fallbackBlock = createLessonBlockData(blockType, index)
  if (!fallbackBlock) {
    return null
  }

  const normalizedValue =
    normalizeBlockValue(rawBlock.value, fallbackBlock.value) ??
    normalizeBlockValue(rawBlock.elements, fallbackBlock.value) ??
    fallbackBlock.value
  const rawMeta = isRecord(rawBlock.meta) ? rawBlock.meta : {}
  const rawOrder = typeof rawMeta.order === 'number' ? rawMeta.order : index

  return {
    ...fallbackBlock,
    ...rawBlock,
    id: typeof rawBlock.id === 'string' && rawBlock.id.trim() ? rawBlock.id : fallbackBlock.id,
    type: blockType,
    value: normalizedValue,
    meta: {
      ...fallbackBlock.meta,
      ...rawMeta,
      order: rawOrder,
    },
  }
}

function parseBlockEntries(raw: unknown): [string, YooptaBlockData][] {
  if (Array.isArray(raw)) {
    return raw
      .map((block, index) => createNormalizedBlock(block, index))
      .filter((block): block is YooptaBlockData => block != null)
      .map((block) => [block.id, block])
  }

  if (!isRecord(raw)) {
    return []
  }

  if (Array.isArray(raw.blocks)) {
    return parseBlockEntries(raw.blocks)
  }

  return Object.values(raw)
    .map((value, index) => createNormalizedBlock(value, index))
    .filter((block): block is YooptaBlockData => block != null)
    .map((block) => [block.id, block])
}

export function createEmptyLessonContent(): YooptaContentValue {
  return createBlankLessonContent()
}

function updateFirstTextDescendant(
  descendants: readonly unknown[],
  text: string,
): [unknown[], boolean] {
  let didUpdate = false

  const nextDescendants = descendants.map((descendant) => {
    if (didUpdate) return descendant

    if (isSlateTextNode(descendant)) {
      didUpdate = true
      return {
        ...descendant,
        text,
      }
    }

    if (!isRecord(descendant) || !Array.isArray(descendant.children)) {
      return descendant
    }

    const [children, childUpdated] = updateFirstTextDescendant(descendant.children, text)
    if (!childUpdated) {
      return descendant
    }

    didUpdate = true

    return {
      ...descendant,
      children,
    }
  })

  return [nextDescendants, didUpdate]
}

export function createLessonTextBlock(
  blockType: LessonBlockType,
  text: string,
  order: number,
): YooptaBlockData {
  const block = createLessonBlockData(blockType, order)

  if (!block) {
    return buildBlockData({
      type: 'Paragraph',
      meta: {
        order,
        depth: 0,
      },
    })
  }

  const [nextValue] = updateFirstTextDescendant(block.value, text)

  return {
    ...block,
    value: nextValue as YooptaBlockData['value'],
  }
}

export function createLessonPage(order: number, content?: YooptaContentValue): LessonPage {
  return {
    id: createPageId(),
    order,
    content: content ?? createEmptyLessonContent(),
  }
}

export function parseYooptaContent(raw: unknown): YooptaContentValue {
  const parsedRaw = parsePossiblyEncodedJson(raw)
  if (typeof parsedRaw !== 'object' || parsedRaw == null) {
    return createEmptyLessonContent()
  }

  const entries = parseBlockEntries(parsedRaw).filter(([, value]) => isYooptaBlockData(value))
  if (entries.length === 0) return createEmptyLessonContent()

  return Object.fromEntries(entries) as YooptaContentValue
}

function normalizePage(page: unknown, order: number): LessonPage {
  if (typeof page !== 'object' || page == null) {
    return createLessonPage(order)
  }

  const record = page as Record<string, unknown>
  const id = typeof record.id === 'string' && record.id.trim() ? record.id : createPageId()

  return {
    id,
    order,
    content: parseYooptaContent(record.content),
  }
}

export function buildLessonPages(rawPages: unknown, fallbackContent?: unknown): LessonPage[] {
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    return normalizeLessonPages(rawPages.map((page, index) => normalizePage(page, index)))
  }

  return normalizeLessonPages([createLessonPage(0, parseYooptaContent(fallbackContent))])
}

function sortBlocksByOrder(content: YooptaContentValue): YooptaBlockData[] {
  return Object.values(content).sort((left, right) => {
    const leftOrder = typeof left.meta?.order === 'number' ? left.meta.order : 0
    const rightOrder = typeof right.meta?.order === 'number' ? right.meta.order : 0
    return leftOrder - rightOrder
  })
}

function buildContentFromBlocks(blocks: readonly YooptaBlockData[]): YooptaContentValue {
  if (blocks.length === 0) return createEmptyLessonContent()

  return Object.fromEntries(
    blocks.map((block, index) => [
      block.id,
      {
        ...block,
        meta: {
          ...block.meta,
          order: index,
        },
      },
    ]),
  ) as YooptaContentValue
}

export function splitLessonPageByPageBreaks(page: LessonPage): LessonPage[] {
  const orderedBlocks = sortBlocksByOrder(page.content)
  const segments: YooptaBlockData[][] = [[]]

  orderedBlocks.forEach((block) => {
    if (block.type === 'PageBreak') {
      segments.push([])
      return
    }

    const currentSegment = segments[segments.length - 1]
    currentSegment.push(block)
  })

  return segments.map((segment, index) => ({
    id: index === 0 ? page.id : createPageId(),
    order: page.order + index,
    content: buildContentFromBlocks(segment),
  }))
}

export function normalizeLessonPages(pages: readonly LessonPage[]): LessonPage[] {
  const expandedPages = pages.flatMap(splitLessonPageByPageBreaks)

  return expandedPages.map((page, index) => ({
    ...page,
    order: index,
    content: buildContentFromBlocks(sortBlocksByOrder(page.content)),
  }))
}

export function serializeLessonContent(pages: readonly LessonPage[]): string {
  const firstPage = pages[0]?.content ?? createEmptyLessonContent()
  return JSON.stringify(firstPage)
}

export function replaceLessonPage(
  pages: readonly LessonPage[],
  pageId: string,
  content: YooptaContentValue,
): LessonPage[] {
  return normalizeLessonPages(
    pages.map((page) => (page.id === pageId ? { ...page, content } : page)),
  )
}

export function appendLessonPage(pages: readonly LessonPage[]): LessonPage[] {
  return normalizeLessonPages([...pages, createLessonPage(pages.length)])
}

export function removeLessonPage(pages: readonly LessonPage[], pageId: string): LessonPage[] {
  const remainingPages = pages.filter((page) => page.id !== pageId)
  if (remainingPages.length === 0) return [createLessonPage(0)]
  return normalizeLessonPages(remainingPages)
}

export function buildPageBreakContentLabel(pageNumber: number): string {
  return `${pageNumber}`
}

export function createPageBreakBlock(order: number): YooptaBlockData {
  const block = buildBlockData({
    type: 'PageBreak',
    value: [
      {
        id: createPageId(),
        type: 'page-break',
        children: [{ text: '' }],
        props: {
          nodeType: 'void',
        },
      },
    ],
    meta: {
      order,
      depth: 0,
    },
  })

  return block
}
