/**
 * Extension-based setup (Lexical 0.35+ / buildEditorFromExtensions).
 * Adds CodeNode, CodeHighlightNode, Prism highlighting, and Tab indent.
 */

import {CodePrismExtension, PrismTokenizer} from '@lexical/code-prism';
import {configExtension, defineExtension} from 'lexical';

/**
 * Drop-in extension: registers code nodes + Prism syntax highlighting.
 * CodePrismExtension depends on CodeExtension, so CodeNode/CodeHighlightNode
 * (and code-block Tab handling) are registered automatically — Lexical 0.44
 * has no separate CodeIndentExtension.
 *
 * @example
 * defineExtension({
 *   dependencies: [CodeHighlightKitExtension, RichTextExtension],
 *   theme: mergeCodeHighlightTheme(myTheme),
 * })
 */
export const CodeHighlightKitExtension = defineExtension({
  dependencies: [
    configExtension(CodePrismExtension, {
      disabled: false,
      tokenizer: PrismTokenizer,
    }),
  ],
  name: '@lexical-code-highlight-kit/main',
});

export interface CodeHighlightKitConfig {
  /** Reserved for future runtime toggles */
  disabled?: boolean;
  tabSize?: number;
}
