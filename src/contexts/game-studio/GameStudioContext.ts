import { createContext, useContext } from 'react';
import type { Node, Edge } from '@xyflow/react';

export interface GameNode {
  id: string;
  title: string;
  description: string;
  gameType?: string;
  position?: { x: number; y: number };
}

export interface GameStudioContextValue {
  selectedNode: GameNode | null;
  nodes: Node[];
  edges: Edge[];
  setSelectedNode: (node: GameNode | null) => void;
  addNode: (position: { x: number; y: number }, data?: { title?: string; description?: string }) => void;
  updateNode: (nodeId: string, updates: { title?: string; description?: string }) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNode: (nodeId: string) => Node | undefined;
}

export const GameStudioContext = createContext<GameStudioContextValue>({
  selectedNode: null,
  nodes: [],
  edges: [],
  setSelectedNode: () => {},
  addNode: () => {},
  updateNode: () => {},
  setNodes: () => {},
  setEdges: () => {},
  getNode: () => undefined,
});

export const useGameStudioContext = () => useContext(GameStudioContext);

