/**
 * Optional React wrapper — drop a working code-highlight editor on any page.
 */

import type {EditorThemeClasses, LexicalEditor} from 'lexical';
import type {JSX, ReactNode} from 'react';

import {HistoryExtension} from '@lexical/history';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalExtensionComposer} from '@lexical/react/LexicalExtensionComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {RichTextExtension} from '@lexical/rich-text';
import {defineExtension} from 'lexical';
import {useEffect, useMemo} from 'react';

import {CodeHighlightKitExtension} from './extensions';
import {$appendCodeBlockToRoot} from './helpers';
import {mergeCodeHighlightTheme} from './theme';

import './codeHighlightTheme.css';
import './editorShell.css';

export interface LexicalCodeHighlightEditorProps {
  /** Editor namespace (unique per app) */
  namespace?: string;
  /** Initial code block language */
  language?: string;
  /** Initial source code — omit for empty editor */
  initialSource?: string;
  /** Merge kit theme into your own theme classes */
  theme?: EditorThemeClasses;
  placeholder?: string;
  className?: string;
  contentEditableClassName?: string;
  children?: ReactNode;
  onEditorReady?: (editor: LexicalEditor) => void;
}

const DEFAULT_SAMPLE = `const greet = (name: string) => {
  console.log(\`Hello, \${name}!\`);
};

greet('world');`;

function EditorReadyPlugin({
  onEditorReady,
}: {
  onEditorReady?: (editor: LexicalEditor) => void;
}): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);
  return null;
}

/**
 * Self-contained editor with code highlighting enabled.
 * Copy this component or compose your own using CodeHighlightKitExtension.
 */
export function LexicalCodeHighlightEditor({
  namespace = 'CodeHighlightKit',
  language = 'typescript',
  initialSource = DEFAULT_SAMPLE,
  theme,
  placeholder = 'Enter code…',
  className = 'lch-editor-shell',
  contentEditableClassName = 'lch-content-editable',
  children,
  onEditorReady,
}: LexicalCodeHighlightEditorProps): JSX.Element {
  const extension = useMemo(
    () =>
      defineExtension({
        $initialEditorState: initialSource
          ? () => {
              $appendCodeBlockToRoot({language, source: initialSource});
            }
          : undefined,
        dependencies: [
          HistoryExtension,
          RichTextExtension,
          CodeHighlightKitExtension,
        ],
        name: '@lexical-code-highlight-kit/editor',
        namespace,
        theme: theme
          ? mergeCodeHighlightTheme(theme)
          : mergeCodeHighlightTheme({}),
      }),
    [initialSource, language, namespace, theme],
  );

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className={className}>
        <ContentEditable
          className={contentEditableClassName}
          aria-placeholder={placeholder}
          placeholder={
            <div className="lch-placeholder">{placeholder}</div>
          }
        />
        {onEditorReady ? (
          <EditorReadyPlugin onEditorReady={onEditorReady} />
        ) : null}
        {children}
      </div>
    </LexicalExtensionComposer>
  );
}
