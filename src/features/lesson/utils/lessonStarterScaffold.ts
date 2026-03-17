import { Blocks, Elements, type YooEditor } from '@yoopta/editor'

const STARTER_CONTENT = {
  heading: 'Learning Goal',
  intro:
    'Explain in two or three sentences what learners should understand before they start the worksheet.',
  bullets: [
    'Highlight the key concept or vocabulary that matters most on this page.',
    'Add one guiding question learners should answer while they read.',
  ],
  task: 'Task: Summarize the main idea in your own words and give one concrete example.',
} as const

function getInsertionPath(editor: YooEditor, fallbackPath?: number): number {
  if (typeof fallbackPath === 'number') return fallbackPath
  if (typeof editor.path.current === 'number') return editor.path.current + 1
  return Object.keys(editor.children).length
}

function insertTextBlock(editor: YooEditor, type: string, text: string, at: number): number {
  const blockId = Blocks.insertBlock(editor, type, {
    at,
    focus: false,
  })

  Elements.insertElementText(editor, text, { blockId, focus: false })
  return at + 1
}

export function insertLessonStarterScaffold(editor: YooEditor): void {
  let insertionPath = getInsertionPath(editor)

  insertionPath = insertTextBlock(editor, 'HeadingOne', STARTER_CONTENT.heading, insertionPath)
  insertionPath = insertTextBlock(editor, 'Paragraph', STARTER_CONTENT.intro, insertionPath)

  STARTER_CONTENT.bullets.forEach((bullet) => {
    insertionPath = insertTextBlock(editor, 'BulletedList', bullet, insertionPath)
  })

  insertTextBlock(editor, 'Paragraph', STARTER_CONTENT.task, insertionPath)
}
