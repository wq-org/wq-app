import React, { useState, useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { GameStudioContext, type GameStudioContextValue, type GameNode } from './GameStudioContext'

function getInitialNodes(): Node[] {
  return [
    {
      id: 'start-1',
      type: 'gameStart',
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    },
  ]
}

export const GameStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState<GameNode | null>(null)
  const [nodes, setNodes] = useState<Node[]>(() => getInitialNodes())
  const [edges, setEdges] = useState<Edge[]>([])

  const addNode = useCallback(
    (position: { x: number; y: number }, data?: { title?: string; description?: string }) => {
      const newNodeId = `action-${Date.now()}`
      const title = data?.title || 'Paragraph'
      const newNode: Node = {
        id: newNodeId,
        type: 'gameParagraph',
        position,
        data: {
          label: title,
          gameType: data?.description || '',
          title,
          description: data?.description || '',
        },
      }

      setNodes((prevNodes) => {
        // Check if node already exists
        if (prevNodes.find((n) => n.id === newNodeId)) {
          return prevNodes
        }
        return [...prevNodes, newNode]
      })
    },
    [],
  )

  const updateNode = useCallback(
    (nodeId: string, updates: { title?: string; description?: string }) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: updates.title || node.data.label,
                title: updates.title || node.data.title,
                description: updates.description || node.data.description,
              },
            }
          }
          return node
        }),
      )

      // Update selected node if it's the one being updated
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          title: updates.title || selectedNode.title,
          description: updates.description || selectedNode.description,
        })
      }
    },
    [selectedNode],
  )

  const getNode = useCallback(
    (nodeId: string) => {
      return nodes.find((node) => node.id === nodeId)
    },
    [nodes],
  )

  const value: GameStudioContextValue = {
    selectedNode,
    nodes,
    edges,
    setSelectedNode,
    addNode,
    updateNode,
    setNodes,
    setEdges,
    getNode,
  }

  return <GameStudioContext.Provider value={value}>{children}</GameStudioContext.Provider>
}
