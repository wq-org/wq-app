import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import IfElseGameDialog from './IfElseGameDialog';
import EndGameDialog from './EndGameDialog';
import GameSidebar from './GameSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStudioContext } from '@/contexts/game-studio';
import AppWrapper from '@/components/layout/AppWrapper';
import SettingsDrawer from './SettingsDrawer';
import PreviewDrawer from './PreviewDrawer';
import PublishDrawer from './PublishDrawer';
import { MAX_END_NODE_INCOMING_CONNECTIONS } from '@/lib/constants';

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

export default function GameEditorCanvas() {
  // ========== Context & State Management ==========
  const { nodes: contextNodes, setNodes: setContextNodes, setEdges: setContextEdges, addNode: addContextNode } = useGameStudioContext();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  
  // ========== UI State ==========
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isGameNodeDialogOpen, setIsGameNodeDialogOpen] = useState(false);
  const [isIfElseDialogOpen, setIsIfElseDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState<string>('General');
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('select');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // ========== Refs ==========
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isDroppingRef = useRef(false); // Prevent duplicate drop notifications
  const isSyncingRef = useRef(false);
  const setContextNodesRef = useRef(setContextNodes);
  const setContextEdgesRef = useRef(setContextEdges);

  // ========== Validation Functions ==========
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


  // ========== Event Handlers ==========
  // Create node click handlers - memoized to prevent recreation
  const createNodeClickHandler = useCallback((nodeId: string, nodeType: string | null) => {
    if (nodeType === 'gameStart') {
      return () => {
        setSelectedNodeId(nodeId);
        setIsStartDialogOpen(true);
      };
    }
    if (nodeType === 'gameIfElse') {
      return () => {
        setSelectedNodeId(nodeId);
        setIsIfElseDialogOpen(true);
      };
    }
    if (nodeType === 'gameEnd') {
      return () => {
        // Find the End node directly since there can only be one
        const endNode = nodes.find((n) => n.type === 'gameEnd');
        if (endNode) {
          setSelectedNodeId(endNode.id);
        }
        setIsEndDialogOpen(true);
      };
    }
    return () => {
      setSelectedNodeId(nodeId);
      setSelectedNodeType(nodeType);
      setIsGameNodeDialogOpen(true);
    };
  }, []);

  // ========== Effects ==========
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
      }
    };

    window.addEventListener('command-action', handleCommandAction);
    return () => {
      window.removeEventListener('command-action', handleCommandAction);
    };
  }, []);

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
            
            // Create appropriate click handler based on node type
            let onClickHandler: () => void;
            if (newNode.type === 'gameStart') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id);
                setIsStartDialogOpen(true);
              };
            } else if (newNode.type === 'gameIfElse') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id);
                setIsIfElseDialogOpen(true);
              };
            } else if (newNode.type === 'gameEnd') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id);
                setIsEndDialogOpen(true);
              };
            } else {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id);
                setSelectedNodeType(newNode.type || null);
                setIsGameNodeDialogOpen(true);
              };
            }

            const nodeWithHandlers: Node = {
              ...newNode,
              position,
              data: {
                ...newNode.data,
                onClick: onClickHandler,
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

  // Keep refs updated
  useEffect(() => {
    setContextNodesRef.current = setContextNodes;
    setContextEdgesRef.current = setContextEdges;
  }, [setContextNodes, setContextEdges]);

  // Sync React Flow nodes and edges back to context when they change
  useEffect(() => {
    if (!isSyncingRef.current && nodes.length > 0) {
      isSyncingRef.current = true;
      setContextNodesRef.current(nodes);
      setContextEdgesRef.current(edges);
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, [nodes, edges]);

  // ========== React Flow Handlers ==========
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Handle node deletion - prevent deletion through React Flow UI, only allow via Settings button
      const deleteChanges = changes.filter(c => c.type === 'remove');
      for (const change of deleteChanges) {
        if (change.type === 'remove') {
          const nodeToDelete = nodes.find(n => n.id === change.id);
          if (!nodeToDelete) return;
          
          // Prevent deletion of Start node
          if (nodeToDelete.type === 'gameStart') {
            toast.error('Cannot delete Start node');
            return; // Prevent deletion
          }
          
          // Prevent deletion of nodes that should only be deleted via Settings button
          const deletableOnlyViaButton = ['gameEnd', 'gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'];
          if (nodeToDelete.type && deletableOnlyViaButton.includes(nodeToDelete.type)) {
            toast.error('Please use the Delete button in the Settings tab to delete this node');
            return; // Prevent deletion
          }
          
          // For any other node types, allow deletion (though there shouldn't be any)
          setNodes((prevNodes) => {
            const newNodes = prevNodes.filter(n => n.id !== change.id);
            const constraintCheck = checkNodeConstraints(newNodes);
            if (!constraintCheck.valid) {
              toast.error(constraintCheck.reason || 'Cannot delete this node');
              return prevNodes;
            }
            
            // Remove edges connected to deleted node
            setEdges((prevEdges) =>
              prevEdges.filter(
                e => e.source !== change.id && e.target !== change.id
              )
            );
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

        // Update node data with onClick handlers - use memoized handler creator
        const nodesWithHandlers = updatedNodes.map((node) => {
          const baseData = node.data || {};

          if (!baseData.onClick) {
            if (node.type === 'gameStart') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameStart'),
                },
              };
            }
            if (node.type === 'gameIfElse') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameIfElse'),
                },
              };
            }
            if (node.type === 'gameEnd') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameEnd'),
                },
              };
            }
            if (['gameParagraph', 'gameImageTerms', 'gameImagePin'].includes(node.type || '')) {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, node.type || null),
                },
              };
            }
          }
          
          return node;
        });

        return nodesWithHandlers;
      });
    },
    [nodes, edges, checkNodeConstraints, createNodeClickHandler],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((edgesSnapshot) => {
        return applyEdgeChanges(changes, edgesSnapshot);
      });
    },
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        toast.error('Invalid connection');
        return;
      }

      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        toast.error('Invalid nodes');
        return;
      }

      // Prevent Start to End direct connection
      if (sourceNode.type === 'gameStart' && targetNode.type === 'gameEnd') {
        toast.error('Cannot connect Start node to End node');
        return;
      }

      // Prevent End node from connecting to Start node
      if (sourceNode.type === 'gameEnd' && targetNode.type === 'gameStart') {
        toast.error('Cannot connect End node to Start node');
        return;
      }

      // Prevent End node from connecting to End node
      if (sourceNode.type === 'gameEnd' && targetNode.type === 'gameEnd') {
        toast.error('Cannot connect End node to End node');
        return;
      }

      setEdges((prevEdges) => {
        let updatedEdges = [...prevEdges];

        // For nodes that can only have one outgoing connection, remove old outgoing edges
        const singleOutgoingTypes = ['gameStart', 'gameParagraph', 'gameImageTerms', 'gameImagePin'];
        if (singleOutgoingTypes.includes(sourceNode.type || '')) {
          updatedEdges = updatedEdges.filter(e => e.source !== params.source);
        }

        // For If/Else node, handle the two outputs
        if (sourceNode.type === 'gameIfElse') {
          const existingIfElseEdges = updatedEdges.filter(e => e.source === params.source);
          if (existingIfElseEdges.length >= 2) {
            // If connecting to same target, replace that specific edge
            const existingToSameTarget = existingIfElseEdges.find(e => e.target === params.target);
            if (existingToSameTarget) {
              updatedEdges = updatedEdges.filter(e => e.id !== existingToSameTarget.id);
            } else {
              // If both handles are used, replace the first one
              updatedEdges = updatedEdges.filter(e => e.id !== existingIfElseEdges[0].id);
            }
          }
          
          // Use handle ID to distinguish between the two outputs
          const remainingIfElseEdges = updatedEdges.filter(e => e.source === params.source);
          const handleId = remainingIfElseEdges.length === 0 ? 'right-top' : 'right-bottom';
          params.sourceHandle = handleId;
        }

        // For nodes that can only have one incoming connection (except End which can have up to 10)
        const singleIncomingTypes = ['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'];
        if (singleIncomingTypes.includes(targetNode.type || '')) {
          updatedEdges = updatedEdges.filter(e => e.target !== params.target);
        }

        // For End node, check if we're at the limit
        if (targetNode.type === 'gameEnd') {
          const endIncomingEdges = updatedEdges.filter(e => e.target === params.target);
          if (endIncomingEdges.length >= MAX_END_NODE_INCOMING_CONNECTIONS) {
            toast.error(`End node can only have up to ${MAX_END_NODE_INCOMING_CONNECTIONS} incoming connections`);
            return prevEdges;
          }
        }

        // Add the new edge
        const newEdges = addEdge(
          { 
            ...params,
            source: params.source!,
            target: params.target!,
          }, 
          updatedEdges
        );
        toast.success('Connection updated');
        return newEdges;
      });
    },
    [nodes, edges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Prevent duplicate drops
      if (isDroppingRef.current) return;
      isDroppingRef.current = true;

      const reactFlowBounds = containerRef.current?.getBoundingClientRect();
      if (!reactFlowInstance.current || !reactFlowBounds) {
        isDroppingRef.current = false;
        return;
      }

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) {
        isDroppingRef.current = false;
        return;
      }

      try {
        const nodeData = JSON.parse(data);
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNodeId = `${nodeData.nodeId}-${Date.now()}`;
        
        // Create appropriate click handler based on node type
        let onClickHandler: () => void;
        if (nodeData.type === 'gameStart') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId);
            setIsStartDialogOpen(true);
          };
        } else if (nodeData.type === 'gameIfElse') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId);
            setIsIfElseDialogOpen(true);
          };
        } else if (nodeData.type === 'gameEnd') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId);
            setIsEndDialogOpen(true);
          };
        } else {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId);
            setSelectedNodeType(nodeData.type);
            setIsGameNodeDialogOpen(true);
          };
        }
        
        const newNode: Node = {
          id: newNodeId,
          type: nodeData.type,
          position,
          data: {
            label: nodeData.label,
            onClick: onClickHandler,
          },
        };

        // Check constraints and add node
        setNodes((prevNodes) => {
          // Check if node already exists
          if (prevNodes.find((n) => n.id === newNodeId)) {
            isDroppingRef.current = false;
            return prevNodes;
          }
          
          const testNodes = [...prevNodes, newNode];
          const constraintCheck = checkNodeConstraints(testNodes);
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Cannot add this node');
            isDroppingRef.current = false;
            return prevNodes;
          }
          
          // Reset flag after a short delay to allow state updates
          setTimeout(() => {
            isDroppingRef.current = false;
          }, 100);
          
          toast.success('Node added');
          return testNodes;
        });
      } catch (error) {
        console.error('Error parsing drop data:', error);
        isDroppingRef.current = false;
      }
    },
    [checkNodeConstraints],
  );


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

  const handleStartSave = (data: { title: string; description: string }) => {
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
      toast.success('Node saved');
    }
  };

  const handleIfElseSave = (data: { title: string; description: string; condition?: string; correctPath?: 'A' | 'B' }) => {
    if (selectedNodeId) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNodeId
            ? { ...node, data: { ...node.data, label: data.title, ...data } }
            : node
        )
      );
    }
  };

  const handleGameNodeSave = (data: {
    points?: number;
    paragraphGameData?: unknown;
    imageTermGameData?: unknown;
    imagePinGameData?: unknown;
  }) => {
    if (selectedNodeId) {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id !== selectedNodeId) return node;
          const nextData = { ...node.data, points: data.points };
          if (data.paragraphGameData != null && typeof data.paragraphGameData === 'object') {
            Object.assign(nextData, data.paragraphGameData);
          }
          if (data.imageTermGameData != null && typeof data.imageTermGameData === 'object') {
            Object.assign(nextData, data.imageTermGameData);
          }
          if (data.imagePinGameData != null && typeof data.imagePinGameData === 'object') {
            Object.assign(nextData, data.imagePinGameData);
          }
          return { ...node, data: nextData };
        })
      );
      toast.success('Node saved');
    }
  };

  const handleEndSave = (data: { title: string; description: string }) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.type === 'gameEnd'
          ? { ...node, data: { ...node.data, label: data.title, ...data } }
          : node
      )
    );
    toast.success('Node saved');
  };

  const handleEndDelete = () => {
    if (selectedNodeId) {
      setNodes((prevNodes) => {
        const nodeToDelete = prevNodes.find((n) => n.id === selectedNodeId);
        if (!nodeToDelete) return prevNodes;
        
        const newNodes = prevNodes.filter((n) => n.id !== selectedNodeId);
        
        // Remove edges connected to deleted node
        setEdges((prevEdges) =>
          prevEdges.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          )
        );
        toast.success('End node deleted');
        return newNodes;
      });
      setIsEndDialogOpen(false);
    }
  };

  const handleIfElseDelete = () => {
    if (selectedNodeId) {
      setNodes((prevNodes) => {
        const nodeToDelete = prevNodes.find((n) => n.id === selectedNodeId);
        if (!nodeToDelete) return prevNodes;

        const newNodes = prevNodes.filter((n) => n.id !== selectedNodeId);

        // Remove edges connected to deleted node
        setEdges((prevEdges) =>
          prevEdges.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          )
        );
        toast.success('If/Else node deleted');
        return newNodes;
      });
      setIsIfElseDialogOpen(false);
    }
  };

  const handleGameNodeDelete = () => {
    if (selectedNodeId) {
      setNodes((prevNodes) => {
        const nodeToDelete = prevNodes.find((n) => n.id === selectedNodeId);
        if (!nodeToDelete) return prevNodes;

        const newNodes = prevNodes.filter((n) => n.id !== selectedNodeId);

        setEdges((prevEdges) =>
          prevEdges.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          )
        );
        toast.success('Game node deleted');
        return newNodes;
      });
      setIsGameNodeDialogOpen(false);
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

  // Initialize nodes with onClick handlers - memoized
  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => {
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
            onClick: createNodeClickHandler(node.id, 'gameStart'),
          },
        };
      }
      
      if (node.type === 'gameIfElse') {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, 'gameIfElse'),
          },
        };
      }
      
      if (node.type === 'gameEnd') {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, 'gameEnd'),
          },
        };
      }
      
      // All other node types open game node dialog
      if (['gameParagraph', 'gameImageTerms', 'gameImagePin'].includes(node.type || '')) {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, node.type || null),
          },
        };
      }
      
      return node;
    });
  }, [nodes, createNodeClickHandler]);
 
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
              className="px-4 py-2 text-sm cursor-text bg-white"
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
      <SettingsDrawer
        open={isSettingsDrawerOpen}
        onOpenChange={setIsSettingsDrawerOpen}
      />
      <PreviewDrawer
        open={isPreviewDrawerOpen}
        onOpenChange={setIsPreviewDrawerOpen}
      />
      <PublishDrawer
        open={isPublishDrawerOpen}
        onOpenChange={setIsPublishDrawerOpen}
        nodes={nodes}
        gameTitle={gameTitle}
      />
      <StartGameDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onSave={handleStartSave}
        nodeId={nodes.find((n) => n.type === 'gameStart')?.id}
      />
      <IfElseGameDialog
        open={isIfElseDialogOpen}
        onOpenChange={setIsIfElseDialogOpen}
        onSave={handleIfElseSave}
        initialData={
          selectedNodeId
            ? nodes.find((n) => n.id === selectedNodeId)?.data as {
                title?: string;
                description?: string;
                condition?: string;
                correctPath?: 'A' | 'B';
              } | undefined
            : undefined
        }
        nodeId={selectedNodeId || undefined}
        onDelete={handleIfElseDelete}
        nodes={nodes}
        edges={edges}
      />
      <EndGameDialog
        open={isEndDialogOpen}
        onOpenChange={setIsEndDialogOpen}
        onSave={handleEndSave}
        nodeId={selectedNodeId || undefined}
        initialData={
          selectedNodeId
            ? nodes.find((n) => n.id === selectedNodeId)?.data as {
                title?: string;
                description?: string;
              } | undefined
            : undefined
        }
        onDelete={handleEndDelete}
      />
      <GameNodeDialog
        open={isGameNodeDialogOpen}
        onOpenChange={setIsGameNodeDialogOpen}
        nodeType={selectedNodeType || undefined}
        nodeId={selectedNodeId || undefined}
        initialData={
          selectedNodeId
            ? nodes.find((n) => n.id === selectedNodeId)?.data
            : undefined
        }
        onSave={handleGameNodeSave}
        onDelete={handleGameNodeDelete}
      />
    </AppWrapper>
  );
}
