import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, SelectionMode } from '@xyflow/react';
import type { Node, Edge, Connection, ReactFlowInstance, NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings, Play } from 'lucide-react';
import { toast } from 'sonner';
import GameStartNode from './GameStartNode';
import GameEndNode from './GameEndNode';
import GameParagraphNode from './GameParagraphNode';
import GameImageTermsNode from './GameImageTermsNode';
import GameImagePinNode from './GameImagePinNode';
import GameIfElseNode from './GameIfElseNode';
import StartGameDialog from './StartGameDialog';
import GameNodeDialog from './GameNodeDialog';
import GameSidebar from './GameSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useGameStudioContext } from '@/contexts/game-studio';
import AppWrapper from '@/components/layout/AppWrapper';

const nodeTypes = {
  gameStart: GameStartNode,
  gameEnd: GameEndNode,
  gameParagraph: GameParagraphNode,
  gameImageTerms: GameImageTermsNode,
  gameImagePin: GameImagePinNode,
  gameIfElse: GameIfElseNode,
};

const initialNodes: Node[] = [
  { 
    id: 'start-1', 
    type: 'gameStart',
    position: { x: 0, y: 0 }, 
    data: { label: 'Start' } 
  },
];
const initialEdges: Edge[] = [];

// History state type
type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

