'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import type { PublishDrawerProps } from '../types/game-studio.types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getPublishValidationResult } from '../utils/publishValidation'
import { GamePublishGraphIssueList } from './GamePublishGraphIssueList'
import { resolvePublishIssueMessage } from '../utils/formatPublishIssue'

export function GamePublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
  onPublish,
  onFocusNode,
}: PublishDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [publishing, setPublishing] = useState(false)

  const validationResult = useMemo(() => getPublishValidationResult(nodes, edges), [nodes, edges])
  const canPublish = validationResult.canPublish

  const handlePublish = async () => {
    if (!canPublish) {
      const firstError = validationResult.issues.find((issue) => issue.severity === 'error')
      if (firstError) {
        toast.error(resolvePublishIssueMessage(firstError, t))
      }
      return
    }

    if (!onPublish) {
      toast.error(t('publishDrawer.publishUnavailable'))
      return
    }

    setPublishing(true)
    try {
      await onPublish()
      toast.success(t('publishDrawer.publishedSuccess'))
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error(t('publishDrawer.publishFailed'))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[50vw]! max-w-none! h-screen flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold">{t('publishDrawer.title')}</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <GamePublishGraphIssueList
            issues={validationResult.issues}
            canPublish={canPublish}
            onFocusNode={onFocusNode}
          />
        </div>

        <div className="shrink-0 border-t p-6">
          <HoldConfirmButton
            onConfirm={handlePublish}
            variant="ghost"
            className="w-full rounded-lg"
            disabled={!canPublish || publishing}
          >
            {publishing ? t('publishDrawer.publishing') : t('publishDrawer.publishForStudents')}
          </HoldConfirmButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
