/* eslint-disable react-refresh/only-export-components -- self-contained markdown paste kit exports extension, helpers, and React entry points */
/**
 * MarkdownPastePlugin
 *
 * Auto-formats AI-generated markdown when the user pastes into a Lexical editor.
 */

import type { Transformer } from '@lexical/markdown'
import type {
  EditorThemeClasses,
  Klass,
  LexicalEditor,
  LexicalNode,
  SerializedLexicalNode,
} from 'lexical'
import type { JSX, ReactNode } from 'react'

import { $generateNodesFromSerializedNodes, $insertGeneratedNodes } from '@lexical/clipboard'
import { CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { HistoryExtension } from '@lexical/history'
import { CheckListExtension, ListExtension } from '@lexical/list'
import {
  $convertFromMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  CHECK_LIST,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from '@lexical/markdown'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { RichTextExtension } from '@lexical/rich-text'
import { objectKlassEquals } from '@lexical/utils'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  configExtension,
  createEditor,
  defineExtension,
  PASTE_COMMAND,
  PASTE_TAG,
  type PasteCommandType,
  safeCast,
} from 'lexical'
import { useEffect, useMemo } from 'react'

// ---------------------------------------------------------------------------
// CSS (injected once via injectMarkdownPasteStyles)
// ---------------------------------------------------------------------------

export const MARKDOWN_PASTE_STYLES = `
.LMP__paragraph{margin:.25rem 0}
.LMP__h1{font-size:1.875rem;font-weight:700;margin:.5rem 0}
.LMP__h2{font-size:1.5rem;font-weight:700;margin:.5rem 0}
.LMP__h3{font-size:1.25rem;font-weight:600;margin:.375rem 0}
.LMP__h4,.LMP__h5,.LMP__h6{font-size:1.125rem;font-weight:600;margin:.25rem 0}
.LMP__quote{border-left:3px solid #cbd5e1;color:#64748b;margin:.5rem 0;padding-left:1rem}
.LMP__ul{list-style-type:disc;margin:0;padding-left:1.5rem}
.LMP__ol{list-style-type:decimal;margin:0;padding-left:1.5rem}
.LMP__checklist{list-style:none;padding-left:0}
.LMP__listitem{margin:.125rem 1.5rem}
.LMP__listitemUnchecked{list-style:none;padding-left:1.5rem;position:relative}
.LMP__listitemUnchecked::before{border:1px solid #94a3b8;border-radius:2px;content:'';height:1rem;left:0;position:absolute;top:.2rem;width:1rem}
.LMP__listitemChecked{color:#64748b;list-style:none;padding-left:1.5rem;position:relative;text-decoration:line-through}
.LMP__listitemChecked::before{align-items:center;background:#3b82f6;border:1px solid #3b82f6;border-radius:2px;color:#fff;content:'✓';display:flex;font-size:.625rem;height:1rem;justify-content:center;left:0;line-height:1;position:absolute;top:.2rem;width:1rem}
.LMP__bold{font-weight:700}
.LMP__italic{font-style:italic}
.LMP__strikethrough{text-decoration:line-through}
.LMP__code{background:rgb(0 0 0/6%);border-radius:.25rem;font-family:ui-monospace,monospace;font-size:.9em;padding:.1rem .25rem}
.LMP__link{color:#2563eb;text-decoration:underline}
.lmp-editor-shell{border:1px solid rgb(0 0 0/10%);border-radius:.75rem;display:flex;flex-direction:column;min-height:280px;overflow:hidden}
.lmp-editor-toolbar{background:#f8fafc;border-bottom:1px solid rgb(0 0 0/8%);color:#64748b;font-size:.75rem;font-weight:600;letter-spacing:.05em;padding:.625rem 1rem;text-transform:uppercase}
.lmp-content-editable{flex:1;font-size:1rem;line-height:1.625;min-height:220px;outline:none;overflow:auto;padding:1rem}
.lmp-placeholder{color:#94a3b8;left:1rem;pointer-events:none;position:absolute;top:1rem;user-select:none}
.lmp-hint{background:#f1f5f9;border-top:1px solid rgb(0 0 0/6%);color:#64748b;font-size:.8125rem;padding:.5rem 1rem}
`

let stylesInjected = false

/** Inject kit CSS once. Safe to call multiple times. */
export function injectMarkdownPasteStyles(): void {
  if (stylesInjected || typeof document === 'undefined') {
    return
  }
  const el = document.createElement('style')
  el.setAttribute('data-markdown-paste-plugin', '')
  el.textContent = MARKDOWN_PASTE_STYLES
  document.head.appendChild(el)
  stylesInjected = true
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export const MARKDOWN_PASTE_CLASS_PREFIX = 'LMP'

export const markdownPasteTheme: EditorThemeClasses = {
  heading: {
    h1: `${MARKDOWN_PASTE_CLASS_PREFIX}__h1`,
    h2: `${MARKDOWN_PASTE_CLASS_PREFIX}__h2`,
    h3: `${MARKDOWN_PASTE_CLASS_PREFIX}__h3`,
    h4: `${MARKDOWN_PASTE_CLASS_PREFIX}__h4`,
    h5: `${MARKDOWN_PASTE_CLASS_PREFIX}__h5`,
    h6: `${MARKDOWN_PASTE_CLASS_PREFIX}__h6`,
  },
  link: `${MARKDOWN_PASTE_CLASS_PREFIX}__link`,
  list: {
    checklist: `${MARKDOWN_PASTE_CLASS_PREFIX}__checklist`,
    listitem: `${MARKDOWN_PASTE_CLASS_PREFIX}__listitem`,
    listitemChecked: `${MARKDOWN_PASTE_CLASS_PREFIX}__listitemChecked`,
    listitemUnchecked: `${MARKDOWN_PASTE_CLASS_PREFIX}__listitemUnchecked`,
    nested: { listitem: `${MARKDOWN_PASTE_CLASS_PREFIX}__nestedListitem` },
    ol: `${MARKDOWN_PASTE_CLASS_PREFIX}__ol`,
    ul: `${MARKDOWN_PASTE_CLASS_PREFIX}__ul`,
  },
  paragraph: `${MARKDOWN_PASTE_CLASS_PREFIX}__paragraph`,
  quote: `${MARKDOWN_PASTE_CLASS_PREFIX}__quote`,
  text: {
    bold: `${MARKDOWN_PASTE_CLASS_PREFIX}__bold`,
    code: `${MARKDOWN_PASTE_CLASS_PREFIX}__code`,
    highlight: `${MARKDOWN_PASTE_CLASS_PREFIX}__highlight`,
    italic: `${MARKDOWN_PASTE_CLASS_PREFIX}__italic`,
    strikethrough: `${MARKDOWN_PASTE_CLASS_PREFIX}__strikethrough`,
  },
}

export function mergeMarkdownPasteTheme(base: EditorThemeClasses = {}): EditorThemeClasses {
  return {
    ...base,
    heading: { ...base.heading, ...markdownPasteTheme.heading },
    link: markdownPasteTheme.link,
    list: {
      ...base.list,
      ...markdownPasteTheme.list,
      nested: { ...base.list?.nested, ...markdownPasteTheme.list?.nested },
    },
    paragraph: markdownPasteTheme.paragraph,
    quote: markdownPasteTheme.quote,
    text: { ...base.text, ...markdownPasteTheme.text },
  }
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

export { AutoLinkNode, CodeNode, HeadingNode, LinkNode, ListItemNode, ListNode, QuoteNode }

export const markdownPasteNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  LinkNode,
  AutoLinkNode,
]

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

export {
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  CHECK_LIST,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  type Transformer,
}

export const MARKDOWN_PASTE_TRANSFORMERS: Transformer[] = [
  HEADING,
  CHECK_LIST,
  UNORDERED_LIST,
  ORDERED_LIST,
  QUOTE,
  CODE,
  INLINE_CODE,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  LINK,
]

// ---------------------------------------------------------------------------
// Markdown detection
// ---------------------------------------------------------------------------

const MARKDOWN_BLOCK_PATTERNS = /(^|\n)(#{1,6}\s|[-*+]\s|[-*+]\[[ xX]\]\s|\d+\.\s|>\s|```)/
const MARKDOWN_INLINE_PATTERNS =
  /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)]+\)|~~[^~\n]+~~)/

