'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import type { PublishDrawerProps } from '../types/game-studio.types'
import { toast } from 'sonner'
import { getValidationResult } from '../utils/publishValidation'
import { PublishGameCheckList } from './PublishGameCheckList'
import { useTranslation } from 'react-i18next'

export function GamePublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
  onPublish,
}: PublishDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [publishing, setPublishing] = useState(false)

  const validationResult = getValidationResult(nodes, edges)
  const canPublish = validationResult.canPublish

  const handlePublish = async () => {
    if (!canPublish) {
      toast.error(
        validationResult.globalErrors[0] ??
          validationResult.nodeItems.find((i) => i.errors.length > 0)?.errors[0] ??
          t('publishDrawer.cannotPublishGame'),
      )
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

        <div className="flex-1" />

        {/* Publish Button - Always at bottom */}
        <div className="p-6 border-t shrink-0">
          {!canPublish && (
            <div className="mb-4">
              <PublishGameCheckList validationResult={validationResult} />
            </div>
          )}
          <HoldConfirmButton
            onConfirm={handlePublish}
            variant="darkblue"
            className="rounded-lg w-full"
            disabled={!canPublish || publishing}
          >
            {publishing ? t('publishDrawer.publishing') : t('publishDrawer.publishForStudents')}
          </HoldConfirmButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
