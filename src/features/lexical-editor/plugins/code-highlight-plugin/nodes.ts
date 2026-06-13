/**
 * Node classes required for code highlighting.
 * When using CodeHighlightKitExtension these are registered automatically.
 * For legacy LexicalComposer setup, pass this array to editor config `nodes`.
 */

import type {Klass, LexicalNode} from 'lexical';

import {CodeHighlightNode, CodeNode} from '@lexical/code';

export {CodeHighlightNode, CodeNode} from '@lexical/code';
export {
  $createCodeHighlightNode,
  $createCodeNode,
  $isCodeHighlightNode,
  $isCodeNode,
} from '@lexical/code';

/** Minimal node list for manual editor registration */
export const codeHighlightNodes: Array<Klass<LexicalNode>> = [
  CodeNode,
  CodeHighlightNode,
];
