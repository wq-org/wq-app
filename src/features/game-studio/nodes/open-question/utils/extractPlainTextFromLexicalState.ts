import type { SerializedEditorState } from 'lexical'

/** Lexical node types omitted from grading text (media / layout only). */
const SKIPPED_NODE_TYPES = new Set([
  'image',
  'imageplaceholder',
  'horizontalrule',
  'page-break',
  'linebreak',
])

const BLOCK_NODE_TYPES = new Set(['paragraph', 'heading', 'quote', 'list', 'listitem', 'code'])

type SerializedNodeLike = {
  type?: string
  text?: string
  children?: unknown[]
}

function walkNode(node: unknown, lines: string[], lineParts: string[]): void {
  if (!node || typeof node !== 'object') return

  const typed = node as SerializedNodeLike
  const nodeType = typed.type ?? ''

  if (nodeType && SKIPPED_NODE_TYPES.has(nodeType)) {
    return
  }

  if (nodeType === 'text' && typeof typed.text === 'string') {
    lineParts.push(typed.text)
    return
  }

  if (Array.isArray(typed.children)) {
    for (const child of typed.children) {
      walkNode(child, lines, lineParts)
    }
  }

  if (nodeType && BLOCK_NODE_TYPES.has(nodeType) && lineParts.length > 0) {
    lines.push(lineParts.join('').replace(/\s+/g, ' ').trim())
    lineParts.length = 0
  }
}

/** Plain text for grading — images and other media nodes are skipped. */
export function extractPlainTextFromLexicalState(
  state: SerializedEditorState | null | undefined,
): string {
  if (!state?.root) return ''

  const lines: string[] = []
  const lineParts: string[] = []
  walkNode(state.root, lines, lineParts)

  if (lineParts.length > 0) {
    lines.push(lineParts.join('').replace(/\s+/g, ' ').trim())
  }

  return lines
    .filter((line) => line.length > 0)
    .join('\n')
    .trim()
}
