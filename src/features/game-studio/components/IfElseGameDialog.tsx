import { useState, useEffect, useMemo, useRef } from 'react'
import { Text } from '@/components/ui/text'
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import type { IfElseGameDialogProps } from '../types/game-studio.types'
import GameNodeLayout from './GameNodeLayout'
import { useTranslation } from 'react-i18next'

export default function IfElseGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  nodeId,
  onDelete,
  nodes = [],
  edges = [],
}: IfElseGameDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('')
  const [correctPath, setCorrectPath] = useState<'A' | 'B'>('A')
  const prevOpenRef = useRef(false)

  // Find incoming and outgoing nodes
  const { incomingNode, outgoingNodes } = useMemo(() => {
    if (!nodeId) return { incomingNode: null, outgoingNodes: [] }

    const incomingEdge = edges.find((e) => e.target === nodeId)
    const incomingNode = incomingEdge ? nodes.find((n) => n.id === incomingEdge.source) : null

    const outgoingEdges = edges.filter((e) => e.source === nodeId)
    const outgoingNodes = outgoingEdges
      .map((edge) => {
        const node = nodes.find((n) => n.id === edge.target)
        const handleId = edge.sourceHandle || ''
        return node ? { node, handleId } : null
      })
      .filter((item): item is { node: (typeof nodes)[0]; handleId: string } => item !== null)

    return { incomingNode, outgoingNodes }
  }, [nodeId, nodes, edges])

  // Sync from node data only when dialog opens (open: false -> true) so we show persisted values and don't overwrite in-progress edits
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open

    if (open) {
      if (justOpened && initialData) {
        setTitle(initialData.title ?? initialData.label ?? '')
        setDescription(initialData.description ?? '')
        setCondition(initialData.condition ?? '')
        setCorrectPath(initialData.correctPath ?? 'A')
      }
    } else {
      setTitle('')
      setDescription('')
      setCondition('')
      setCorrectPath('A')
    }
  }, [open, initialData])

  const handleSave = () => {
    onSave?.(
      {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        condition: condition.trim() || undefined,
        correctPath,
      },
      nodeId,
    )
    handleCancel()
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setCondition('')
    setCorrectPath('A')
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      handleCancel()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[min(1080px,calc(100vw-2rem))]">
        <DialogHeader>
          <DialogTitle>{t('ifElseDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('ifElseDialog.description')}</DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          onDelete={onDelete ? handleDelete : undefined}
          settingsContent={
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ifelse-node-title">{t('ifElseDialog.fieldTitle')}</Label>
                <Input
                  id="ifelse-node-title"
                  placeholder={t('ifElseDialog.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ifelse-node-description">
                  {t('ifElseDialog.fieldDescription')}
                </Label>
                <Textarea
                  id="ifelse-node-description"
                  placeholder={t('ifElseDialog.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              {onDelete && (
                <div>
                  <Text
                    as="p"
                    variant="body"
                    className="text-muted-foreground text-sm mb-3"
                  >
                    {t('ifElseDialog.deleteHint')}
                  </Text>
                  <HoldToDeleteButton
                    onDelete={handleDelete}
                    holdDuration={3000}
                  />
                </div>
              )}
            </div>
          }
          overviewContent={
            <div className="flex flex-col gap-4">
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>{t('ifElseDialog.incomingNode')}</Label>
                <div>
                  {incomingNode ? (
                    <Badge variant="outline">
                      {String(
                        incomingNode.data?.label || incomingNode.data?.title || incomingNode.id,
                      )}
                    </Badge>
                  ) : (
                    <Text
                      as="span"
                      variant="small"
                      className="text-sm text-muted-foreground"
                    >
                      {t('ifElseDialog.noIncomingNode')}
                    </Text>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('ifElseDialog.outgoingNodes')}</Label>
                <div className="flex flex-col gap-2">
                  {outgoingNodes.length > 0 ? (
                    outgoingNodes.map(({ node, handleId }) => {
                      const isNodeA = handleId === 'right-top'
                      const isSelected =
                        (isNodeA && correctPath === 'A') || (!isNodeA && correctPath === 'B')
                      return (
                        <div
                          key={node.id}
                          className="flex items-center gap-2"
                        >
                          <Badge variant={isSelected ? 'default' : 'outline'}>
                            {isNodeA ? t('common.nodeA') : t('common.nodeB')}
                          </Badge>
                          <Badge variant={isSelected ? 'secondary' : 'outline'}>
                            {String(node.data?.label || node.data?.title || node.id)}
                          </Badge>
                        </div>
                      )
                    })
                  ) : (
                    <Text
                      as="span"
                      variant="small"
                      className="text-sm text-muted-foreground"
                    >
                      {t('ifElseDialog.noOutgoingNodes')}
                    </Text>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>{t('ifElseDialog.correctAnswerRoute')}</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={correctPath === 'A'}
                    onCheckedChange={(checked) => setCorrectPath(checked ? 'A' : 'B')}
                  />
                  <Text
                    as="span"
                    variant="small"
                    className="text-sm"
                  >
                    {correctPath === 'A' ? t('common.nodeA') : t('common.nodeB')}
                  </Text>
                </div>
              </div>
            </div>
          }
        />
        <DialogFooter className="flex  border-t border-gray-200 pt-4 gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
