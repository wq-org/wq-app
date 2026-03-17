import type { YooptaContentValue } from '@yoopta/editor'

export const TEMPLATE_BLOCK_COUNT = 15

type BlockSpec = {
  type: string
  slateType: string
  text: string
}

const TEMPLATE_BLOCKS: readonly BlockSpec[] = [
  { type: 'HeadingOne', slateType: 'heading-one', text: 'Lesson Title' },
  {
    type: 'Paragraph',
    slateType: 'paragraph',
    text: 'Write a short introduction for this lesson…',
  },
  { type: 'HeadingTwo', slateType: 'heading-two', text: 'Learning Objectives' },
  { type: 'BulletedList', slateType: 'bulleted-list', text: 'Students will be able to…' },
  { type: 'BulletedList', slateType: 'bulleted-list', text: 'Students will understand…' },
  { type: 'BulletedList', slateType: 'bulleted-list', text: 'Students will apply…' },
  { type: 'HeadingTwo', slateType: 'heading-two', text: 'Core Content' },
  { type: 'Paragraph', slateType: 'paragraph', text: 'Explain the main concept here…' },
  { type: 'HeadingThree', slateType: 'heading-three', text: 'Key Concepts' },
  { type: 'NumberedList', slateType: 'numbered-list', text: 'First concept or step' },
  { type: 'NumberedList', slateType: 'numbered-list', text: 'Second concept or step' },
  { type: 'NumberedList', slateType: 'numbered-list', text: 'Third concept or step' },
  {
    type: 'Blockquote',
    slateType: 'blockquote',
    text: 'Important: Add a key clinical note or reminder here.',
  },
  { type: 'HeadingTwo', slateType: 'heading-two', text: 'Summary' },
  { type: 'Paragraph', slateType: 'paragraph', text: 'Summarise the key takeaways for students…' },
]

function newId(): string {
  return crypto.randomUUID()
}

export function createDefaultLessonContent(): YooptaContentValue {
  const result: Record<string, unknown> = {}

  TEMPLATE_BLOCKS.forEach((spec, order) => {
    const blockId = newId()
    const nodeId = newId()

    result[blockId] = {
      id: blockId,
      type: spec.type,
      value: [
        {
          id: nodeId,
          type: spec.slateType,
          props: { nodeType: 'block' },
          children: [{ text: spec.text }],
        },
      ],
      meta: {
        order,
        depth: 0,
        align: 'left' as const,
      },
    }
  })

  return result as YooptaContentValue
}
