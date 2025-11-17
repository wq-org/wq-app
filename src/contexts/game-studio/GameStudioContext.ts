import { createContext, useContext } from 'react';
import type { Node } from '@xyflow/react';

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
  setSelectedNode: (node: GameNode | null) => void;
  addNode: (position: { x: number; y: number }, data?: { title?: string; description?: string }) => void;
  updateNode: (nodeId: string, updates: { title?: string; description?: string }) => void;
  setNodes: (nodes: Node[]) => void;
  getNode: (nodeId: string) => Node | undefined;
}

export const GameStudioContext = createContext<GameStudioContextValue>({
  selectedNode: null,
  nodes: [],
  setSelectedNode: () => {},
  addNode: () => {},
  updateNode: () => {},
  setNodes: () => {},
  getNode: () => undefined,
});

export const useGameStudioContext = () => useContext(GameStudioContext);

