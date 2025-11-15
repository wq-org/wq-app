import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { Node, Edge, Connection, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GameStartNode from './GameStartNode';
import GameActionNode from './GameActionNode';
import StartGameDialog from './StartGameDialog';
import ActionGameDialog from './ActionGameDialog';
import { useGameStudioContext } from '@/contexts/GameStudioContext';

const nodeTypes = {
  gameStart: GameStartNode,
  gameAction: GameActionNode,
};

const initialNodes: Node[] = [
  { 
    id: 'start-1', 
    type: 'gameStart',
    position: { x: 100, y: 100 }, 
    data: { label: 'Start' } 
  },
];
const initialEdges: Edge[] = [];
 
export default function GameEditorCanvas() {
  const { nodes: contextNodes, setNodes: setContextNodes, addNode: addContextNode } = useGameStudioContext();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Sync context nodes with React Flow nodes
  useEffect(() => {
    if (contextNodes.length > 0) {
      // Merge context nodes with existing nodes, avoiding duplicates
      setNodes((prevNodes) => {
        const existingIds = new Set(prevNodes.map(n => n.id));
        const newNodes = contextNodes.filter(n => !existingIds.has(n.id));
        
        if (newNodes.length > 0) {
          const lastNode = prevNodes[prevNodes.length - 1];
          const updatedNodes = [...prevNodes];
          
          newNodes.forEach((newNode) => {
            // Calculate position for new node (below the last node)
            const position = lastNode 
              ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
              : newNode.position || { x: 100, y: 100 };
            
            const nodeWithHandlers: Node = {
              ...newNode,
              position,
              data: {
                ...newNode.data,
                onClick: () => {
                  setSelectedNodeId(newNode.id);
                  setIsActionDialogOpen(true);
                },
              },
            };
            
            updatedNodes.push(nodeWithHandlers);
            
            // Auto-connect to the last node linearly
            if (lastNode) {
              const newEdge: Edge = {
                id: `edge-${lastNode.id}-${newNode.id}`,
                source: lastNode.id,
                target: newNode.id,
                type: 'smoothstep',
              };
              setEdges((prevEdges) => [...prevEdges, newEdge]);
            }
          });
          
          return updatedNodes;
        }
        
        return prevNodes;
      });
    }
  }, [contextNodes]);

  // Sync React Flow nodes back to context when they change
  // Use a ref to prevent infinite loops
  const isSyncingRef = useRef(false);
  const setContextNodesRef = useRef(setContextNodes);
  
  // Keep ref updated
  useEffect(() => {
    setContextNodesRef.current = setContextNodes;
  }, [setContextNodes]);

  useEffect(() => {
    if (!isSyncingRef.current && nodes.length > 0) {
      isSyncingRef.current = true;
      setContextNodesRef.current(nodes);
      // Reset flag after a short delay
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, [nodes]);

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nodesSnapshot) => {
        const updatedNodes = applyNodeChanges(changes, nodesSnapshot);
        // Update node data with onClick handlers
        return updatedNodes.map((node) => {
          if (node.type === 'gameStart' && !(node.data as any).onClick) {
            return {
              ...node,
              data: {
                ...node.data,
                onClick: () => {
                  setSelectedNodeId(node.id);
                  setIsStartDialogOpen(true);
                },
              },
            };
          }
          if (node.type === 'gameAction' && !(node.data as any).onClick) {
            return {
              ...node,
              data: {
                ...node.data,
                onClick: () => {
                  setSelectedNodeId(node.id);
                  setIsActionDialogOpen(true);
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

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Only allow linear connections (one source, one target)
      const existingTargetEdge = edges.find((e) => e.target === params.target);
      if (existingTargetEdge) {
        // Replace existing edge
        setEdges((prevEdges) => {
          const filtered = prevEdges.filter((e) => e.target !== params.target);
          return [...filtered, { ...params, id: `edge-${params.source}-${params.target}` }];
        });
      } else {
        setEdges((prevEdges) => addEdge(params, prevEdges));
      }
    },
    [edges],
  );

  // Handle clicking on empty canvas to add node
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node if clicking on empty space (not on a node)
      if ((event.target as HTMLElement).closest('.react-flow__node')) {
        return;
      }
      
      // Use React Flow's screenToFlowPosition to convert screen coordinates to flow coordinates
      if (reactFlowInstance.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addContextNode(position);
      }
    },
    [addContextNode],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleStartSave = (data: { title: string; description: string; rounds: string }) => {
    console.log('Saved game data:', data);
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

  // Measure container dimensions for React Flow
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize nodes with onClick handlers
  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === 'gameStart' && !(node.data as any).onClick) {
      return {
        ...node,
        data: {
          ...node.data,
          onClick: () => {
            setSelectedNodeId(node.id);
            setIsStartDialogOpen(true);
          },
        },
      };
    }
    if (node.type === 'gameAction' && !(node.data as any).onClick) {
      return {
        ...node,
        data: {
          ...node.data,
          onClick: () => {
            setSelectedNodeId(node.id);
            setIsActionDialogOpen(true);
          },
        },
      };
    }
    return node;
  });
 
  return (
    <>
      <div 
        ref={containerRef}
        className='w-full rounded-4xl bg-gray-100 overflow-hidden' 
        style={{ width: '100%', height: '100vh', minHeight: '600px' }}
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            onInit={onInit}
            fitView
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
      <StartGameDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onSave={handleStartSave}
      />
      <ActionGameDialog
        open={isActionDialogOpen}
        onOpenChange={setIsActionDialogOpen}
        nodeId={selectedNodeId || undefined}
      />
    </>
  );
}
