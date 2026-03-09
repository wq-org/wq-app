import { useEffect, useMemo, useRef, useState } from 'react'
import { GitBranchPlus, GitPullRequestClosed, Split } from 'lucide-react'
import { Text } from '@/components/ui/text'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import type { IfElseGameDialogProps } from '../types/game-studio.types'
import { GameNodeLayout } from './GameNodeLayout'
import { useTranslation } from 'react-i18next'

type IfElsePath = 'A' | 'B'

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
  const [correctMessage, setCorrectMessage] = useState('')
  const [wrongMessage, setWrongMessage] = useState('')
  const [correctPath, setCorrectPath] = useState<IfElsePath>('A')
  const prevOpenRef = useRef(false)

  const { branchA, branchB } = useMemo(() => {
    if (!nodeId) return { branchA: null, branchB: null }

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId)
    const findBranchNode = (handleId: string) => {
      const edge = outgoingEdges.find((item) => item.sourceHandle === handleId)
      return edge ? (nodes.find((node) => node.id === edge.target) ?? null) : null
    }

    return {
      branchA: findBranchNode('right-top'),
      branchB: findBranchNode('right-bottom'),
    }
  }, [edges, nodeId, nodes])

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open

    if (open) {
      if (justOpened && initialData) {
        setTitle(initialData.title ?? initialData.label ?? '')
        setDescription(initialData.description ?? '')
        setCorrectMessage(initialData.correctMessage ?? '')
        setWrongMessage(initialData.wrongMessage ?? '')
        setCorrectPath(initialData.correctPath ?? 'A')
      }
    } else {
      setTitle('')
      setDescription('')
      setCorrectMessage('')
      setWrongMessage('')
      setCorrectPath('A')
    }
  }, [initialData, open])

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setCorrectMessage('')
    setWrongMessage('')
    setCorrectPath('A')
    onOpenChange(false)
  }

  const handleSave = () => {
    onSave?.(
      {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        correctMessage: correctMessage.trim() || undefined,
        wrongMessage: wrongMessage.trim() || undefined,
        correctPath,
      },
      nodeId,
    )
    handleCancel()
  }

  const handleDelete = () => {
    onDelete?.()
    handleCancel()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]!">
        <DialogHeader>
          <DialogTitle>{t('ifElseDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('ifElseDialog.description')}</DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          editorContent={
            <div className="flex flex-col gap-6">
              <Alert className="border-orange-500/20 bg-orange-500/5 text-orange-500">
                <Split className="h-4 w-4" />
                <AlertTitle>{t('ifElseDialog.editorAlertTitle')}</AlertTitle>
                <AlertDescription>
                  <p>{t('ifElseDialog.editorAlertDescription')}</p>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ifelse-node-title">{t('ifElseDialog.fieldTitle')}</Label>
                <Input
                  id="ifelse-node-title"
                  placeholder={t('ifElseDialog.titlePlaceholder')}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="ifelse-correct-message"
                  className="flex items-center gap-2"
                >
                  <GitBranchPlus className="h-4 w-4 text-orange-500" />
                  {t('ifElseDialog.fieldCorrectMessage')}
                </Label>
                <Textarea
                  id="ifelse-correct-message"
                  placeholder={t('ifElseDialog.correctMessagePlaceholder')}
                  value={correctMessage}
                  onChange={(event) => setCorrectMessage(event.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="ifelse-wrong-message"
                  className="flex items-center gap-2"
                >
                  <GitPullRequestClosed className="h-4 w-4 text-orange-500" />
                  {t('ifElseDialog.fieldWrongMessage')}
                </Label>
                <Textarea
                  id="ifelse-wrong-message"
                  placeholder={t('ifElseDialog.wrongMessagePlaceholder')}
                  value={wrongMessage}
                  onChange={(event) => setWrongMessage(event.target.value)}
                  rows={4}
                />
              </div>
            </div>
          }
          settingsContent={
            <div className="flex flex-col gap-4">
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                {t('ifElseDialog.deleteHint')}
              </Text>
              {onDelete ? (
                <HoldToDeleteButton
                  onDelete={handleDelete}
                  holdDuration={3000}
                />
              ) : (
                <Text
                  as="p"
                  variant="body"
                  className="text-sm text-muted-foreground"
                >
                  {t('nodeLayout.noContent')}
                </Text>
              )}
            </div>
          }
          overviewContent={
            <div className="flex flex-col gap-5">
              <Alert className="border-orange-500/20 bg-orange-500/5 text-orange-500">
                <Split className="h-4 w-4" />
                <AlertTitle>{t('ifElseDialog.overviewAlertTitle')}</AlertTitle>
                <AlertDescription>
                  <p>{t('ifElseDialog.overviewAlertDescription')}</p>
                </AlertDescription>
              </Alert>
              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={correctPath === 'A' ? 'default' : 'secondary'}>
                        {correctPath === 'A'
                          ? t('ifElseDialog.routeCardCorrect')
                          : t('ifElseDialog.routeCardWrong')}
                      </Badge>
                      <Badge variant="outline">{t('common.nodeA')}</Badge>
                    </div>
                    <Text
                      as="p"
                      variant="body"
                      className="text-sm text-muted-foreground md:text-right"
                    >
                      {String(branchA?.data?.label || branchA?.data?.title || '').trim() ||
                        t('ifElseDialog.routeCardNotConnected')}
                    </Text>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={correctPath === 'B' ? 'darkblue' : 'secondary'}>
                        {correctPath === 'B'
                          ? t('ifElseDialog.routeCardCorrect')
                          : t('ifElseDialog.routeCardWrong')}
                      </Badge>
                      <Badge variant="outline">{t('common.nodeB')}</Badge>
                    </div>
                    <Text
                      as="p"
                      variant="body"
                      className="text-sm text-muted-foreground md:text-right"
                    >
                      {String(branchB?.data?.label || branchB?.data?.title || '').trim() ||
                        t('ifElseDialog.routeCardNotConnected')}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <DialogFooter className="flex border-t border-gray-200 pt-4 gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="darkblue"
            onClick={handleSave}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
