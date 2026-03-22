import { useMemo, useState, type RefObject } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import type { LexicalEditor } from 'lexical'
import type { LucideIcon } from 'lucide-react'
import { List, ListOrdered, Pilcrow, Quote, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  applyHeading,
  applyParagraph,
  applyQuote,
  readEditorToolbarState,
  toggleList,
} from './editorToolbarActions'

type SlashAction = {
  description: string
  icon: LucideIcon
  key: string
  title: string
  onSelect: (editor: LexicalEditor) => void
}

class SlashMenuOption extends MenuOption {
  description: string
  icon: LucideIcon
  onSelect: (editor: LexicalEditor) => void
  title: string

  constructor(action: SlashAction) {
    super(action.key)
    this.description = action.description
    this.icon = action.icon
    this.onSelect = action.onSelect
    this.title = action.title
  }
}

const SLASH_ACTIONS: SlashAction[] = [
  {
    description: 'Start writing plain text.',
    icon: Pilcrow,
    key: 'paragraph',
    title: 'Paragraph',
    onSelect: (editor) => applyParagraph(editor),
  },
  {
    description: 'Big section heading.',
    icon: Type,
    key: 'heading-1',
    title: 'Heading 1',
    onSelect: (editor) => applyHeading(editor, 'h1'),
  },
  {
    description: 'Medium section heading.',
    icon: Type,
    key: 'heading-2',
    title: 'Heading 2',
    onSelect: (editor) => applyHeading(editor, 'h2'),
  },
  {
    description: 'Create a bullet list.',
    icon: List,
    key: 'bullets',
    title: 'Bulleted List',
    onSelect: (editor) => {
      toggleList(editor, readEditorToolbarState(editor).blockType, 'ul')
    },
  },
  {
    description: 'Create a numbered list.',
    icon: ListOrdered,
    key: 'numbers',
    title: 'Numbered List',
    onSelect: (editor) => {
      toggleList(editor, readEditorToolbarState(editor).blockType, 'ol')
    },
  },
  {
    description: 'Add a short note or emphasis block.',
    icon: Quote,
    key: 'quote',
    title: 'Quote',
    onSelect: (editor) => applyQuote(editor),
  },
]

const SLASH_MENU_CLASS_NAME =
  'editor-toolbarPopover editor-slashMenu w-[24rem] rounded-3xl border-border p-3 shadow-lg'

type SlashMenuItemProps = {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: SlashMenuOption
}

const SlashMenuItem = ({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: SlashMenuItemProps) => {
  const Icon = option.icon

  return (
    <li
      key={option.key}
      tabIndex={-1}
      aria-selected={isSelected}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
        isSelected ? 'bg-muted text-foreground' : 'hover:bg-muted/70',
      )}
      id={`slash-item-${index}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="option"
      ref={option.setRefElement}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground">
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{option.title}</span>
        <span className="block text-xs text-muted-foreground">{option.description}</span>
      </span>
    </li>
  )
}

const SlashMenu = ({
  anchorElementRef,
  options,
  selectOptionAndCleanUp,
  selectedIndex,
  setHighlightedIndex,
  matchingString,
}: {
  anchorElementRef: RefObject<HTMLElement | null>
  options: SlashMenuOption[]
  selectOptionAndCleanUp: (option: SlashMenuOption) => void
  selectedIndex: number | null
  setHighlightedIndex: (index: number | null) => void
  matchingString: string
}) => {
  return (
    <div
      ref={anchorElementRef}
      className={SLASH_MENU_CLASS_NAME}
      role="listbox"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
        <span className="text-sm font-semibold text-muted-foreground">Filtered results</span>
        <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
          /{matchingString}
        </span>
      </div>

      <ul className="space-y-1">
        {options.map((option, index) => (
          <SlashMenuItem
            key={option.key}
            index={index}
            isSelected={selectedIndex === index}
            onClick={() => selectOptionAndCleanUp(option)}
            onMouseEnter={() => setHighlightedIndex(index)}
            option={option}
          />
        ))}
      </ul>

      <div className="mt-3 border-t border-border px-2 pt-3 text-xs text-muted-foreground">
        Close menu <span className="float-right">esc</span>
      </div>
    </div>
  )
}

export const DocumentSlashMenuPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [query, setQuery] = useState('')

  const triggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
    maxLength: 75,
    punctuation: '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;',
  })

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return SLASH_ACTIONS.map((action) => new SlashMenuOption(action))
    }

    return SLASH_ACTIONS.filter((action) => {
      return (
        action.title.toLowerCase().includes(normalizedQuery) ||
        action.description.toLowerCase().includes(normalizedQuery)
      )
    }).map((action) => new SlashMenuOption(action))
  }, [query])

  return (
    <LexicalTypeaheadMenuPlugin
      options={options}
      onQueryChange={(value) => setQuery(value ?? '')}
      onSelectOption={(option, _textNode, closeMenu) => {
        option.onSelect(editor)
        closeMenu()
      }}
      triggerFn={triggerMatch}
      menuRenderFn={(
        anchorElementRef,
        { selectOptionAndCleanUp, selectedIndex, setHighlightedIndex },
        matchingString,
      ) => (
        <SlashMenu
          anchorElementRef={anchorElementRef}
          options={options}
          selectOptionAndCleanUp={selectOptionAndCleanUp}
          selectedIndex={selectedIndex}
          setHighlightedIndex={setHighlightedIndex}
          matchingString={matchingString}
        />
      )}
      preselectFirstItem
    />
  )
}
