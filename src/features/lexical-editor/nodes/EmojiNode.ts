import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from 'lexical'

export type SerializedEmojiNode = Spread<
  {
    emoji: string
  },
  SerializedTextNode
>

function $convertEmojiElement(domNode: HTMLElement): DOMConversionOutput | null {
  const textContent = domNode.textContent
  const emoji = domNode.getAttribute('data-lexical-emoji-char')

  if (textContent !== null) {
    const node = $createEmojiNode(typeof emoji === 'string' ? emoji : textContent)
    return { node }
  }

  return null
}

export class EmojiNode extends TextNode {
  __emoji: string

  static getType(): string {
    return 'emoji'
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__emoji, node.__text, node.__key)
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(serializedNode.emoji).updateFromJSON(serializedNode)
  }

  constructor(emoji: string, text?: string, key?: NodeKey) {
    super(text ?? emoji, key)
    this.__emoji = emoji
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      emoji: this.__emoji,
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = super.createDOM(_config)
    dom.className = 'emoji-node'
    dom.setAttribute('aria-label', this.__emoji)
    dom.spellcheck = false
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-lexical-emoji', 'true')
    element.setAttribute('data-lexical-emoji-char', this.__emoji)
    element.textContent = this.__text
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-emoji')) {
          return null
        }
        return {
          conversion: $convertEmojiElement,
          priority: 1,
        }
      },
    }
  }

  isTextEntity(): true {
    return true
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }
}

export function $createEmojiNode(emoji: string): EmojiNode {
  const emojiNode = new EmojiNode(emoji)
  emojiNode.setMode('segmented').toggleDirectionless()
  return $applyNodeReplacement(emojiNode)
}

export function $isEmojiNode(node: LexicalNode | null | undefined): node is EmojiNode {
  return node instanceof EmojiNode
}
