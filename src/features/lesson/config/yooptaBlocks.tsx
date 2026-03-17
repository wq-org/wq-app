import {
  type SlateElement,
  YooptaPlugin,
  type YooptaPlugin as YooptaPluginType,
} from '@yoopta/editor'
import { Blocks } from '@yoopta/editor'
import { Editor as SlateCoreEditor, Range } from 'slate'
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Blockquote from '@yoopta/blockquote'
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings'
import Image from '@yoopta/image'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import { BulletedList, NumberedList } from '@yoopta/lists'
import { Bold, Italic, Strike, Underline } from '@yoopta/marks'
import Paragraph from '@yoopta/paragraph'
import Toolbar from '@yoopta/toolbar'
import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { getCompleteProfile } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { LessonImageElement } from '../components/LessonMediaElements'
import { LessonInlineToolbar } from '../components/LessonInlineToolbar'

function sanitizePluginElements<T extends Record<string, unknown>>(elements: T): T {
  const entries = Object.entries(elements).filter(([, value]) => value != null)
  return Object.fromEntries(entries) as T
}

function sanitizePlugin<TElements extends Record<string, SlateElement>, TOptions>(
  plugin: YooptaPluginType<TElements, TOptions>,
): YooptaPluginType<TElements, TOptions> {
  const definition = plugin.getPlugin
  return new YooptaPlugin({
    ...definition,
    elements: sanitizePluginElements(definition.elements),
  }) as unknown as YooptaPluginType<TElements, TOptions>
}

function withLessonKeybindings<TElements extends Record<string, SlateElement>, TOptions>(
  plugin: YooptaPluginType<TElements, TOptions>,
): YooptaPluginType<TElements, TOptions> {
  const existingFactory = plugin.getPlugin.events?.onKeyDown

  return plugin.extend({
    events: {
      onKeyDown: (editor, slate, options) => {
        const existingHandler = existingFactory?.(editor, slate, options)

        return (event) => {
          if (event.key !== 'Backspace') {
            existingHandler?.(event)
            return
          }

          if (event.defaultPrevented) return
          if (!slate.selection || !Range.isCollapsed(slate.selection)) {
            existingHandler?.(event)
            return
          }

          const isAtStart = SlateCoreEditor.isStart(slate, slate.selection.anchor, [])
          if (!isAtStart) {
            existingHandler?.(event)
            return
          }

          const isEmpty = SlateCoreEditor.string(slate, []) === ''
          if (!isEmpty) {
            existingHandler?.(event)
            return
          }

          const totalBlocks = Object.keys(editor.children ?? {}).length
          if (totalBlocks <= 1) {
            existingHandler?.(event)
            return
          }

          event.preventDefault()
          Blocks.deleteBlock(editor, { blockId: options.currentBlock.id, focus: true })
        }
      },
    },
  })
}

export const LESSON_BLOCK_TYPES = [
  'Paragraph',
  'HeadingOne',
  'HeadingTwo',
  'HeadingThree',
  'BulletedList',
  'NumberedList',
  'Blockquote',
  'Image',
] as const

export type LessonToolbarBlockType = (typeof LESSON_BLOCK_TYPES)[number]

export function buildLessonYooptaPlugins(): readonly YooptaPluginType<
  Record<string, SlateElement>
>[] {
  const baseImage = Image.getPlugin
  const LessonImage = new YooptaPlugin({
    ...baseImage,
    elements: {
      ...baseImage.elements,
      image: {
        ...baseImage.elements.image,
        render: LessonImageElement,
      },
    },
    options: {
      ...baseImage.options,
      display: {
        title: 'Image',
        description: 'Add an image',
      },
      upload: async (file: File) => {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const userId = session?.user?.id ?? null
        if (!userId) {
          throw new Error('User session missing')
        }

        const profile = await getCompleteProfile(userId)
        const institutionId = profile?.userInstitutionId ?? null
        const role = profile?.role ?? null

        if (!institutionId) {
          throw new Error('Institution ID missing')
        }
        if (!role) {
          throw new Error('User role missing')
        }

        const result = await uploadFile({
          institutionId,
          teacherId: userId,
          file,
          role,
        })

        if (!result.success || !result.path) {
          throw new Error(result.error || 'Failed to upload image')
        }

        // Persist private storage path in `src` (resolved later via signed URL hook).
        return {
          id: result.path,
          src: result.path,
          alt: null,
        }
      },
    },
  }) as unknown as YooptaPluginType<Record<string, SlateElement>>

  return [
    sanitizePlugin(withLessonKeybindings(Paragraph)),
    sanitizePlugin(withLessonKeybindings(HeadingOne)),
    sanitizePlugin(withLessonKeybindings(HeadingTwo)),
    sanitizePlugin(withLessonKeybindings(HeadingThree)),
    sanitizePlugin(withLessonKeybindings(BulletedList)),
    sanitizePlugin(withLessonKeybindings(NumberedList)),
    sanitizePlugin(withLessonKeybindings(Blockquote)),
    sanitizePlugin(withLessonKeybindings(LessonImage)),
  ] as readonly YooptaPluginType<Record<string, SlateElement>>[]
}

export const LESSON_YOOPTA_PLUGINS = buildLessonYooptaPlugins()

export const LESSON_EDITOR_MARKS = [Bold, Italic, Underline, Strike] as const

export const LESSON_EDITOR_TOOLS = {
  ActionMenu: {
    tool: ActionMenuList,
    render: DefaultActionMenuRender,
    items: [...LESSON_BLOCK_TYPES],
  },
  Toolbar: {
    tool: Toolbar,
    render: LessonInlineToolbar,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
} as const
