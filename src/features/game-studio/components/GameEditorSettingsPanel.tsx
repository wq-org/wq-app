import { useEffect, useMemo, useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { Archive, ArrowUp, Check, MoreHorizontal, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ColorPicker } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { ThemeId } from '@/lib/themes'

import { useGameReleaseStatus } from '../hooks/useGameReleaseStatus'
import { getPublishValidationResult } from '../utils/publishValidation'
import { GameArchiveDialog } from './GameArchiveDialog'
import { GameDeleteDialog } from './GameDeleteDialog'
import { GamePublishDialog } from './GamePublishDialog'
import { GameLiveSnapshotCard } from './GameLiveSnapshotCard'
import { GamePublishGraphIssueList } from './GamePublishGraphIssueList'
import { GameReleasePanel } from './GameReleasePanel'

export type GameEditorSettingsPanelProps = {
  open: boolean
  onClose: () => void
  projectId: string | undefined
  teacherId: string | undefined
  title: string
  description: string
  themeId: ThemeId
  nodes: Node[]
  edges: Edge[]
  linkedCourseIds?: string[]
  onSave: (payload: { title: string; description: string; theme_id: ThemeId }) => Promise<void>
  onDelete: () => void
  onPublish: (courseIds: string[]) => Promise<void>
  onFocusNode?: (nodeId: string) => void
}

export function GameEditorSettingsPanel({
  open,
  onClose,
  projectId,
  teacherId,
  title: initialTitle,
  description: initialDescription,
  themeId: initialThemeId,
  nodes,
  edges,
  linkedCourseIds = [],
  onSave,
  onDelete,
  onPublish,
  onFocusNode,
}: GameEditorSettingsPanelProps) {
  const { t } = useTranslation('features.gameStudio')
  const [localTitle, setLocalTitle] = useState(initialTitle)
  const [localDescription, setLocalDescription] = useState(initialDescription)
  const [localThemeId, setLocalThemeId] = useState<ThemeId>(initialThemeId)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  const {
    live,
    diff,
    deliveryCount,
    offlineDeliveryCount,
    loading: releaseLoading,
    refetch: refetchReleaseStatus,
  } = useGameReleaseStatus({ gameId: projectId })

  const validationResult = useMemo(() => getPublishValidationResult(nodes, edges), [nodes, edges])
  const canPublish = validationResult.canPublish

  const hasChanges =
    localTitle !== initialTitle ||
    localDescription !== initialDescription ||
    localThemeId !== initialThemeId

  const publishButtonLabel = live
    ? isPublishing
      ? t('settingsPanel.publishing')
      : t('settingsPanel.publishUpdate')
    : isPublishing
      ? t('settingsPanel.publishing')
      : t('settingsPanel.publishGame')

  // Reset fields and refetch snapshot when panel opens
  useEffect(() => {
    if (!open) return
    setLocalTitle(initialTitle)
    setLocalDescription(initialDescription)
    setLocalThemeId(initialThemeId)
    void refetchReleaseStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Debounced auto-save for title and description
  useEffect(() => {
    if (!hasChanges || isSaving) return
    const timer = setTimeout(() => {
      void onSave({ title: localTitle, description: localDescription, theme_id: localThemeId })
    }, 900)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTitle, localDescription])

  const handleSave = async () => {
    if (!hasChanges) return
    setIsSaving(true)
    try {
      await onSave({ title: localTitle, description: localDescription, theme_id: localThemeId })
      await refetchReleaseStatus()
      toast.success(t('settingsPanel.toasts.saved'))
    } catch {
      toast.error(t('settingsPanel.toasts.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishConfirm = async (courseIds: string[]) => {
    setIsPublishing(true)
    try {
      if (hasChanges) {
        await onSave({
          title: localTitle,
          description: localDescription,
          theme_id: localThemeId,
        })
      }
      await onPublish(courseIds)
      await refetchReleaseStatus()
      toast.success(t('settingsPanel.toasts.publishSuccess'))
    } catch {
      toast.error(t('settingsPanel.toasts.publishFailed'))
      throw new Error(t('settingsPanel.toasts.publishFailed'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('settingsPanel.title')}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[50vw] flex-col bg-background border-l shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-5">
          <div>
            <Text
              as="h2"
              variant="h2"
              className="text-xl font-bold"
            >
              {t('settingsPanel.title')}
            </Text>
            <Text
              as="p"
              variant="small"
              muted
              className="mt-0.5"
            >
              {t('settingsPanel.subtitle')}
            </Text>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('settingsDrawer.closeAriaLabel')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6 pb-4">
            <FieldCard>
              <FieldInput
                id="game-settings-title"
                value={localTitle}
                onValueChange={setLocalTitle}
                label={t('settingsPanel.titleLabel')}
                placeholder={t('settingsDrawer.projectTitlePlaceholder')}
              />
              <FieldTextarea
                id="game-settings-description"
                value={localDescription}
                onValueChange={setLocalDescription}
                label={t('settingsPanel.descriptionLabel')}
                placeholder={t('settingsDrawer.projectDescriptionPlaceholder')}
                rows={4}
              />
            </FieldCard>

            <div className="flex flex-col gap-3">
              <Label>{t('settingsDrawer.themeLabel')}</Label>
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                {t('settingsDrawer.themeHint')}
              </Text>
              <ColorPicker
                selectedId={localThemeId}
                onSelect={setLocalThemeId}
              />
            </div>

            <GameLiveSnapshotCard
              live={live}
              deliveryCount={deliveryCount}
              offlineDeliveryCount={offlineDeliveryCount}
              loading={releaseLoading}
            />

            <GameReleasePanel
              live={live}
              diff={diff}
              loading={releaseLoading}
            />

            {!canPublish && validationResult.issues.length > 0 && (
              <GamePublishGraphIssueList
                issues={validationResult.issues}
                canPublish={false}
                onFocusNode={onFocusNode}
              />
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
          <Popover
            open={moreMenuOpen}
            onOpenChange={setMoreMenuOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2"
                aria-label={t('settingsPanel.moreActions')}
              >
                <MoreHorizontal
                  className="size-4"
                  aria-hidden
                />
                {t('settingsPanel.moreActionsLabel')}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 gap-1 p-1.5"
            >
              <Button
                variant="orange"
                className="h-9 w-full justify-start gap-2 px-2"
                disabled={releaseLoading}
                onClick={() => {
                  setMoreMenuOpen(false)
                  setArchiveDialogOpen(true)
                }}
              >
                <Archive
                  className="size-4"
                  aria-hidden
                />
                {t('settingsPanel.archiveAction')}
              </Button>
              <div className="my-1 h-px bg-border" />
              <Button
                variant="ghost"
                className="h-9 w-full justify-start gap-2 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setMoreMenuOpen(false)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2
                  className="size-4"
                  aria-hidden
                />
                {t('settingsPanel.deleteAction')}
              </Button>
            </PopoverContent>
          </Popover>

          <Button
            variant="secondary"
            className="gap-2"
            disabled={!hasChanges || isSaving}
            onClick={() => {
              void handleSave()
            }}
          >
            {isSaving ? (
              <Spinner
                variant="white"
                size="xs"
              />
            ) : (
              <Check
                className="size-4 shrink-0"
                aria-hidden
              />
            )}
            {isSaving ? t('settingsPanel.saving') : t('settingsPanel.saveDraft')}
          </Button>

          <Button
            variant="darkblue"
            className="gap-2 whitespace-nowrap"
            disabled={!canPublish || isPublishing || releaseLoading}
            onClick={() => setPublishDialogOpen(true)}
          >
            {isPublishing ? (
              <Spinner
                variant="white"
                size="xs"
              />
            ) : (
              <ArrowUp
                className="size-4 shrink-0"
                aria-hidden
              />
            )}
            {publishButtonLabel}
          </Button>
        </div>
      </div>

      <GamePublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        teacherId={teacherId}
        linkedCourseIds={linkedCourseIds}
        onPublish={handlePublishConfirm}
      />

      {projectId && (
        <GameArchiveDialog
          gameId={projectId}
          open={archiveDialogOpen}
          onOpenChange={setArchiveDialogOpen}
          onArchived={onClose}
        />
      )}

      {projectId && (
        <GameDeleteDialog
          gameId={projectId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={onDelete}
        />
      )}
    </>
  )
}
