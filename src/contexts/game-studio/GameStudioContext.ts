import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { Node, Edge } from '@xyflow/react'

export interface GameNode {
  id: string
  title: string
  description: string
  gameType?: string
  position?: { x: number; y: number }
}

export interface GameStudioContextValue {
  selectedNode: GameNode | null
  nodes: Node[]
  edges: Edge[]
  setSelectedNode: (node: GameNode | null) => void
  addNode: (
    position: { x: number; y: number },
    data?: { title?: string; description?: string },
  ) => void
  updateNode: (nodeId: string, updates: { title?: string; description?: string }) => void
  setNodes: Dispatch<SetStateAction<Node[]>>
  setEdges: Dispatch<SetStateAction<Edge[]>>
  getNode: (nodeId: string) => Node | undefined
}

const noopSetNodes = (() => undefined) as Dispatch<SetStateAction<Node[]>>
const noopSetEdges = (() => undefined) as Dispatch<SetStateAction<Edge[]>>

export const GameStudioContext = createContext<GameStudioContextValue>({
  selectedNode: null,
  nodes: [],
  edges: [],
  setSelectedNode: () => {},
  addNode: () => {},
  updateNode: () => {},
  setNodes: noopSetNodes,
  setEdges: noopSetEdges,
  getNode: () => undefined,
})

export const useGameStudioContext = () => useContext(GameStudioContext)