export interface DetectMarkdownOptions {
  minLength?: number
  shouldTransform?: (plainText: string, html: string | null) => boolean
}

export function looksLikeMarkdown(plainText: string, options: DetectMarkdownOptions = {}): boolean {
  const { minLength = 3, shouldTransform } = options
  if (shouldTransform) {
    return shouldTransform(plainText, null)
  }
  const trimmed = plainText.trim()
  if (trimmed.length < minLength) {
    return false
  }
  return MARKDOWN_BLOCK_PATTERNS.test(trimmed) || MARKDOWN_INLINE_PATTERNS.test(trimmed)
}

export function shouldPasteAsMarkdown(
  plainText: string,
  html: string | null | undefined,
  options: DetectMarkdownOptions = {},
): boolean {
  const { shouldTransform } = options
  if (shouldTransform) {
    return shouldTransform(plainText, html ?? null)
  }
  if (!plainText.trim() || !looksLikeMarkdown(plainText, options)) {
    return false
  }
  if (!html || html.trim() === '' || html === plainText) {
    return true
  }
  if (html.includes('<') && html.includes('>')) {
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Parse + insert helpers
// ---------------------------------------------------------------------------

export interface MarkdownPasteOptions {
  transformers?: Transformer[]
  shouldPreserveNewlines?: boolean
  mergeAdjacentNewlines?: boolean
}

const DEFAULT_PASTE_OPTIONS = {
  mergeAdjacentNewlines: false,
  shouldPreserveNewlines: true,
} as const

let parserEditor: LexicalEditor | null = null

function getParserEditor(): LexicalEditor {
  if (!parserEditor) {
    parserEditor = createEditor({
      namespace: 'markdown-paste-plugin-parser',
      nodes: markdownPasteNodes,
      onError: (error) => {
        throw error
      },
    })
  }
  return parserEditor
}

export function parseMarkdownToSerializedNodes(
  markdown: string,
  options: MarkdownPasteOptions = {},
): SerializedLexicalNode[] {
  const transformers = options.transformers ?? MARKDOWN_PASTE_TRANSFORMERS
  const shouldPreserveNewlines =
    options.shouldPreserveNewlines ?? DEFAULT_PASTE_OPTIONS.shouldPreserveNewlines
  const mergeAdjacentNewlines =
    options.mergeAdjacentNewlines ?? DEFAULT_PASTE_OPTIONS.mergeAdjacentNewlines
  const parser = getParserEditor()
  let serialized: SerializedLexicalNode[] = []
  parser.update(() => {
    $convertFromMarkdownString(
      markdown,
      transformers,
      undefined,
      shouldPreserveNewlines,
      mergeAdjacentNewlines,
    )
    serialized = $getRoot()
      .getChildren()
      .map((child) => child.exportJSON())
    $getRoot().clear()
  })
  return serialized
}

export function $insertMarkdownAtSelection(
  editor: LexicalEditor,
  markdown: string,
  options: MarkdownPasteOptions = {},
): boolean {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    return false
  }
  const serialized = parseMarkdownToSerializedNodes(markdown, options)
  if (serialized.length === 0) {
    return false
  }
  const nodes = $generateNodesFromSerializedNodes(serialized)
  if (!selection.isCollapsed()) {
    selection.removeText()
  }
  $insertGeneratedNodes(editor, nodes, selection)
  return true
}

export function $replaceEditorWithMarkdown(
  markdown: string,
  options: MarkdownPasteOptions = {},
): void {
  $convertFromMarkdownString(
    markdown,
    options.transformers ?? MARKDOWN_PASTE_TRANSFORMERS,
    undefined,
    options.shouldPreserveNewlines ?? DEFAULT_PASTE_OPTIONS.shouldPreserveNewlines,
    options.mergeAdjacentNewlines ?? DEFAULT_PASTE_OPTIONS.mergeAdjacentNewlines,
  )
}

// ---------------------------------------------------------------------------
// Paste handler
// ---------------------------------------------------------------------------

export interface MarkdownPasteHandlerConfig extends MarkdownPasteOptions, DetectMarkdownOptions {
  disabled?: boolean
}

export type MarkdownPasteConfig = MarkdownPasteHandlerConfig
export type MarkdownPastePluginProps = MarkdownPasteHandlerConfig

function handleMarkdownPaste(
  event: PasteCommandType,
  editor: LexicalEditor,
  config: MarkdownPasteHandlerConfig,
): boolean {
  if (config.disabled || !objectKlassEquals(event, ClipboardEvent)) {
    return false
  }
  const plain = event.clipboardData?.getData('text/plain') ?? ''
  const html = event.clipboardData?.getData('text/html') ?? null
  if (!shouldPasteAsMarkdown(plain, html, config)) {
    return false
  }
  event.preventDefault()
  editor.update(
    () => {
      $insertMarkdownAtSelection(editor, plain, config)
    },
    { tag: PASTE_TAG },
  )
  return true
}

export function registerMarkdownPasteHandler(
  editor: LexicalEditor,
  config: MarkdownPasteHandlerConfig = {},
): () => void {
  return editor.registerCommand(
    PASTE_COMMAND,
    (event) => handleMarkdownPaste(event, editor, config),
    COMMAND_PRIORITY_HIGH,
  )
}

export function registerMarkdownPastePlugin(
  editor: LexicalEditor,
  config: MarkdownPasteHandlerConfig = {},
): () => void {
  if (!editor.hasNodes(markdownPasteNodes)) {
    throw new Error(
      'MarkdownPastePlugin: add ...markdownPasteNodes to your editor nodes array first.',
    )
  }
  return registerMarkdownPasteHandler(editor, config)
}

// ---------------------------------------------------------------------------
// Extension (Lexical 0.35+)
// ---------------------------------------------------------------------------

export const MarkdownPasteExtension = defineExtension({
  config: safeCast<MarkdownPasteConfig>({
    disabled: false,
    mergeAdjacentNewlines: false,
    shouldPreserveNewlines: true,
    transformers: MARKDOWN_PASTE_TRANSFORMERS,
  }),
  dependencies: [RichTextExtension, ListExtension, CheckListExtension],
  name: '@wq/markdown-paste-plugin/main',
  register(editor, config) {
    return registerMarkdownPasteHandler(editor, config)
  },
})

export { configExtension }

// ---------------------------------------------------------------------------
// React plugin
// ---------------------------------------------------------------------------

export function MarkdownPastePlugin(config: MarkdownPastePluginProps = {}): null {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return registerMarkdownPasteHandler(editor, config)
  }, [editor, config])
  return null
}

