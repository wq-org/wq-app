import type { SerializedEditorState, SerializedParagraphNode, SerializedTextNode } from 'lexical'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'

import type { LessonDraftState } from '../types/lesson.types'

export const LESSON_CONTENT_SCHEMA_VERSION = 1 as const

function createTextNode(text: string, format = 0): SerializedTextNode {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function createParagraphNode(...children: SerializedTextNode[]): SerializedParagraphNode {
  return {
    children,
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
    children: [createParagraphNode(createTextNode(text))],
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

function createYouTubeNode(videoId: string) {
  return {
    type: 'youtube',
    version: 1,
    format: '',
    videoID: videoId,
  }
}

/** Keep in sync with `supabase/seed/default_lesson_starter_lexical.json` and `app.default_lesson_starter_lexical_state()`. */
const DEFAULT_LESSON_LEXICAL_STATE = {
  root: {
    children: [
      createHeadingNode('h1', 'Welcome to WQ Edu 👋'),
      createParagraphNode(
        createTextNode('Type '),
        createTextNode('/', 1),
        createTextNode(
          ' anywhere to open the block menu - pick headings, images, lists, videos, and more. ',
        ),
        createTextNode('Select any text', 1),
        createTextNode(
          ' and a floating toolbar appears for bold, links, and quick edits. Your lesson saves automatically as you write.',
        ),
      ),
      createHeadingNode('h2', 'Get started in three steps'),
      createListNode('number', [
        'Click in the lesson and type / to see all block types.',
        'Highlight text to format it from the floating toolbar.',
        'Replace this starter page with your own lesson content.',
      ]),
      createYouTubeNode('FXIrojSK3Jo'),
      createHeadingNode('h2', 'Blocks you can use'),
      createListNode('bullet', [
        'Text - everyday lesson writing. Press Enter for a new paragraph.',
        'Headings (H1, H2, H3) - titles and sections. Use H1 once for the lesson title, then H2 and H3 to structure the page.',
        'Image - upload a file or choose one from Cloud.',
        'Emoji - add emoji inside a sentence.',
        'YouTube video - paste a link to embed a video (see the example above).',
        'To-do list - checkboxes for your own planning notes.',
        'Bulleted and numbered lists - steps, key points, or summaries.',
        'Quote - citations or highlighted remarks.',
      ]),
      createHeadingNode('h2', 'Saving your work'),
      createParagraphNode(
        createTextNode(
          'After you stop typing for a moment, your draft is saved for you. When you publish, learners see a stable snapshot of that version.',
        ),
      ),
      createQuoteNode(
        'Inspired by Notion - thank you for showing how a notes app can feel simple and right. https://www.notion.so/',
      ),
      createParagraphNode(
        createTextNode(
          'Tip: Delete or edit any block on this page - it is only here to help you learn the editor.',
        ),
      ),
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
