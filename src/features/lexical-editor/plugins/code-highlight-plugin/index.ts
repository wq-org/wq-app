/**
 * lexical-code-highlight-kit
 *
 * Portable Lexical code block + Prism syntax highlighting.
 * Copy the entire `lexical-code-highlight-kit` folder into your project.
 */

// --- Theme ---
export {
  CODE_HIGHLIGHT_CLASS_PREFIX,
  codeHighlightTheme,
  mergeCodeHighlightTheme,
} from './theme';

// --- Nodes ---
export {
  $createCodeHighlightNode,
  $createCodeNode,
  $isCodeHighlightNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
  codeHighlightNodes,
} from './nodes';

// --- Extensions (recommended) ---
export {
  CodeHighlightKitExtension,
  type CodeHighlightKitConfig,
} from './extensions';

// --- Legacy LexicalComposer ---
export {registerCodeHighlightKit, registerCodeHighlighting} from './legacy';

// --- Helpers ---
export {
  $appendCodeBlockToRoot,
  $createCodeBlockWithSource,
  type CreateCodeBlockOptions,
} from './helpers';

// --- Optional React component ---
export {
  LexicalCodeHighlightEditor,
  type LexicalCodeHighlightEditorProps,
} from './LexicalCodeHighlightEditor';