export function pasteMarkdownIntoEditor(
  editor: LexicalEditor,
  markdown: string,
  config: MarkdownPasteHandlerConfig = {},
): void {
  editor.update(() => {
    $insertMarkdownAtSelection(editor, markdown, config)
  })
}

// ---------------------------------------------------------------------------
// Drop-in editor
// ---------------------------------------------------------------------------

export interface LexicalMarkdownPasteEditorProps {
  namespace?: string
  placeholder?: string
  className?: string
  contentEditableClassName?: string
  theme?: EditorThemeClasses
  children?: ReactNode
  onEditorReady?: (editor: LexicalEditor) => void
  pasteConfig?: MarkdownPasteConfig
}

function EditorReadyPlugin({
  onEditorReady,
}: {
  onEditorReady?: (editor: LexicalEditor) => void
}): null {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    onEditorReady?.(editor)
  }, [editor, onEditorReady])
  return null
}

export function LexicalMarkdownPasteEditor({
  namespace = 'MarkdownPastePlugin',
  placeholder = 'Paste AI-generated markdown here…',
  className = 'lmp-editor-shell',
  contentEditableClassName = 'lmp-content-editable',
  theme,
  children,
  onEditorReady,
  pasteConfig,
}: LexicalMarkdownPasteEditorProps): JSX.Element {
  useEffect(() => {
    injectMarkdownPasteStyles()
  }, [])

  const extension = useMemo(
    () =>
      defineExtension({
        dependencies: [
          HistoryExtension,
          pasteConfig
            ? configExtension(MarkdownPasteExtension, pasteConfig)
            : MarkdownPasteExtension,
        ],
        name: '@wq/markdown-paste-plugin/editor',
        namespace,
        theme: theme ? mergeMarkdownPasteTheme(theme) : mergeMarkdownPasteTheme({}),
      }),
    [namespace, pasteConfig, theme],
  )

  return (
    <LexicalExtensionComposer
      extension={extension}
      contentEditable={null}
    >
      <div className={className}>
        <div className="lmp-editor-toolbar">Markdown paste enabled</div>
        <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
          <ContentEditable
            className={contentEditableClassName}
            aria-placeholder={placeholder}
            placeholder={<div className="lmp-placeholder">{placeholder}</div>}
          />
        </div>
        <div className="lmp-hint">
          Try pasting: <code># Heading</code>, <code>- bullet</code>, <code>**bold**</code>
        </div>
        {onEditorReady ? <EditorReadyPlugin onEditorReady={onEditorReady} /> : null}
        {children}
      </div>
    </LexicalExtensionComposer>
  )
}
