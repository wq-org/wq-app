import { useMemo, useRef, useState } from 'react'
import { useYooptaEditor, type PluginElementRenderProps } from '@yoopta/editor'
import { ImageCommands } from '@yoopta/image'
import { ExternalLink, FileText, Image as ImageIcon, Link2, Pencil, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PdfPreview, VideoPreview } from '@/components/shared'
import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { cn } from '@/lib/utils'
import { useLessonFileUrl } from '../hooks/useLessonFileUrl'
import { useLessonEditorPageContext } from './lessonEditorPageContext'

function ReplaceFileButton({
  blockId,
  blockType,
}: {
  blockId: string
  blockType: 'File' | 'Image' | 'Video'
}) {
  const { t } = useTranslation('features.lesson')
  const { pageId, readOnly, requestFileTag } = useLessonEditorPageContext()

  if (readOnly) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background/90 backdrop-blur"
      onClick={() => requestFileTag({ blockId, blockType, mode: 'replace', pageId })}
    >
      <Pencil className="h-3.5 w-3.5" />
      {t('page.fileTag.replace')}
    </Button>
  )
}

function FileState({ emptyLabel }: { emptyLabel: string }) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-muted/30 p-6 text-center">
      <Text
        as="p"
        variant="body"
        className="max-w-sm text-sm text-muted-foreground"
      >
        {emptyLabel}
      </Text>
    </div>
  )
}

type LessonImagePanelTab = 'upload' | 'link'

function normalizeRemoteImageUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function LessonImageElement(props: PluginElementRenderProps) {
  const { t } = useTranslation('features.lesson')
  const editor = useYooptaEditor()
  const blockId = props.blockId
  const { readOnly } = useLessonEditorPageContext()
  const { profile } = useUser()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<LessonImagePanelTab>('upload')
  const [linkValue, setLinkValue] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const imageProps = props.element.props as {
    alt?: string | null
    src?: string | null
  }

  const hasImage = Boolean(imageProps.src?.trim())
  const { resolvedUrl, loading } = useLessonFileUrl(imageProps.src)
  const resolvedAlt = imageProps.alt ?? t('page.fileTag.previewAlt')
  const canEdit = !readOnly
  const showPanel = canEdit && (panelOpen || !hasImage)

  const placeholderLabel = useMemo(() => 'Add an image', [])

  async function handleUpload(file: File) {
    const institutionId = profile?.userInstitutionId ?? null
    const userId = profile?.user_id ?? null
    const role = profile?.role ?? null

    if (!institutionId || !userId || !role) {
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadFile({
        institutionId,
        teacherId: userId,
        file,
        role,
      })

      if (!result.success || !result.path) {
        return
      }

      ImageCommands.updateImage(editor, blockId, {
        src: result.path,
        alt: imageProps.alt ?? null,
      })
      setPanelOpen(false)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handlePickUpload() {
    fileInputRef.current?.click()
  }

  function handleLinkSave() {
    const normalized = normalizeRemoteImageUrl(linkValue)
    if (!normalized) return

    ImageCommands.updateImage(editor, blockId, {
      src: normalized,
      alt: imageProps.alt ?? null,
    })
    setPanelOpen(false)
  }

  function handleEditClick() {
    if (!canEdit) return
    setPanelOpen((open) => !open)
  }

  function handlePlaceholderClick() {
    if (!canEdit) return
    setPanelOpen(true)
  }

  return (
    <div
      {...props.attributes}
      className="relative my-6"
      contentEditable={false}
    >
      {hasImage && canEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background/90 backdrop-blur"
          onClick={handleEditClick}
        >
          <Pencil className="h-3.5 w-3.5" />
          {t('page.fileTag.replace')}
        </Button>
      ) : null}
      {loading ? <Skeleton className="h-64 w-full rounded-[1.75rem]" /> : null}
      {!loading && resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={resolvedAlt}
          className="w-full rounded-[1.75rem] border border-border object-cover"
        />
      ) : null}
      {!loading && !resolvedUrl ? (
        <button
          type="button"
          className={cn(
            'group flex w-full items-center justify-between gap-3 rounded-[1.75rem] border border-dashed border-border bg-muted/30 px-6 py-5 text-left transition-colors',
            canEdit ? 'hover:bg-muted/40' : 'cursor-default',
          )}
          onClick={handlePlaceholderClick}
          disabled={!canEdit}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-background/70 p-3 text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <Text
                as="p"
                variant="body"
                className="text-sm font-medium text-foreground"
              >
                {placeholderLabel}
              </Text>
              <Text
                as="p"
                variant="small"
                className="text-xs text-muted-foreground"
              >
                {t('page.fileTag.emptyImage')}
              </Text>
            </div>
          </div>
          {canEdit ? (
            <Text
              as="span"
              variant="small"
              className="text-xs text-muted-foreground group-hover:text-foreground"
            >
              {t('page.fileTag.replace')}
            </Text>
          ) : null}
        </button>
      ) : null}

      {showPanel ? (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={tab === 'upload' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTab('upload')}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              type="button"
              variant={tab === 'link' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTab('link')}
            >
              <Link2 className="h-4 w-4" />
              Link
            </Button>
            <div className="flex-1" />
            {hasImage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPanelOpen(false)}
              >
                Close
              </Button>
            ) : null}
          </div>

          <Separator className="my-3" />

          {tab === 'upload' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void handleUpload(file)
                }}
              />
              <Button
                type="button"
                onClick={handlePickUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Choose image'}
              </Button>
              <Text
                as="p"
                variant="small"
                className="text-xs text-muted-foreground"
              >
                Uploads to your private cloud storage.
              </Text>
            </div>
          ) : null}

          {tab === 'link' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="https://example.com/image.png"
                  inputMode="url"
                />
              </div>
              <Button
                type="button"
                onClick={handleLinkSave}
                disabled={!linkValue.trim()}
              >
                Save
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      {props.children}
    </div>
  )
}