export default function GameEditorCanvas() {
  const { nodes: contextNodes, setNodes: setContextNodes, addNode: addContextNode } = useGameStudioContext();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isGameNodeDialogOpen, setIsGameNodeDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState<string>('General');
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('select');
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Undo/Redo history
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save state to history
  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push({ 
        nodes: JSON.parse(JSON.stringify(newNodes)), 
        edges: JSON.parse(JSON.stringify(newEdges)) 
      });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, 49));
  }, [historyIndex]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      toast.success('Undone');
    } else {
      toast.info('Nothing to undo');
    }
  }, [history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      toast.success('Redone');
    } else {
      toast.info('Nothing to redo');
    }
  }, [history, historyIndex]);

  // Check node constraints
  const checkNodeConstraints = useCallback((newNodes: Node[]): { valid: boolean; reason?: string } => {
    const startNodes = newNodes.filter(n => n.type === 'gameStart');
    const endNodes = newNodes.filter(n => n.type === 'gameEnd');

    if (startNodes.length > 1) {
      return { valid: false, reason: 'Only one Start node is allowed' };
    }
    if (endNodes.length > 1) {
      return { valid: false, reason: 'Only one End node is allowed' };
    }

    return { valid: true };
  }, []);

  // Connection validation
  const canConnect = useCallback((sourceNode: Node | undefined, targetNode: Node | undefined): { can: boolean; reason?: string } => {
    if (!sourceNode || !targetNode) {
      return { can: false, reason: 'Invalid nodes' };
    }

    // Start node can connect to any node except end node
    if (sourceNode.type === 'gameStart') {
      if (targetNode.type === 'gameEnd') {
        return { can: false, reason: 'Cannot connect Start node to End node' };
      }
      // Start node can only have one outgoing connection
      const startOutgoingEdges = edges.filter(e => e.source === sourceNode.id);
      if (startOutgoingEdges.length >= 1) {
        return { can: false, reason: 'Start node can only have one outgoing connection' };
      }
      // Allow connection to any other node type
      return { can: true };
    }

    // End node can only have one incoming connection
    if (targetNode.type === 'gameEnd') {
      const endIncomingEdges = edges.filter(e => e.target === targetNode.id);
      if (endIncomingEdges.length >= 1) {
        return { can: false, reason: 'End node can only have one incoming connection' };
      }
    }

    // Regular chainable nodes (End, Paragraph, ImageTerms, ImagePin) can only have 1:1 connections
    const chainableTypes = ['gameEnd', 'gameParagraph', 'gameImageTerms', 'gameImagePin'];
    if (chainableTypes.includes(targetNode.type || '')) {
      const targetIncomingEdges = edges.filter(e => e.target === targetNode.id);
      if (targetIncomingEdges.length >= 1) {
        return { can: false, reason: 'This node can only have one incoming connection' };
      }
    }

    if (chainableTypes.includes(sourceNode.type || '')) {
      const sourceOutgoingEdges = edges.filter(e => e.source === sourceNode.id);
      if (sourceOutgoingEdges.length >= 1) {
        return { can: false, reason: 'This node can only have one outgoing connection' };
      }
    }

    // If/Else node can have max 2 outgoing connections
    if (sourceNode.type === 'gameIfElse') {
      const ifElseOutgoingEdges = edges.filter(e => e.source === sourceNode.id);
      if (ifElseOutgoingEdges.length >= 2) {
        return { can: false, reason: 'If/Else node can only have two outgoing connections' };
      }
    }

    // If/Else node can only have one incoming connection
    if (targetNode.type === 'gameIfElse') {
      const ifElseIncomingEdges = edges.filter(e => e.target === targetNode.id);
      if (ifElseIncomingEdges.length >= 1) {
        return { can: false, reason: 'If/Else node can only have one incoming connection' };
      }
    }

    return { can: true };
  }, [edges]);

  // Listen for command bar actions
  useEffect(() => {
    const handleCommandAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      const actionId = customEvent.detail?.actionId;
      if (actionId === 'pan') {
        setInteractionMode('pan');
        toast.success('Pan mode activated');
      } else if (actionId === 'select') {
        setInteractionMode('select');
        toast.success('Select mode activated');
      } else if (actionId === 'undo') {
        handleUndo();
      } else if (actionId === 'redo') {
        handleRedo();
      }
    };

    window.addEventListener('command-action', handleCommandAction);
    return () => {
      window.removeEventListener('command-action', handleCommandAction);
    };
  }, [handleUndo, handleRedo]);

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
                  setSelectedNodeType(newNode.type || null);
                  setIsGameNodeDialogOpen(true);
                },
              },
            };
            
            updatedNodes.push(nodeWithHandlers);
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
    (changes: NodeChange[]) => {
      // Handle node deletion
      const deleteChanges = changes.filter(c => c.type === 'remove');
      for (const change of deleteChanges) {
        if (change.type === 'remove') {
          const nodeToDelete = nodes.find(n => n.id === change.id);
          if (nodeToDelete?.type === 'gameStart') {
            toast.error('Cannot delete Start node');
            return; // Prevent deletion
          }
          
          // Delete node and connected edges
          setNodes((prevNodes) => {
            const newNodes = prevNodes.filter(n => n.id !== change.id);
            const constraintCheck = checkNodeConstraints(newNodes);
            if (!constraintCheck.valid) {
              toast.error(constraintCheck.reason || 'Cannot delete this node');
              return prevNodes;
            }
            
            // Remove edges connected to deleted node
            setEdges((prevEdges) => {
              const newEdges = prevEdges.filter(
                e => e.source !== change.id && e.target !== change.id
              );
              saveToHistory(newNodes, newEdges);
              return newEdges;
            });
            
            saveToHistory(newNodes, edges);
            toast.success('Node deleted');
            setSelectedNodeId(null);
            return newNodes;
          });
          return; // Exit early after deletion
        }
      }

      // Handle node selection
      const selectChanges = changes.filter(c => c.type === 'select');
      for (const change of selectChanges) {
        if (change.type === 'select') {
          if (change.selected) {
            setSelectedNodeId(change.id);
          } else {
            setSelectedNodeId(null);
          }
        }
      }

      // Apply all changes (including position changes for dragging)
      setNodes((nodesSnapshot) => {
        const updatedNodes = applyNodeChanges(changes, nodesSnapshot);
        
        // Only check constraints for non-position changes
        const hasNonPositionChanges = changes.some(
          c => c.type !== 'position' && c.type !== 'dimensions' && c.type !== 'select'
        );
        
        if (hasNonPositionChanges) {
          const constraintCheck = checkNodeConstraints(updatedNodes);
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Node constraint violation');
            return nodesSnapshot; // Revert changes
          }
        }

        // Update node data with onClick handlers
        const nodesWithHandlers = updatedNodes.map((node) => {
          const baseData = node.data || {};

          if (node.type === 'gameStart' && !baseData.onClick) {
            return {
              ...node,
              data: {
                ...baseData,
                onClick: () => {
                  setSelectedNodeId(node.id);
                  setIsStartDialogOpen(true);
                },
              },
            };
          }
          if (['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameEnd', 'gameIfElse'].includes(node.type || '')) {
            if (!baseData.onClick) {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: () => {
                    setSelectedNodeId(node.id);
                    setSelectedNodeType(node.type || null);
                    setIsGameNodeDialogOpen(true);
                  },
                },
              };
            }
          }
          
          return node;
        });

        // Save to history only for significant changes (not just position updates)
        if (hasNonPositionChanges && JSON.stringify(nodesSnapshot) !== JSON.stringify(nodesWithHandlers)) {
          saveToHistory(nodesWithHandlers, edges);
        }

        return nodesWithHandlers;
      });
    },
    [nodes, edges, checkNodeConstraints, saveToHistory],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((edgesSnapshot) => {
        const updatedEdges = applyEdgeChanges(changes, edgesSnapshot);
        
        // Save to history if edges changed
        if (JSON.stringify(edgesSnapshot) !== JSON.stringify(updatedEdges)) {
          saveToHistory(nodes, updatedEdges);
        }
        
        return updatedEdges;
      });
    },
    [nodes, saveToHistory],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        toast.error('Invalid connection');
        return;
      }

      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      // Check connection constraints
      const connectionCheck = canConnect(sourceNode, targetNode);
      if (!connectionCheck.can) {
        toast.error(connectionCheck.reason || 'Connection not allowed');
        return;
      }

      // For If/Else node, need to specify which handle
      if (sourceNode?.type === 'gameIfElse') {
        const existingIfElseEdges = edges.filter(e => e.source === params.source);
        if (existingIfElseEdges.length >= 2) {
          toast.error('If/Else node can only have two outgoing connections');
          return;
        }
        
        // Use handle ID to distinguish between the two outputs
        const handleId = existingIfElseEdges.length === 0 ? 'right-top' : 'right-bottom';
        params.sourceHandle = handleId;
      }

      setEdges((prevEdges) => {
        const newEdges = addEdge({ ...params, id: `edge-${params.source}-${params.target}-${Date.now()}` }, prevEdges);
        saveToHistory(nodes, newEdges);
        toast.success('Connection created');
        return newEdges;
      });
    },
    [nodes, edges, canConnect, saveToHistory],
  );

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = containerRef.current?.getBoundingClientRect();
      if (!reactFlowInstance.current || !reactFlowBounds) return;

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      try {
        const nodeData = JSON.parse(data);
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Create new node
        const newNodeId = `${nodeData.nodeId}-${Date.now()}`;
        const newNode: Node = {
          id: newNodeId,
          type: nodeData.type,
          position,
          data: {
            label: nodeData.label,
            onClick: () => {
              setSelectedNodeId(newNodeId);
              setSelectedNodeType(nodeData.type);
              setIsGameNodeDialogOpen(true);
            },
          },
        };

        // Check constraints before adding
        setNodes((prevNodes) => {
          // Check if node already exists
          if (prevNodes.find((n) => n.id === newNodeId)) {
            return prevNodes;
          }
          
          const testNodes = [...prevNodes, newNode];
          const constraintCheck = checkNodeConstraints(testNodes);
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Cannot add this node');
            return prevNodes;
          }
          
          saveToHistory(testNodes, edges);
          toast.success('Node added');
          return testNodes;
        });
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    },
    [nodes, edges, checkNodeConstraints, saveToHistory],
  );

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && interactionMode === 'select') {
        event.preventDefault();
        const nodeToDelete = nodes.find(n => n.id === selectedNodeId);
        if (nodeToDelete?.type === 'gameStart') {
          toast.error('Cannot delete Start node');
          return;
        }

        setNodes((prevNodes) => {
          const newNodes = prevNodes.filter(n => n.id !== selectedNodeId);
          const constraintCheck = checkNodeConstraints(newNodes);
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Cannot delete this node');
            return prevNodes;
          }
          
          // Remove edges connected to deleted node
          setEdges((prevEdges) => {
            const newEdges = prevEdges.filter(
              e => e.source !== selectedNodeId && e.target !== selectedNodeId
            );
            saveToHistory(newNodes, newEdges);
            return newEdges;
          });
          
          saveToHistory(newNodes, edges);
          toast.success('Node deleted');
          setSelectedNodeId(null);
          return newNodes;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes, edges, interactionMode, checkNodeConstraints, saveToHistory]);

  // Handle clicking on empty canvas to add node (only in select mode)
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node if clicking on empty space (not on a node) and in select mode
      if (interactionMode !== 'select') return;
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
    [addContextNode, interactionMode],
  );

  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance as ReactFlowInstance;
    
    // Center view on start node after a short delay
    setTimeout(() => {
      if (instance) {
        const startNode = nodes.find(n => n.type === 'gameStart');
        if (startNode) {
          instance.fitView({ 
            padding: 0.5,
            includeHiddenNodes: false,
            nodes: [startNode],
            minZoom: 0.5,
            maxZoom: 2,
          });
        } else {
          instance.fitView({ padding: 0.3 });
        }
      }
    }, 300);
  }, [nodes]);

  const handleStartSave = (data: { title: string; description: string; rounds: string }) => {
    console.log('Saved game data:', data);
    if (data.title) {
      setGameTitle(data.title);
    }
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

  // Sync contentEditable element with gameTitle state
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== gameTitle) {
      titleRef.current.textContent = gameTitle;
    }
  }, [gameTitle]);

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
    // Skip if onClick already exists
    if ((node.data as any).onClick) {
      return node;
    }

    // Add onClick handlers based on node type
    if (node.type === 'gameStart') {
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
    
    // All other node types open game node dialog
    if (['gameAction', 'gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameEnd', 'gameIfElse'].includes(node.type || '')) {
      return {
        ...node,
        data: {
          ...node.data,
          onClick: () => {
            setSelectedNodeId(node.id);
            setSelectedNodeType(node.type || null);
            setIsGameNodeDialogOpen(true);
          },
        },
      };
    }
    
    return node;
  });
 
  return (
    <AppWrapper 
      role="teacher" 
      commandPaletteRole="game-studio"
      className="flex flex-col h-screen"
    >
      <div className="flex-1 w-full relative">
        <GameSidebar />
        <div 
          ref={containerRef}
          className='w-full h-full rounded-4xl bg-gray-100 overflow-hidden relative'
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* Top Center Badge */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm cursor-text"
              asChild
            >
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newTitle = e.currentTarget.textContent?.trim() || 'General';
                  setGameTitle(newTitle);
                  if (newTitle === '') {
                    e.currentTarget.textContent = 'General';
                    setGameTitle('General');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                className="outline-none focus:ring-2 focus:ring-ring rounded-full"
              >
                {gameTitle}
              </div>
            </Badge>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsDrawerOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewDrawerOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => setIsPublishDrawerOpen(true)}>
              Publish
            </Button>
          </div>

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
              fitView={false}
              style={{ width: '100%', height: '100%' }}
              nodesDraggable={interactionMode === 'select'}
              nodesConnectable={interactionMode === 'select'}
              elementsSelectable={interactionMode === 'select'}
              panOnDrag={interactionMode === 'pan'}
              panOnScroll={interactionMode === 'pan'}
              selectionOnDrag={interactionMode === 'select'}
              selectionMode={SelectionMode.Full}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { strokeWidth: 2, stroke: '#374151' },
              }}
            />
          )}
        </div>
      </div>

      {/* Settings Drawer */}
      <Drawer open={isSettingsDrawerOpen} onOpenChange={setIsSettingsDrawerOpen} direction="right">
        <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {/* Empty content for now */}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Preview Drawer */}
      <Drawer open={isPreviewDrawerOpen} onOpenChange={setIsPreviewDrawerOpen} direction="right">
        <DrawerContent className="!w-[50vw] !max-w-none !h-[100vh]">
          <DrawerHeader>
            <DrawerTitle>Preview</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {/* Empty content for now */}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Publish Drawer */}
      <Drawer open={isPublishDrawerOpen} onOpenChange={setIsPublishDrawerOpen} direction="right">
        <DrawerContent className="!w-[50vw] !max-w-none">
          <DrawerHeader>
            <DrawerTitle>Publish</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {/* Empty content for now */}
          </div>
        </DrawerContent>
      </Drawer>

      <StartGameDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onSave={handleStartSave}
      />
      <GameNodeDialog
        open={isGameNodeDialogOpen}
        onOpenChange={setIsGameNodeDialogOpen}
        nodeId={selectedNodeId || undefined}
        nodeType={selectedNodeType || undefined}
      />
    </AppWrapper>
  );
}
