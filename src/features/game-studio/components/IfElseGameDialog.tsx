import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { IfElseGameDialogProps } from '../types/game-studio.types'
import GameNodeLayout from './GameNodeLayout'

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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('')
  const [correctPath, setCorrectPath] = useState<'A' | 'B'>('A')

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

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title ?? initialData.label ?? '')
      setDescription(initialData.description ?? '')
      setCondition(initialData.condition ?? '')
      setCorrectPath(initialData.correctPath ?? 'A')
    }
  }, [initialData, open])

  const handleSave = () => {
    onSave?.({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      condition: condition.trim() || undefined,
      correctPath,
    })
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
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]!">
        <DialogHeader>
          <DialogTitle>Configure If/Else Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the if/else node title, description, condition, and correct path
          </DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          onDelete={onDelete ? handleDelete : undefined}
          overviewContent={
            <div className="flex flex-col gap-4">
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>Incoming Node</Label>
                <div>
                  {incomingNode ? (
                    <Badge variant="outline">
                      {String(
                        incomingNode.data?.label || incomingNode.data?.title || incomingNode.id,
                      )}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No incoming node</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Outgoing Nodes</Label>
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
                            {isNodeA ? 'Node A' : 'Node B'}
                          </Badge>
                          <Badge variant={isSelected ? 'secondary' : 'outline'}>
                            {String(node.data?.label || node.data?.title || node.id)}
                          </Badge>
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">No outgoing nodes</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>When user answers correctly</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={correctPath === 'A'}
                    onCheckedChange={(checked) => setCorrectPath(checked ? 'A' : 'B')}
                  />
                  <span className="text-sm">{correctPath === 'A' ? 'Node A' : 'Node B'}</span>
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
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
