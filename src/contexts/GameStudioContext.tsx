import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Node } from '@xyflow/react';

export interface GameNode {
  id: string;
  title: string;
  description: string;
  gameType?: string;
  position?: { x: number; y: number };
}

interface GameStudioContextValue {
  selectedNode: GameNode | null;
  nodes: Node[];
  setSelectedNode: (node: GameNode | null) => void;
  addNode: (position: { x: number; y: number }, data?: { title?: string; description?: string }) => void;
  updateNode: (nodeId: string, updates: { title?: string; description?: string }) => void;
  setNodes: (nodes: Node[]) => void;
  getNode: (nodeId: string) => Node | undefined;
}

const GameStudioContext = createContext<GameStudioContextValue>({
  selectedNode: null,
  nodes: [],
  setSelectedNode: () => {},
  addNode: () => {},
  updateNode: () => {},
  setNodes: () => {},
  getNode: () => undefined,
});

export const useGameStudioContext = () => useContext(GameStudioContext);

export const GameStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState<GameNode | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  const addNode = useCallback((position: { x: number; y: number }, data?: { title?: string; description?: string }) => {
    const newNodeId = `action-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'gameAction',
      position,
      data: {
        label: data?.title || 'Action',
        gameType: data?.description || '',
        title: data?.title || 'Action',
        description: data?.description || '',
      },
    };

    setNodes((prevNodes) => {
      // Check if node already exists
      if (prevNodes.find(n => n.id === newNodeId)) {
        return prevNodes;
      }
      return [...prevNodes, newNode];
    });
  }, []);

  const updateNode = useCallback((nodeId: string, updates: { title?: string; description?: string }) => {
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
          };
        }
        return node;
      })
    );

    // Update selected node if it's the one being updated
    if (selectedNode?.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        title: updates.title || selectedNode.title,
        description: updates.description || selectedNode.description,
      });
    }
  }, [selectedNode]);

  const getNode = useCallback((nodeId: string) => {
    return nodes.find((node) => node.id === nodeId);
  }, [nodes]);

  const value: GameStudioContextValue = {
    selectedNode,
    nodes,
    setSelectedNode,
    addNode,
    updateNode,
    setNodes,
    getNode,
  };

  return (
    <GameStudioContext.Provider value={value}>
      {children}
    </GameStudioContext.Provider>
  );
};

