import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { Cloud, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ImageCarousel } from '@/components/shared/media/ImageCarousel'
import type { ImageCarouselImage } from '@/components/shared/media/ImageCarousel'
import { Input } from '@/components/ui/input'
import { SelectTabs, type TabItem } from '@/components/shared/tabs/SelectTabs'
import { cn } from '@/lib/utils'

import { useCloudImagePicker } from '../hooks/useCloudImagePicker'

export type CloudImagePickerSelection = {
  src: string
  altText: string
  filepath: string | null
  cloudFileId: string | null
}

export type CloudImagePickerPanelProps = {
  onSelect: (payload: CloudImagePickerSelection) => void
  onUpload: (file: File) => void
  className?: string
}

const UPLOAD_TAB_ID = 'upload'
const CLOUD_TAB_ID = 'cloud'

const TABS: readonly TabItem[] = [
  { id: UPLOAD_TAB_ID, icon: Upload, title: 'Upload' },
  { id: CLOUD_TAB_ID, icon: Cloud, title: 'Cloud' },
]

type UploadTabProps = {
  onUpload: (file: File) => void
}

function UploadTab({ onUpload }: UploadTabProps) {
  const { t } = useTranslation('features.lesson')

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onUpload(file)
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <label
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2',
          'border-dashed border-border px-4 py-6 text-sm text-muted-foreground',
          'transition-colors hover:border-primary hover:text-primary',
        )}
      >
        <Upload size={20} />
        <span>{t('editor.image.chooseImageUpload')}</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </div>
  )
}

type CloudTabProps = {
  onSelect: (image: ImageCarouselImage) => void
}

function CloudTab({ onSelect }: CloudTabProps) {
  const { t } = useTranslation('features.lesson')
  const { query, setQuery, images, isLoading } = useCloudImagePicker()

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder={t('editor.image.searchCloud')}
        autoComplete="off"
        spellCheck={false}
        className="mb-1 cursor-text bg-background text-foreground caret-foreground placeholder:text-muted-foreground"
        aria-label={t('editor.image.searchCloudAria')}
      />
      <ImageCarousel
        images={images}
        onSelect={onSelect}
        isLoading={isLoading}
        size="xl"
      />
      {!isLoading && images.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {query ? t('editor.image.noResults') : t('editor.image.noCloudImages')}
        </p>
      ) : null}
    </div>
  )
}

export function CloudImagePickerPanel({
  onSelect,
  onUpload,
  className,
}: CloudImagePickerPanelProps) {
  const [activeTabId, setActiveTabId] = useState<string>(UPLOAD_TAB_ID)

  function handleCloudSelect(image: ImageCarouselImage) {
    onSelect({
      src: image.url,
      altText: image.title ?? '',
      filepath: image.storagePath ?? null,
      cloudFileId: image.cloudFileId ?? null,
    })
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-[min(450px,calc(100vw-24px))] max-h-[min(360px,50dvh)] overflow-y-auto rounded-2xl border border-border bg-popover p-3',
        'text-popover-foreground shadow-xl backdrop-blur-xl',
        'supports-backdrop-filter:bg-popover/90',
        className,
      )}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <SelectTabs
        tabs={TABS}
        variant={'compact'}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
      />
      {activeTabId === UPLOAD_TAB_ID ? <UploadTab onUpload={onUpload} /> : null}
      {activeTabId === CLOUD_TAB_ID ? <CloudTab onSelect={handleCloudSelect} /> : null}
    </div>
  )
}
