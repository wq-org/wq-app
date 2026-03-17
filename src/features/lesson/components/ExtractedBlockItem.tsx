import { Checkbox } from '@/components/ui/checkbox'

const BLOCK_TYPE_DISPLAY_LABEL: Record<string, string> = {
  HeadingOne: '1 Heading',
  HeadingTwo: '2 Heading',
  HeadingThree: '3 Heading',
  Paragraph: 'Paragraph',
  Blockquote: 'Blockquote',
  Code: 'Code',
  NumberedList: 'Numbered list',
  BulletedList: 'Bulleted list',
  TodoList: 'Todo list',
  PageBreak: 'Page break',
}

function getBlockTypeDisplayLabel(blockType: string): string {
  return BLOCK_TYPE_DISPLAY_LABEL[blockType] ?? blockType
}

type ExtractedBlockItemProps = {
  block: Record<string, unknown>
  isSelected: boolean
  onToggle: () => void
}

function getBlockLabel(block: Record<string, unknown>): { type: string; text: string } {
  const blockType = typeof block.type === 'string' ? block.type : 'Unknown'

  const value = Array.isArray(block.value) ? block.value : []
  const firstElement =
    value.length > 0 && typeof value[0] === 'object' && value[0] != null
      ? (value[0] as Record<string, unknown>)
      : null

  const children = Array.isArray(firstElement?.children) ? firstElement.children : []
  const textParts = children
    .filter(
      (c): c is { text: string } =>
        typeof c === 'object' &&
        c != null &&
        typeof (c as Record<string, unknown>).text === 'string',
    )
    .map((c) => c.text)

  return { type: blockType, text: textParts.join('') || '(empty)' }
}

function isHeadingType(type: string): boolean {
  return type === 'HeadingOne' || type === 'HeadingTwo' || type === 'HeadingThree'
}

export function ExtractedBlockItem({ block, isSelected, onToggle }: ExtractedBlockItemProps) {
  const { type, text } = getBlockLabel(block)
  const heading = isHeadingType(type)

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border-0 bg-card/60 px-3 py-2.5 transition-colors hover:bg-card">
      <Checkbox
        variant="darkblue"
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wider text-[oklch(var(--oklch-darkblue))]">
          {getBlockTypeDisplayLabel(type)}
        </span>
        <span
          className={`block text-sm whitespace-pre-wrap break-words ${heading ? 'font-semibold' : 'text-muted-foreground'}`}
        >
          {text}
        </span>
      </span>
    </label>
  )
}
