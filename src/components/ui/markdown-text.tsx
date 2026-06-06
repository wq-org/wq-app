'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import {
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  memo,
  type ReactNode,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { TooltipIconButton } from '@/components/ui/tooltip-icon-button'
import { cn } from '@/lib/utils'

type MarkdownTextProps = HTMLAttributes<HTMLDivElement> & {
  value?: string | null
  children?: string | null
}

type CodeElementProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean
  className?: string
  children?: ReactNode
}

function useCopyToClipboard({
  copiedDuration = 3000,
}: {
  copiedDuration?: number
} = {}) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = (value: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return

    navigator.clipboard.writeText(value).then(
      () => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), copiedDuration)
      },
      () => {},
    )
  }

  return { isCopied, copyToClipboard }
}

function CodeHeader({ language, code }: { language?: string; code: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()

  const onCopy = () => {
    if (!code || isCopied) return
    copyToClipboard(code)
  }

  return (
    <div className="aui-code-header-root border-border/50 bg-muted/50 mt-2.5 flex items-center justify-between rounded-t-lg border border-b-0 px-3 py-1.5 text-xs">
      <span className="aui-code-header-language text-muted-foreground font-medium lowercase">
        {language ?? 'text'}
      </span>
      <TooltipIconButton
        tooltip="Copy"
        onClick={onCopy}
      >
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  )
}

function MarkdownCode({ inline, className, children, ...props }: CodeElementProps) {
  const language = className?.replace('language-', '')
  const code = String(children ?? '').replace(/\n$/, '')

  if (inline) {
    return (
      <code
        className={cn(
          'aui-md-inline-code border-border/50 bg-muted/50 rounded-md border px-1.5 py-0.5 font-mono text-[0.85em]',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div>
      <CodeHeader
        language={language}
        code={code}
      />
      <pre className="aui-md-pre border-border/50 bg-muted/30 overflow-x-auto rounded-t-none rounded-b-lg border border-t-0 p-3 text-xs leading-relaxed">
        <code
          className={className}
          {...props}
        >
          {children}
        </code>
      </pre>
    </div>
  )
}

const MarkdownTextImpl = ({ value, children, className, ...props }: MarkdownTextProps) => {
  const markdown = typeof children === 'string' && children.length > 0 ? children : (value ?? '')

  return (
    <div
      className={cn('aui-md', className)}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className: headingClassName, ...headingProps }) => (
            <h1
              className={cn(
                'aui-md-h1 mb-2 scroll-m-20 text-base font-semibold first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          h2: ({ className: headingClassName, ...headingProps }) => (
            <h2
              className={cn(
                'aui-md-h2 mt-3 mb-1.5 scroll-m-20 text-sm font-semibold first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          h3: ({ className: headingClassName, ...headingProps }) => (
            <h3
              className={cn(
                'aui-md-h3 mt-2.5 mb-1 scroll-m-20 text-sm font-semibold first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          h4: ({ className: headingClassName, ...headingProps }) => (
            <h4
              className={cn(
                'aui-md-h4 mt-2 mb-1 scroll-m-20 text-sm font-medium first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          h5: ({ className: headingClassName, ...headingProps }) => (
            <h5
              className={cn(
                'aui-md-h5 mt-2 mb-1 text-sm font-medium first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          h6: ({ className: headingClassName, ...headingProps }) => (
            <h6
              className={cn(
                'aui-md-h6 mt-2 mb-1 text-sm font-medium first:mt-0 last:mb-0',
                headingClassName,
              )}
              {...headingProps}
            />
          ),
          p: ({ className: paragraphClassName, ...paragraphProps }) => (
            <p
              className={cn(
                'aui-md-p my-2.5 leading-normal first:mt-0 last:mb-0',
                paragraphClassName,
              )}
              {...paragraphProps}
            />
          ),
          a: ({ className: anchorClassName, ...anchorProps }) => (
            <a
              className={cn(
                'aui-md-a text-primary hover:text-primary/80 underline underline-offset-2',
                anchorClassName,
              )}
              rel="noreferrer"
              target="_blank"
              {...anchorProps}
            />
          ),
          blockquote: ({ className: quoteClassName, ...quoteProps }) => (
            <blockquote
              className={cn(
                'aui-md-blockquote border-muted-foreground/30 text-muted-foreground my-2.5 border-s-2 ps-3 italic',
                quoteClassName,
              )}
              {...quoteProps}
            />
          ),
          ol: ({ className: listClassName, ...listProps }) => (
            <ol
              className={cn(
                'aui-md-ol marker:text-muted-foreground my-2 ms-4 list-decimal [&>li]:mt-1',
                listClassName,
              )}
              {...listProps}
            />
          ),
          ul: ({ className: listClassName, ...listProps }) => (
            <ul
              className={cn(
                'aui-md-ul marker:text-muted-foreground my-2 ms-4 list-disc [&>li]:mt-1',
                listClassName,
              )}
              {...listProps}
            />
          ),
          li: ({ className: itemClassName, ...itemProps }) => (
            <li
              className={cn('aui-md-li leading-normal', itemClassName)}
              {...itemProps}
            />
          ),
          code: MarkdownCode,
          hr: ({ className: ruleClassName, ...ruleProps }) => (
            <hr
              className={cn('aui-md-hr border-muted-foreground/20 my-2', ruleClassName)}
              {...ruleProps}
            />
          ),
          table: ({ className: tableClassName, ...tableProps }) => (
            <div className="my-2 overflow-x-auto">
              <table
                className={cn(
                  'aui-md-table w-full border-separate border-spacing-0 overflow-y-auto',
                  tableClassName,
                )}
                {...tableProps}
              />
            </div>
          ),
          thead: ({ className: headClassName, ...headProps }) => (
            <thead
              className={cn('aui-md-thead', headClassName)}
              {...headProps}
            />
          ),
          tr: ({ className: rowClassName, ...rowProps }) => (
            <tr
              className={cn(
                'aui-md-tr m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-es-lg [&:last-child>td:last-child]:rounded-ee-lg',
                rowClassName,
              )}
              {...rowProps}
            />
          ),
          th: ({ className: cellClassName, ...cellProps }) => (
            <th
              className={cn(
                'aui-md-th bg-muted px-2 py-1 text-start font-medium first:rounded-ss-lg last:rounded-se-lg [[align=center]]:text-center [[align=right]]:text-right',
                cellClassName,
              )}
              {...cellProps}
            />
          ),
          td: ({ className: cellClassName, ...cellProps }) => (
            <td
              className={cn(
                'aui-md-td border-muted-foreground/20 border-s border-b px-2 py-1 text-start last:border-e [[align=center]]:text-center [[align=right]]:text-right',
                cellClassName,
              )}
              {...cellProps}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownText = memo(MarkdownTextImpl)
