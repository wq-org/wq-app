import { useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import {
  Bold,
  ChevronDown,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  type LucideIcon,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Trash2,
  Strikethrough,
  Underline,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { EditorColorsPopover } from './EditorColorsPopover'
import {
  applyLinkToSelection,
  getSelectedLinkAttributes,
  getSelectedLinkUrl,
  validateUrl,
} from './editorLink'

type EditorBlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'ol' | 'quote' | 'ul'

type HeadingOption = {
  icon: LucideIcon
  label: 'Heading 1' | 'Heading 2' | 'Heading 3'
  value: 'h1' | 'h2' | 'h3'
}

type ToolbarIconButtonProps = {
  icon: LucideIcon
  isActive?: boolean
  label: string
  onClick: () => void
}

const HEADING_OPTIONS: readonly HeadingOption[] = [
  { icon: Heading1, label: 'Heading 1', value: 'h1' },
  { icon: Heading2, label: 'Heading 2', value: 'h2' },
  { icon: Heading3, label: 'Heading 3', value: 'h3' },
]

function getToolbarButtonClassName(isActive = false) {
  return cn('editor-toolbarButton', isActive && 'editor-toolbarButtonActive')
}

function ToolbarIconButton({
  icon: Icon,
  isActive = false,
  label,
  onClick,
}: ToolbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={getToolbarButtonClassName(isActive)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          <Icon className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function EditorToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [blockType, setBlockType] = useState<EditorBlockType>('paragraph')
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false)
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isLinkActive, setIsLinkActive] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setIsBold(false)
        setIsItalic(false)
        setIsUnderline(false)
        setIsStrikethrough(false)
        setIsLinkActive(false)
        setBlockType('paragraph')
        return
      }

      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsLinkActive(Boolean(getSelectedLinkUrl(editor)))

      const anchorNode = selection.anchor.getNode()
      const topLevelElement = anchorNode.getTopLevelElementOrThrow()
      const parentNode = topLevelElement.getParent()

      if ($isListNode(parentNode)) {
        setBlockType(parentNode.getListType() === 'number' ? 'ol' : 'ul')
        return
      }

      if ($isListNode(topLevelElement)) {
        setBlockType(topLevelElement.getListType() === 'number' ? 'ol' : 'ul')
        return
      }

      if ($isHeadingNode(topLevelElement)) {
        const tag = topLevelElement.getTag()
        setBlockType(tag === 'h1' ? 'h1' : tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : 'paragraph')
        return
      }

      setBlockType(topLevelElement.getType() === 'quote' ? 'quote' : 'paragraph')
    })
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateToolbar()
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updateToolbar])

  const handleParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const handleHeading = (tag: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  const handleQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const handleList = (nextType: 'ol' | 'ul') => {
    if (blockType === nextType) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      return
    }

    editor.dispatchCommand(
      nextType === 'ul' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
      undefined,
    )
  }

  const handleLinkMenuOpenChange = (nextOpen: boolean) => {
    setIsLinkMenuOpen(nextOpen)

    if (nextOpen) {
      const selectedLink = getSelectedLinkAttributes(editor)
      setLinkUrl(selectedLink.url)
      setLinkTitle(selectedLink.title)
    }
  }

  const handleRemoveLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    setIsLinkActive(false)
    setLinkUrl('')
    setLinkTitle('')
    setIsLinkMenuOpen(false)
  }

  const activeHeadingOption = HEADING_OPTIONS.find((option) => option.value === blockType)
  const ActiveHeadingIcon = activeHeadingOption?.icon ?? Heading1
  const normalizedLinkUrl = validateUrl(linkUrl)

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbarGroup">
        <ToolbarIconButton
          icon={Pilcrow}
          isActive={blockType === 'paragraph'}
          label="Paragraph"
          onClick={handleParagraph}
        />

        <Popover
          open={isHeadingMenuOpen}
          onOpenChange={setIsHeadingMenuOpen}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={getToolbarButtonClassName(Boolean(activeHeadingOption))}
                >
                  <ActiveHeadingIcon className="size-4" />
                  <ChevronDown className="size-3.5" />
                  <span className="sr-only">Headings</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Headings</TooltipContent>
          </Tooltip>

          <PopoverContent
            align="start"
            className="editor-toolbarPopover"
          >
            <div className="editor-toolbarPopoverGrid">
              {HEADING_OPTIONS.map(({ icon: Icon, label, value }) => (
                <ToolbarIconButton
                  key={value}
                  icon={Icon}
                  isActive={blockType === value}
                  label={label}
                  onClick={() => {
                    handleHeading(value)
                    setIsHeadingMenuOpen(false)
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarIconButton
          icon={Quote}
          isActive={blockType === 'quote'}
          label="Quote"
          onClick={handleQuote}
        />
      </div>

      <Separator
        orientation="vertical"
        className="editor-toolbarSeparator"
      />

      <div className="editor-toolbarGroup">
        <ToolbarIconButton
          icon={Bold}
          isActive={isBold}
          label="Bold"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        />
        <ToolbarIconButton
          icon={Italic}
          isActive={isItalic}
          label="Italic"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        />
        <ToolbarIconButton
          icon={Underline}
          isActive={isUnderline}
          label="Underline"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        />
        <ToolbarIconButton
          icon={Strikethrough}
          isActive={isStrikethrough}
          label="Strikethrough"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        />
      </div>

      <Separator
        orientation="vertical"
        className="editor-toolbarSeparator"
      />

      <div className="editor-toolbarGroup">
        <EditorColorsPopover />
      </div>

      <Separator
        orientation="vertical"
        className="editor-toolbarSeparator"
      />

      <div className="editor-toolbarGroup">
        <Popover
          open={isLinkMenuOpen}
          onOpenChange={handleLinkMenuOpenChange}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={getToolbarButtonClassName(isLinkActive)}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <Link2 className="size-4" />
                  <span className="sr-only">Link</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Link</TooltipContent>
          </Tooltip>

          <PopoverContent
            align="start"
            className="editor-toolbarPopover w-[24rem]"
          >
            <div className="flex flex-col gap-3">
              <FieldCard className="space-y-2 px-4 py-4">
                <FieldInput
                  value={linkUrl}
                  onValueChange={setLinkUrl}
                  label="Page or URL"
                  placeholder="https://example.com"
                  autoComplete="url"
                />

                <FieldInput
                  value={linkTitle}
                  onValueChange={setLinkTitle}
                  label="Link title"
                  placeholder="Describe this link"
                  autoComplete="off"
                  hideSeparator
                />
              </FieldCard>

              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-3 text-left"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const resolvedUrl = validateUrl(linkUrl)
                  if (resolvedUrl === null) return

                  applyLinkToSelection(editor, resolvedUrl, linkTitle)
                  setIsLinkActive(true)
                  setIsLinkMenuOpen(false)
                }}
                disabled={normalizedLinkUrl === null}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-background text-muted-foreground">
                  <ExternalLink className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="truncate text-sm font-medium text-foreground">
                    {normalizedLinkUrl ?? 'https://example.com'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {linkTitle.trim() || 'Link to web page'}
                  </span>
                </span>
              </Button>

              <Separator />

              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-2xl px-3 py-3 text-left text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleRemoveLink}
              >
                <Trash2 className="size-4" />
                <span>Remove link</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator
        orientation="vertical"
        className="editor-toolbarSeparator"
      />

      <div className="editor-toolbarGroup">
        <ToolbarIconButton
          icon={List}
          isActive={blockType === 'ul'}
          label="Bulleted list"
          onClick={() => handleList('ul')}
        />
        <ToolbarIconButton
          icon={ListOrdered}
          isActive={blockType === 'ol'}
          label="Numbered list"
          onClick={() => handleList('ol')}
        />
      </div>
    </div>
  )
}
