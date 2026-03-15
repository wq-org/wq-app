'use client'

import { useState } from 'react'
import { X, Trophy } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PublishDrawerProps } from '../types/game-studio.types'
import type { Node } from '@xyflow/react'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'
import {
  getValidationResult,
  getPointsForNode,
  hasParagraphPenalties,
} from '../utils/publishValidation'
import { PublishGameCheckList } from './PublishGameCheckList'
import { useTranslation } from 'react-i18next'

export function PublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
  gameTitle: propGameTitle,
  onPublish,
}: PublishDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [publishing, setPublishing] = useState(false)
  const startNode = nodes.find((n: Node) => n.type === 'gameStart')
  const gameTitle =
    propGameTitle ||
    (startNode?.data?.title as string) ||
    (startNode?.data?.label as string) ||
    t('publishDrawer.untitledGame')

  const validationResult = getValidationResult(nodes, edges)
  const canPublish = validationResult.canPublish
  const totalNodesCount = nodes.length
  const totalPoints = nodes.reduce((sum, node) => sum + getPointsForNode(node), 0)
  const showFloorNote = hasParagraphPenalties(nodes)

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

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 shrink-0">
            {/* Game Overview Card */}
            <Card className="border-2 border-blue-500 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Text
                      as="span"
                      variant="small"
                      className="text-sm font-medium text-gray-700"
                    >
                      {t('publishDrawer.gameTitleLabel')}
                    </Text>
                    <Text
                      as="span"
                      variant="small"
                      className="text-sm text-gray-600"
                    >
                      {String(gameTitle)}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Text
                      as="span"
                      variant="small"
                      className="text-sm font-medium text-gray-700"
                    >
                      {t('publishDrawer.totalNodesLabel')}
                    </Text>
                    <Badge
                      variant="outline"
                      className="text-sm"
                    >
                      {String(totalNodesCount)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Text
                        as="span"
                        variant="small"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t('publishDrawer.totalPointsLabel')}
                      </Text>
                      <Badge variant="secondary">
                        <Trophy className="w-3 h-3 mr-1" />
                        {t('publishDrawer.pointsValue', { points: totalPoints.toFixed(1) })}
                      </Badge>
                    </div>
                    {showFloorNote && (
                      <Text
                        as="p"
                        variant="body"
                        className="text-xs text-muted-foreground"
                      >
                        {t('publishDrawer.floorNote')}
                      </Text>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
