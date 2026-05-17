import type { SerializedEditorState, SerializedParagraphNode, SerializedTextNode } from 'lexical'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'

import type { LessonDraftState } from '../types/lesson.types'

export const LESSON_CONTENT_SCHEMA_VERSION = 1 as const

function createTextNode(text: string): SerializedTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function createParagraphNode(text: string): SerializedParagraphNode {
  return {
    children: [createTextNode(text)],
    direction: null,
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  }
}

function createHeadingNode(tag: SerializedHeadingNode['tag'], text: string): SerializedHeadingNode {
  return {
    children: [createTextNode(text)],
    direction: null,
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

function createQuoteNode(text: string): SerializedQuoteNode {
  return {
    children: [createTextNode(text)],
    direction: null,
    format: '',
    indent: 0,
    type: 'quote',
    version: 1,
  }
}

function createListItemNode(text: string): SerializedListItemNode {
  return {
    children: [createParagraphNode(text)],
    checked: undefined,
    direction: null,
    format: '',
    indent: 0,
    type: 'listitem',
    value: 1,
    version: 1,
  }
}

function createListNode(
  listType: SerializedListNode['listType'],
  items: string[],
): SerializedListNode {
  return {
    children: items.map(createListItemNode),
    direction: null,
    format: '',
    indent: 0,
    listType,
    start: 1,
    tag: listType === 'number' ? 'ol' : 'ul',
    type: 'list',
    version: 1,
  }
}

const DEFAULT_LESSON_LEXICAL_STATE = {
  root: {
    children: [
      createParagraphNode(
        'Start writing your lesson content here. Add goals, context, and the key learning outcome for this lesson.',
      ),
      createHeadingNode('h1', 'Lesson overview'),
      createParagraphNode(
        'Serious Games can help learners explore complex topics through interaction, repetition, and feedback.',
      ),
      createHeadingNode('h2', 'Learning objectives'),
      createParagraphNode(
        'Use Serious Games in this lesson to connect theory with practice and improve learner engagement.',
      ),
      createHeadingNode('h3', 'Key points'),
      createListNode('bullet', [
        'Introduce the topic clearly',
        'Guide learners through the activity',
        'Summarize the expected outcome',
      ]),
      createListNode('number', [
        'Explain the task',
        'Let learners interact with the content',
        'Review the result together',
      ]),
      createQuoteNode('Good learning design combines clarity, structure, and interaction.'),
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} satisfies SerializedEditorState

function isEmptySerializedNode(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return true
  }

  const candidate = node as {
    children?: unknown[]
    text?: unknown
  }

  if (typeof candidate.text === 'string') {
    return candidate.text.trim().length === 0
  }

  if (Array.isArray(candidate.children)) {
    return candidate.children.length === 0 || candidate.children.every(isEmptySerializedNode)
  }

  return false
}

export function isBlankLessonDraftState(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return true
  }

  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) {
    return true
  }

  return root.children.every(isEmptySerializedNode)
}

export function createDefaultLessonLexicalState(): LessonDraftState {
  return JSON.parse(JSON.stringify(DEFAULT_LESSON_LEXICAL_STATE)) as LessonDraftState
}

export function resolveLessonDraftState(value: unknown): LessonDraftState {
  return isBlankLessonDraftState(value)
    ? createDefaultLessonLexicalState()
    : (value as LessonDraftState)
}
