/**
 * Theme classes for CodeNode + CodeHighlightNode.
 * Import `./codeHighlightTheme.css` in your app for styles to apply.
 */

import type {EditorThemeClasses} from 'lexical';

/** CSS class prefix — change if you rename classes in codeHighlightTheme.css */
export const CODE_HIGHLIGHT_CLASS_PREFIX = 'LCH';

export const codeHighlightTheme: Pick<
  EditorThemeClasses,
  'code' | 'codeHighlight'
> = {
  code: `${CODE_HIGHLIGHT_CLASS_PREFIX}__code`,
  codeHighlight: {
    atrule: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenAttr`,
    attr: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenAttr`,
    boolean: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    builtin: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenSelector`,
    cdata: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenComment`,
    char: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenSelector`,
    class: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenFunction`,
    'class-name': `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenFunction`,
    comment: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenComment`,
    constant: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    deleted: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenDeleted`,
    doctype: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenComment`,
    entity: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenOperator`,
    function: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenFunction`,
    important: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenVariable`,
    inserted: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenInserted`,
    keyword: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenAttr`,
    namespace: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenVariable`,
    number: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    operator: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenOperator`,
    prolog: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenComment`,
    property: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    punctuation: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenPunctuation`,
    regex: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenVariable`,
    selector: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenSelector`,
    string: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenSelector`,
    symbol: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    tag: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenProperty`,
    unchanged: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenUnchanged`,
    url: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenOperator`,
    variable: `${CODE_HIGHLIGHT_CLASS_PREFIX}__tokenVariable`,
  },
};

/** Merge code-highlight theme into an existing Lexical theme object. */
export function mergeCodeHighlightTheme(
  base: EditorThemeClasses,
): EditorThemeClasses {
  return {
    ...base,
    code: codeHighlightTheme.code,
    codeHighlight: {
      ...base.codeHighlight,
      ...codeHighlightTheme.codeHighlight,
    },
  };
}
