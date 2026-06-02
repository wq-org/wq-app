import { useCallback, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical'
import type { LucideIcon } from 'lucide-react'
import {
  AtSign,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Pilcrow,
  Quote,
  SmilePlus,
  Table,
  TvMinimalPlay,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { USER_ROLES, type UserRole } from '@/features/auth'
import {
  $createImageNode,
  $createMentionNode,
  insertYouTubeEmbed,
  OPEN_EMOJI_PICKER_COMMAND,
  parseYouTubeVideoId,
} from '@/features/lexical-editor'
import { useUser } from '@/contexts/user/UserContext'
import { cn } from '@/lib/utils'
import { applyLinkToSelection, validateUrl } from './editorLink'
import {
  applyCheckList,
  applyCodeBlock,
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
  keywords?: string[]
  title: string
  isDisabled?: boolean
  onSelect: (editor: LexicalEditor) => void
}

function roleForUpload(role: UserRole | null): string | null {
  if (!role) return null
  switch (role) {
    case USER_ROLES.TEACHER:
      return 'teacher'
    case USER_ROLES.STUDENT:
      return 'student'
    case USER_ROLES.INSTITUTION_ADMIN:
      return 'institutionAdmin'
    case USER_ROLES.SUPER_ADMIN:
      return 'superAdmin'
    default:
      return null
  }
}

class SlashMenuOption extends MenuOption {
  description: string
  iconComponent: LucideIcon
  isDisabled: boolean
  onSelect: (editor: LexicalEditor) => void
  title: string

  constructor(action: SlashAction) {
    super(action.key)
    this.description = action.description
    this.iconComponent = action.icon
    this.isDisabled = action.isDisabled ?? false
    this.onSelect = action.onSelect
    this.title = action.title
  }
}

const SLASH_MENU_CLASS_NAME =
  'editor-toolbarPopover editor-slashMenu w-[24rem] !rounded-3xl border-border p-3 shadow-lg'

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
  const Icon = option.iconComponent
  const { isDisabled } = option
  const handleClick = isDisabled ? undefined : onClick
  const handleMouseEnter = isDisabled ? undefined : onMouseEnter

  return (
    <li
      key={option.key}
      tabIndex={-1}
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
        isDisabled
          ? 'cursor-not-allowed opacity-50'
          : cn('cursor-pointer', isSelected ? 'bg-muted text-foreground' : 'hover:bg-muted/70'),
      )}
      id={`slash-item-${index}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
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
      ref={anchorElementRef as RefObject<HTMLDivElement>}
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getRole, getUserId, getUserInstitutionId } = useUser()

  const openImagePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const slashActions = useMemo((): SlashAction[] => {
    return [
      {
        description: 'Start writing plain text.',
        icon: Pilcrow,
        key: 'paragraph',
        title: 'Paragraph',
        onSelect: (ed) => applyParagraph(ed),
      },
      {
        description: 'Big section heading.',
        icon: Type,
        key: 'heading-1',
        title: 'Heading 1',
        onSelect: (ed) => applyHeading(ed, 'h1'),
      },
      {
        description: 'Medium section heading.',
        icon: Type,
        key: 'heading-2',
        title: 'Heading 2',
        onSelect: (ed) => applyHeading(ed, 'h2'),
      },
      {
        description: 'Create a bullet list.',
        icon: List,
        key: 'bullets',
        title: 'Bulleted List',
        onSelect: (ed) => {
          toggleList(ed, readEditorToolbarState(ed).blockType, 'ul')
        },
      },
      {
        description: 'Create a numbered list.',
        icon: ListOrdered,
        key: 'numbers',
        title: 'Numbered List',
        onSelect: (ed) => {
          toggleList(ed, readEditorToolbarState(ed).blockType, 'ol')
        },
      },
      {
        description: 'Add a short note or emphasis block.',
        icon: Quote,
        key: 'quote',
        title: 'Quote',
        onSelect: (ed) => applyQuote(ed),
      },
      {
        description: 'Upload an image to cloud storage and embed it.',
        icon: ImageIcon,
        key: 'image',
        title: 'Image',
        onSelect: () => openImagePicker(),
      },
      {
        description: 'Embed a video from a YouTube link or video ID.',
        icon: TvMinimalPlay,
        key: 'youtube',
        keywords: ['youtube', 'embed', 'video'],
        title: 'Embed YouTube',
        onSelect: (ed) => {
          const raw = window.prompt('Paste a YouTube URL or video ID')
          if (raw === null) return
          const videoId = parseYouTubeVideoId(raw)
          if (!videoId) {
            toast.error('Enter a valid YouTube URL or 11-character video ID.')
            return
          }
          insertYouTubeEmbed(ed, videoId)
        },
      },
      {
        description: 'Track tasks with checkable list items.',
        icon: ListTodo,
        key: 'todo',
        keywords: ['todo', 'checklist', 'task', 'checkbox'],
        title: 'Todo List',
        onSelect: (ed) => applyCheckList(ed),
      },
      {
        description: 'Insert a table (coming soon).',
        icon: Table,
        key: 'table',
        keywords: ['table', 'grid', 'rows', 'columns'],
        title: 'Table',
        isDisabled: true,
        onSelect: () => {},
      },
      {
        description: 'Insert an emoji at the cursor.',
        icon: SmilePlus,
        key: 'emoji',
        title: 'Emoji',
        onSelect: (ed) => ed.dispatchCommand(OPEN_EMOJI_PICKER_COMMAND, undefined),
      },
      {
        description: 'Insert or wrap text with an https link.',
        icon: LinkIcon,
        key: 'link',
        title: 'Link',
        onSelect: (ed) => {
          const raw = window.prompt('Paste link URL (https://)')
          if (raw === null) return
          const url = validateUrl(raw)
          if (!url) {
            toast.error('Enter a valid http(s) URL.')
            return
          }
          applyLinkToSelection(ed, url, '')
        },
      },
      {
        description: 'Syntax-highlighted code block with Prism.',
        icon: Code2,
        key: 'code-block',
        title: 'Code block',
        onSelect: (ed) => applyCodeBlock(ed),
      },
      {
        description: 'Inline @-style mention token.',
        icon: AtSign,
        key: 'mention',
        title: 'Mention',
        onSelect: (ed) => {
          const raw = window.prompt('Mention text')
          if (raw === null) return
          const text = raw.trim()
          if (!text) return
          ed.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              selection.insertNodes([$createMentionNode(text)])
            }
          })
        },
      },
    ]
  }, [openImagePicker])

  const handleImageSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      const institutionId = getUserInstitutionId()
      const userId = getUserId()
      const role = roleForUpload(getRole())

      if (!institutionId?.trim() || !userId?.trim() || !role) {
        toast.error('Sign in with an institution to upload images.')
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        toast.error('Please choose a JPEG or PNG image.')
        return
      }

      const result = await uploadFile({
        institutionId: institutionId.trim(),
        teacherId: userId.trim(),
        file,
        title: file.name.split('.')[0],
        role,
      })

      if (!result.success || !result.publicUrl) {
        toast.error(result.error ?? 'Could not upload image.')
        return
      }

      editor.update(() => {
        const imageNode = $createImageNode({
          altText: file.name,
          maxWidth: 720,
          src: result.publicUrl!,
        })
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode])
        } else {
          // Selection is lost (e.g. file picker dialog stole focus) — append to end
          const paragraph = $createParagraphNode()
          paragraph.append(imageNode)
          $getRoot().append(paragraph)
        }
      })
    },
    [editor, getRole, getUserId, getUserInstitutionId],
  )

  const triggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
    maxLength: 75,
    punctuation: '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;',
  })

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const base = !normalizedQuery
      ? slashActions
      : slashActions.filter((action) => {
          const haystack = [
            action.key,
            action.title,
            action.description,
            ...(action.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(normalizedQuery)
        })

    return base.map((action) => new SlashMenuOption(action))
  }, [query, slashActions])

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        aria-hidden
        onChange={handleImageSelected}
      />
      <LexicalTypeaheadMenuPlugin
        options={options}
        onQueryChange={(value) => setQuery(value ?? '')}
        onSelectOption={(option, _textNode, closeMenu) => {
          if (option.isDisabled) return
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
            setHighlightedIndex={setHighlightedIndex as (index: number | null) => void}
            matchingString={matchingString}
          />
        )}
        preselectFirstItem
      />
    </>
  )
}
