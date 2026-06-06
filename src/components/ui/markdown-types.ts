import type { ComponentPropsWithoutRef, ComponentType } from 'react'

type MarkdownAstNode = Record<string, unknown>

export type PreComponent = ComponentType<
  ComponentPropsWithoutRef<'pre'> & { node?: MarkdownAstNode | undefined }
>
export type CodeComponent = ComponentType<
  ComponentPropsWithoutRef<'code'> & { node?: MarkdownAstNode | undefined }
>

export type CodeHeaderProps = {
  node?: MarkdownAstNode | undefined
  language: string | undefined
  code: string
}

export type SyntaxHighlighterProps = {
  node?: MarkdownAstNode | undefined
  components: {
    Pre: PreComponent
    Code: CodeComponent
  }
  language: string
  code: string
}
