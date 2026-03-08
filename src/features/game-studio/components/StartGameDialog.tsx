import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { StartGameDialogProps } from '../types/game-studio.types'
import { useTranslation } from 'react-i18next'
import DefaultBackgroundGallery from '@/components/shared/DefaultBackgroundGallery'
import type { ThemeId } from '@/lib/themes'

function getTitleFromData(initialData: StartGameDialogProps['initialData']): string {
  if (!initialData) return ''
  if (typeof initialData.title === 'string' && initialData.title.trim()) return initialData.title
  if (typeof initialData.label === 'string' && initialData.label.trim()) return initialData.label
  return ''
}

function getDescriptionFromData(initialData: StartGameDialogProps['initialData']): string {
  if (!initialData || typeof initialData.description !== 'string') return ''
  return initialData.description
}

function getThemeIdFromData(initialData: StartGameDialogProps['initialData']): ThemeId {
  return initialData?.theme_id ?? 'blue'
}

export default function StartGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: StartGameDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [themeId, setThemeId] = useState<ThemeId>('blue')
  const prevOpenRef = useRef(false)

  // Sync from node data only when dialog opens so we show persisted values and don't overwrite edits
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open

    if (open) {
      if (justOpened && initialData) {
        setTitle(getTitleFromData(initialData))
        setDescription(getDescriptionFromData(initialData))
        setThemeId(getThemeIdFromData(initialData))
      }
    } else {
      setTitle('')
      setDescription('')
      setThemeId('blue')
    }
  }, [open, initialData])

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return
    onSave?.({ title: title.trim(), description: description.trim(), theme_id: themeId })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setThemeId('blue')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]!">
        <DialogHeader>
          <DialogTitle>{t('startDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('startDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-node-title">{t('startDialog.fieldTitle')}</Label>
            <Input
              id="start-node-title"
              placeholder={t('startDialog.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-node-description">{t('startDialog.fieldDescription')}</Label>
            <Textarea
              id="start-node-description"
              placeholder={t('startDialog.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label>{t('startDialog.themeLabel')}</Label>
            <p className="text-sm text-muted-foreground">{t('startDialog.themeHint')}</p>
            <DefaultBackgroundGallery
              selectedId={themeId}
              onSelect={setThemeId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="darkblue"
            onClick={handleSave}
            disabled={!title.trim() || !description.trim()}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
