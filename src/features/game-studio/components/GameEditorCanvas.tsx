import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GameStartNode from './GameStartNode';
import StartGameDialog from './StartGameDialog';

const nodeTypes = {
  gameStart: GameStartNode,
};

const initialNodes = [
  { 
    id: 'start-1', 
    type: 'gameStart',
    position: { x: 100, y: 100 }, 
    data: { label: 'Start' } 
  },
];
const initialEdges: any[] = [];
 
export default function GameEditorCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
 
  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nodesSnapshot) => {
        const updatedNodes = applyNodeChanges(changes, nodesSnapshot);
        // Update node data with onClick handler
        return updatedNodes.map((node) => {
          if (node.type === 'gameStart') {
            return {
              ...node,
              data: {
                ...node.data,
                onClick: () => {
                  setSelectedNodeId(node.id);
                  setIsDialogOpen(true);
                },
              },
            };
          }
          return node;
        });
      });
    },
    [],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleSave = (data: { title: string; description: string; rounds: string }) => {
    console.log('Saved game data:', data);
    // Update the node with the saved data
    if (selectedNodeId) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    }
  };

  // Initialize nodes with onClick handlers
  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === 'gameStart' && !(node.data as any).onClick) {
      return {
        ...node,
        data: {
          ...node.data,
          onClick: () => {
            setSelectedNodeId(node.id);
            setIsDialogOpen(true);
          },
        },
      };
    }
    return node;
  });
 
  return (
    <>
      <div className='w-full h-full bg-gray-100 border-2 p-4 flex items-center justify-center overflow-auto' style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        />
      </div>
      <StartGameDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}