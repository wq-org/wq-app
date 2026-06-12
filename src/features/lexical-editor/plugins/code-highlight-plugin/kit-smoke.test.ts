import { describe, expect, it } from 'vitest'
import { $createCodeNode, CodeHighlightKitExtension, mergeCodeHighlightTheme } from '@/features/lexical-editor/plugins/code-highlight-plugin'

describe('code-highlight-plugin kit', () => {
  it('exposes the extension, node factory, and theme merger', () => {
    expect(CodeHighlightKitExtension.name).toBe('@lexical-code-highlight-kit/main')
    expect(typeof $createCodeNode).toBe('function')
    expect(mergeCodeHighlightTheme({}).code).toBe('LCH__code')
  })
})
