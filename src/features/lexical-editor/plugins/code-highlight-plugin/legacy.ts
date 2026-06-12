/**
 * Legacy setup for LexicalComposer (pre-extensions API).
 * Use extensions.ts + LexicalExtensionComposer when possible.
 */

import type {LexicalEditor} from 'lexical';

import {registerCodeHighlighting} from '@lexical/code-prism';

import {codeHighlightNodes} from './nodes';

export {registerCodeHighlighting} from '@lexical/code-prism';

/**
 * Register code highlighting on an existing editor instance.
 * Ensure `codeHighlightNodes` are included in your editor config first.
 */
export function registerCodeHighlightKit(editor: LexicalEditor): () => void {
  if (!editor.hasNodes(codeHighlightNodes)) {
    throw new Error(
      'CodeHighlightKit: register CodeNode and CodeHighlightNode on the editor first. ' +
        'Add `...codeHighlightNodes` to your editor `nodes` array.',
    );
  }
  return registerCodeHighlighting(editor);
}
