import { useEffect, useState, type MouseEvent } from 'react'
import { Blocks, type YooEditor } from '@yoopta/editor'
import type { ToolbarRenderProps } from '@yoopta/toolbar'
import { Editor as SlateEditorApi } from 'slate'
import { Heading1, Heading2, Heading3, Link2, List, ListOrdered, Quote, Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type LessonInlineBlockType =
  | 'HeadingOne'
  | 'HeadingTwo'
  | 'HeadingThree'
  | 'BulletedList'
  | 'NumberedList'
  | 'Blockquote'

type LinkCommandPayload = {
  blockId?: string
  props: {
    nodeType: 'inline'
    rel: string
    target: string
    title: string
    url: string
  }
  slate: ReturnType<typeof Blocks.getBlockSlate>
}

type InsertLinkCommand = (payload: LinkCommandPayload) => void
type DeleteLinkCommand = (payload: { slate: ReturnType<typeof Blocks.getBlockSlate> }) => void

const HEADING_OPTIONS = [
  { type: 'HeadingOne', shortKey: 'page.inlineToolbar.headingOneShort', icon: Heading1 },
  { type: 'HeadingTwo', shortKey: 'page.inlineToolbar.headingTwoShort', icon: Heading2 },
  { type: 'HeadingThree', shortKey: 'page.inlineToolbar.headingThreeShort', icon: Heading3 },
] as const satisfies readonly {
  icon: typeof Heading1
  shortKey: string
  type: Extract<LessonInlineBlockType, 'HeadingOne' | 'HeadingTwo' | 'HeadingThree'>
}[]

function normalizeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function preventToolbarBlur(event: MouseEvent<HTMLElement>) {
  event.preventDefault()
}

function getCurrentBlockId(editor: YooEditor): string | undefined {
  if (typeof editor.path.current !== 'number') return undefined
  try {
    return editor.getBlock({ at: editor.path.current })?.id
  } catch {
    return undefined
  }
}

function getCurrentSlate(editor: YooEditor) {
  if (typeof editor.path.current !== 'number') return null
  try {
    return Blocks.getBlockSlate(editor, { at: editor.path.current })
  } catch {
    return null
  }
}

function getSelectedText(editor: YooEditor): string {
  const slate = getCurrentSlate(editor)
  if (!slate?.selection) return ''
  return SlateEditorApi.string(slate, slate.selection).trim()
}

function getLinkDefaults(editor: YooEditor) {
  const linkElement = editor.plugins?.LinkPlugin?.elements?.link
  return {
    rel: linkElement?.props?.rel ?? 'noopener noreferrer',
    target: linkElement?.props?.target ?? '_self',
  }
}

function hasLinkCommands(editor: YooEditor): boolean {
  return (
    typeof editor.commands?.insertLink === 'function' &&
    typeof editor.commands?.deleteLink === 'function'
  )
}

function getToolbarButtonClassName(isActive = false): string {
  return cn(
    'rounded-full px-3 text-xs font-medium text-foreground hover:bg-accent/80 hover:text-foreground',
    isActive && 'bg-accent text-foreground hover:bg-accent',
  )
}

function toggleBlock(editor: YooEditor, type: LessonInlineBlockType): void {
  editor.toggleBlock(type, { focus: true })
}

export function LessonInlineToolbar({
  activeBlock,
  editor,
  toggleHoldToolbar,
}: ToolbarRenderProps) {
  const { t } = useTranslation('features.lesson')
  const [isHeadingsOpen, setIsHeadingsOpen] = useState(false)
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const currentBlockType = activeBlock?.type
  const currentBlockId = getCurrentBlockId(editor)
  const canUseLink = hasLinkCommands(editor)
  const selectedText = getSelectedText(editor)

  useEffect(() => {
    toggleHoldToolbar?.(isHeadingsOpen || isLinkOpen)
  }, [isHeadingsOpen, isLinkOpen, toggleHoldToolbar])

  const applyLink = () => {
    if (!canUseLink || !linkUrl.trim()) return

    const slate = getCurrentSlate(editor)
    const insertLink = editor.commands.insertLink as InsertLinkCommand | undefined
    if (!slate?.selection || !insertLink) return

    const { rel, target } = getLinkDefaults(editor)

    insertLink({
      slate,
      blockId: currentBlockId,
      props: {
        url: normalizeHref(linkUrl),
        title: selectedText || normalizeHref(linkUrl),
        target,
        rel,
        nodeType: 'inline',
      },
    })

    setLinkUrl('')
    setIsLinkOpen(false)
  }

  const removeLink = () => {
    if (!canUseLink) return

    const slate = getCurrentSlate(editor)
    const deleteLink = editor.commands.deleteLink as DeleteLinkCommand | undefined
    if (!slate || !deleteLink) return

    deleteLink({ slate })
    setLinkUrl('')
    setIsLinkOpen(false)
  }

  return (
    <div
      className="relative z-[120] flex items-center gap-1 rounded-full border border-border bg-background/95 px-2 py-2 text-foreground shadow-lg backdrop-blur-sm"
      onMouseDown={preventToolbarBlur}
    >
      <Popover
        open={isHeadingsOpen}
        onOpenChange={setIsHeadingsOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={getToolbarButtonClassName(
              currentBlockType === 'HeadingOne' ||
                currentBlockType === 'HeadingTwo' ||
                currentBlockType === 'HeadingThree',
            )}
            onMouseDown={preventToolbarBlur}
          >
            <Type className="size-4" />
            {t('page.inlineToolbar.headings')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="top"
          sideOffset={10}
          className="w-auto rounded-2xl border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onMouseDown={preventToolbarBlur}
        >
          <div className="flex items-center gap-1">
            {HEADING_OPTIONS.map(({ type, shortKey, icon: Icon }) => (
              <Button
                key={type}
                type="button"
                variant="ghost"
                size="sm"
                className={getToolbarButtonClassName(currentBlockType === type)}
                onMouseDown={preventToolbarBlur}
                onClick={() => {
                  toggleBlock(editor, type)
                  setIsHeadingsOpen(false)
                }}
              >
                <Icon className="size-4" />
                {t(shortKey)}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getToolbarButtonClassName(currentBlockType === 'BulletedList')}
        onMouseDown={preventToolbarBlur}
        onClick={() => toggleBlock(editor, 'BulletedList')}
      >
        <List className="size-4" />
        {t('page.inlineToolbar.bulletedList')}
      </Button>

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getToolbarButtonClassName(currentBlockType === 'NumberedList')}
        onMouseDown={preventToolbarBlur}
        onClick={() => toggleBlock(editor, 'NumberedList')}
      >
        <ListOrdered className="size-4" />
        {t('page.inlineToolbar.numberedList')}
      </Button>

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getToolbarButtonClassName(currentBlockType === 'Blockquote')}
        onMouseDown={preventToolbarBlur}
        onClick={() => toggleBlock(editor, 'Blockquote')}
      >
        <Quote className="size-4" />
        {t('page.inlineToolbar.blockquote')}
      </Button>

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <Popover
        open={isLinkOpen}
        onOpenChange={setIsLinkOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={getToolbarButtonClassName(false)}
            disabled={!canUseLink}
            onMouseDown={preventToolbarBlur}
          >
            <Link2 className="size-4" />
            {t('page.inlineToolbar.link')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="top"
          sideOffset={10}
          className="w-72 rounded-2xl border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onMouseDown={preventToolbarBlur}
        >
          <div className="space-y-3">
            <Input
              value={linkUrl}
              placeholder={t('page.inlineToolbar.linkPlaceholder')}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={preventToolbarBlur}
                onClick={removeLink}
              >
                {t('page.inlineToolbar.removeLink')}
              </Button>
              <Button
                type="button"
                size="sm"
                onMouseDown={preventToolbarBlur}
                onClick={applyLink}
                disabled={!linkUrl.trim()}
              >
                {t('page.inlineToolbar.applyLink')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