export function LessonVideoElement(props: PluginElementRenderProps) {
  const { t } = useTranslation('features.lesson')
  const blockId = props.blockId
  const videoProps = props.element.props as {
    src?: string | null
  }
  const { resolvedUrl, loading } = useLessonFileUrl(videoProps.src)

  return (
    <div
      {...props.attributes}
      className="relative my-6"
      contentEditable={false}
    >
      <ReplaceFileButton
        blockId={blockId}
        blockType="Video"
      />
      {loading ? <Skeleton className="h-72 w-full rounded-[1.75rem]" /> : null}
      {!loading && resolvedUrl ? <VideoPreview videoUrl={resolvedUrl} /> : null}
      {!loading && !resolvedUrl ? <FileState emptyLabel={t('page.fileTag.emptyVideo')} /> : null}
      {props.children}
    </div>
  )
}

export function LessonFileElement(props: PluginElementRenderProps) {
  const { t } = useTranslation('features.lesson')
  const blockId = props.blockId
  const fileProps = props.element.props as {
    format?: string | null
    name?: string | null
    size?: number | null
    src?: string | null
  }
  const { resolvedUrl, loading } = useLessonFileUrl(fileProps.src)
  const isPdf =
    fileProps.format?.toLowerCase() === 'pdf' || fileProps.name?.toLowerCase().endsWith('.pdf')

  return (
    <div
      {...props.attributes}
      className="relative my-6"
      contentEditable={false}
    >
      <ReplaceFileButton
        blockId={blockId}
        blockType="File"
      />
      {loading ? <Skeleton className="h-72 w-full rounded-[1.75rem]" /> : null}
      {!loading && resolvedUrl && isPdf ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card">
          <div className="h-[32rem] w-full">
            <PdfPreview
              pdfUrl={resolvedUrl}
              fileName={fileProps.name ?? 'document.pdf'}
            />
          </div>
        </div>
      ) : null}
      {!loading && (!isPdf || !resolvedUrl) ? (
        <div className="rounded-[1.75rem] border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Text
                as="p"
                variant="body"
                className="truncate font-semibold"
              >
                {fileProps.name || t('page.fileTag.untitledFile')}
              </Text>
              <Text
                as="p"
                variant="small"
                className="text-muted-foreground"
              >
                {fileProps.format?.toUpperCase() || t('page.fileTag.genericFile')}
              </Text>
            </div>
            {resolvedUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('page.fileTag.open')}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {!loading && !resolvedUrl && !isPdf ? (
        <FileState emptyLabel={t('page.fileTag.emptyFile')} />
      ) : null}
      {props.children}
    </div>
  )
}

export function LessonPageBreakElement(props: PluginElementRenderProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <div
      {...props.attributes}
      className="my-8"
      contentEditable={false}
    >
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Separator className="flex-1 border-dashed" />
        <span
          className={cn(
            'whitespace-nowrap rounded-full border border-border bg-background px-3 py-1',
          )}
        >
          {t('page.pageBreakLabel')}
        </span>
        <Separator className="flex-1 border-dashed" />
      </div>
      {props.children}
    </div>
  )
}
