# lexical-code-highlight-kit

Portable, isolated Lexical **code block + Prism syntax highlighting** kit.

Copy the entire `lexical-code-highlight-kit/` folder into your other project.

## What you get

| File | Purpose |
|---|---|
| `src/nodes.ts` | `CodeNode`, `CodeHighlightNode` exports + node array |
| `src/extensions.ts` | `CodeHighlightKitExtension` (Prism + indent) |
| `src/theme.ts` | Theme class map (`LCH__*` prefix) |
| `src/codeHighlightTheme.css` | Code block + token colors + line gutter |
| `src/helpers.ts` | `$createCodeBlockWithSource`, `$appendCodeBlockToRoot` |
| `src/legacy.ts` | `registerCodeHighlightKit()` for old `LexicalComposer` |
| `src/LexicalCodeHighlightEditor.tsx` | Optional drop-in React editor |
| `src/index.ts` | Single import entry point |

## Install peer dependencies (in your project)

```bash
npm install lexical @lexical/react @lexical/code @lexical/code-prism @lexical/code-core @lexical/rich-text @lexical/history @lexical/extension
```

## Quick start — drop-in editor

```tsx
import {LexicalCodeHighlightEditor} from './lexical-code-highlight-kit/src';

export function MyPage() {
  return (
    <LexicalCodeHighlightEditor
      language="typescript"
      initialSource={'const x = 1;\nconsole.log(x);'}
    />
  );
}
```

CSS is imported automatically by `LexicalCodeHighlightEditor.tsx`.

## Integrate into your existing editor (extensions)

```tsx
import {defineExtension} from 'lexical';
import {RichTextExtension} from '@lexical/rich-text';
import {HistoryExtension} from '@lexical/history';
import {LexicalExtensionComposer} from '@lexical/react/LexicalExtensionComposer';
import {
  CodeHighlightKitExtension,
  mergeCodeHighlightTheme,
} from './lexical-code-highlight-kit/src';
import './lexical-code-highlight-kit/src/codeHighlightTheme.css';

const MyEditorExtension = defineExtension({
  name: 'my-app',
  namespace: 'MyApp',
  dependencies: [
    HistoryExtension,
    RichTextExtension,
    CodeHighlightKitExtension, // ← adds code + code-highlight
  ],
  theme: mergeCodeHighlightTheme({
    paragraph: 'my-paragraph',
    // ...your other theme keys
  }),
});
```

## Legacy LexicalComposer setup

```tsx
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {
  codeHighlightNodes,
  registerCodeHighlightKit,
  mergeCodeHighlightTheme,
} from './lexical-code-highlight-kit/src';
import './lexical-code-highlight-kit/src/codeHighlightTheme.css';

const editorConfig = {
  namespace: 'MyApp',
  nodes: [...codeHighlightNodes, /* your other nodes */],
  theme: mergeCodeHighlightTheme({}),
  onError: console.error,
};

function App() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <MyEditor />
    </LexicalComposer>
  );
}

function MyEditor() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => registerCodeHighlightKit(editor), [editor]);
  return <ContentEditable />;
}
```

## Programmatically insert a code block

```ts
import {$createCodeBlockWithSource} from './lexical-code-highlight-kit/src';

editor.update(() => {
  $getRoot().append(
    $createCodeBlockWithSource({
      language: 'typescript',
      source: 'const hello = "world";',
    }),
  );
});
// Prism transform runs on next update → code-highlight + linebreak tree
```

## Node tree (debug view)

```
code                          ← CodeNode
├ code-highlight "const ..."  ← CodeHighlightNode (Prism token)
├ linebreak                   ← LineBreakNode (<br>)
├ code-highlight "  ..."
└ ...
```

## Customizing styles

1. Edit `src/codeHighlightTheme.css` (`.LCH__*` classes), or
2. Change prefix in `src/theme.ts` (`CODE_HIGHLIGHT_CLASS_PREFIX`) and rename CSS classes to match.

## Isolation notes

- Uses `LCH__` CSS prefix — won't clash with playground or Tailwind classes.
- No imports from `lexical-playground` — only public Lexical packages.
- Folder has no build step; TypeScript/Next.js resolves `src/` directly.

## TypeScript path alias (optional)

```json
{
  "compilerOptions": {
    "paths": {
      "@code-highlight-kit/*": ["./lexical-code-highlight-kit/src/*"]
    }
  }
}
```
