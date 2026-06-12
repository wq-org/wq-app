/**
 * Factory helpers for creating code blocks programmatically.
 */

import {$createCodeNode} from '@lexical/code';
import {$createTextNode, $getRoot} from 'lexical';

export interface CreateCodeBlockOptions {
  /** e.g. 'typescript', 'javascript', 'python' */
  language?: string;
  /** Raw source text — Prism transform splits into code-highlight nodes on update */
  source: string;
}

/**
 * Create a CodeNode with plain text content.
 * After the next editor update, Prism replaces children with
 * code-highlight + linebreak nodes automatically.
 */
export function $createCodeBlockWithSource({
  language = 'typescript',
  source,
}: CreateCodeBlockOptions) {
  return $createCodeNode(language).append($createTextNode(source));
}

/** Append a new code block to the document root. Call inside editor.update(). */
export function $appendCodeBlockToRoot(options: CreateCodeBlockOptions): void {
  $getRoot().append($createCodeBlockWithSource(options));
}
