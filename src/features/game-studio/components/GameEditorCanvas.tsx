import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@/components/ui/text'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  SelectionMode,
} from '@xyflow/react'
import type {
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Settings2, Play, DoorOpen, EllipsisVertical, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { GameStartNode } from './GameStartNode'
import { GameEndNode } from './GameEndNode'
import { GameParagraphNode } from './GameParagraphNode'
import { GameImageTermsNode } from './GameImageTermsNode'
import { GameImagePinNode } from './GameImagePinNode'
import { GameIfElseNode } from './GameIfElseNode'
import { StartGameDialog } from './StartGameDialog'
import { GameNodeDialog } from './GameNodeDialog'
import { IfElseGameDialog } from './IfElseGameDialog'
import { EndGameDialog } from './EndGameDialog'
import { GameSidebar } from './GameSidebar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGameStudioContext } from '@/contexts/game-studio'
import { GameSettingsDrawer } from './GameSettingsDrawer'
import { GamePreviewDrawer } from './GamePreviewDrawer'
import { GamePublishDrawer } from './GamePublishDrawer'
import { MAX_END_NODE_INCOMING_CONNECTIONS } from '../constants'
import type { GameNodeData } from '../types/game-studio.types'
import { useUser } from '@/contexts/user'
import {
  getGameForStudio,
  updateGameForStudio,
  publishGame,
  unpublishGame,
} from '../api/gameStudioApi'
import { serializeFlowGameConfig } from '../utils/gameConfigSerialization'
import { uploadFile } from '@/components/shared'
import { deleteFile } from '@/features/files'
import { deleteGame } from '@/features/command-palette'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import type { ThemeId } from '@/lib/themes'
import { DEFAULT_PARAGRAPH } from '@/features/games/paragraph-line-select'

const nodeTypes = {
  gameStart: GameStartNode,
  gameEnd: GameEndNode,
  gameParagraph: GameParagraphNode,
  gameImageTerms: GameImageTermsNode,
  gameImagePin: GameImagePinNode,
  gameIfElse: GameIfElseNode,
}

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'gameStart',
    position: { x: 0, y: 0 },
    data: { label: 'Start' },
  },
]
const initialEdges: Edge[] = []

export interface GameEditorCanvasProps {
  projectId?: string
}

export function GameEditorCanvas({ projectId }: GameEditorCanvasProps) {
  const { t } = useTranslation('features.gameStudio')
  const fallbackTitle = t('editorCanvas.defaultTitle')
  // ========== Context & State Management ==========
  const {
    nodes: contextNodes,
    setNodes: setContextNodes,
    setEdges: setContextEdges,
    addNode: addContextNode,
  } = useGameStudioContext()
  const { getUserId, getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    projectId ? 'loading' : 'idle',
  )

  // ========== UI State ==========
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [isGameNodeDialogOpen, setIsGameNodeDialogOpen] = useState(false)
  const [isIfElseDialogOpen, setIsIfElseDialogOpen] = useState(false)
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const [gameTitle, setGameTitle] = useState<string>(fallbackTitle)
  const [gameThemeId, setGameThemeId] = useState<ThemeId>('blue')
  const [projectVersion, setProjectVersion] = useState<number>(1)
  const [isPublished, setIsPublished] = useState(false)
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false)
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false)
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false)
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('select')
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // ========== Refs ==========
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDroppingRef = useRef(false) // Prevent duplicate drop notifications
  const isSyncingRef = useRef(false)
  const setContextNodesRef = useRef(setContextNodes)
  const setContextEdgesRef = useRef(setContextEdges)
  const pendingEndSavePersistRef = useRef(false)

  // ========== Load project when projectId is set ==========
  useEffect(() => {
    if (!projectId) {
      setLoadState('idle')
      setGameThemeId('blue')
      return
    }
    setLoadState('loading')
    getGameForStudio(projectId)
      .then((game) => {
        if (game) {
          setIsPublished(game.status === 'published')
        }
        if (!game?.game_config?.nodes?.length) {
          setLoadState('loaded')
          return
        }
        const config = game.game_config
        const loadedNodes: Node[] = config.nodes.map((n) => ({
          id: n.id,
          type: n.type ?? 'default',
          position: n.position ?? { x: 0, y: 0 },
          data: { ...n.data },
        }))
        // Merge top-level game description into Start node when node has none (e.g. old save or Settings-only edit)
        const gameDescription = game.description?.trim()
        if (gameDescription) {
          const startNode = loadedNodes.find((n) => n.type === 'gameStart')
          if (startNode) {
            const desc = (startNode.data as Record<string, unknown>)?.description
            if (desc == null || String(desc).trim() === '') {
              startNode.data = { ...startNode.data, description: gameDescription } as Record<
                string,
                unknown
              >
            }
          }
        }
        const loadedEdges: Edge[] = (config.edges ?? []).map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? undefined,
        }))
        setNodes(loadedNodes)
        setEdges(loadedEdges)
        setGameTitle(game.title || fallbackTitle)
        setGameThemeId(game.theme_id || 'blue')
        setProjectVersion(game.version ?? 1)
        setLoadState('loaded')
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load project')
        setLoadState('error')
      })
  }, [projectId, fallbackTitle, t])

  // ========== Validation Functions ==========
  const checkNodeConstraints = useCallback(
    (newNodes: Node[]): { valid: boolean; reason?: string } => {
      const startNodes = newNodes.filter((n) => n.type === 'gameStart')
      const endNodes = newNodes.filter((n) => n.type === 'gameEnd')

      if (startNodes.length > 1) {
        return { valid: false, reason: 'Only one Start node is allowed' }
      }
      if (endNodes.length > 1) {
        return { valid: false, reason: 'Only one End node is allowed' }
      }

      return { valid: true }
    },
    [],
  )

  // ========== Event Handlers ==========
  // Create node click handlers - memoized to prevent recreation
  const createNodeClickHandler = useCallback(
    (nodeId: string, nodeType: string | null) => {
      if (nodeType === 'gameStart') {
        return () => {
          setSelectedNodeId(nodeId)
          setIsStartDialogOpen(true)
        }
      }
      if (nodeType === 'gameIfElse') {
        return () => {
          setSelectedNodeId(nodeId)
          setIsIfElseDialogOpen(true)
        }
      }
      if (nodeType === 'gameEnd') {
        return () => {
          // Find the End node directly since there can only be one
          const endNode = nodes.find((n) => n.type === 'gameEnd')
          if (endNode) {
            setSelectedNodeId(endNode.id)
          }
          setIsEndDialogOpen(true)
        }
      }
      return () => {
        setSelectedNodeId(nodeId)
        setSelectedNodeType(nodeType)
        setIsGameNodeDialogOpen(true)
      }
    },
    [nodes],
  )

  // ========== Effects ==========
  // Listen for command bar actions
  useEffect(() => {
    const handleCommandAction = (event: Event) => {
      const customEvent = event as CustomEvent
      const actionId = customEvent.detail?.actionId
      if (actionId === 'pan') {
        setInteractionMode('pan')
        toast.success('Pan mode activated')
      } else if (actionId === 'select') {
        setInteractionMode('select')
        toast.success('Select mode activated')
      } else if (actionId === 'home') {
        navigate('/teacher/game-studio')
      }
    }

    window.addEventListener('command-action', handleCommandAction)
    return () => {
      window.removeEventListener('command-action', handleCommandAction)
    }
  }, [navigate])

  // Sync context nodes with React Flow nodes
  useEffect(() => {
    if (contextNodes.length > 0) {
      // Merge context nodes with existing nodes, avoiding duplicates
      setNodes((prevNodes) => {
        const existingIds = new Set(prevNodes.map((n) => n.id))
        const newNodes = contextNodes.filter((n) => !existingIds.has(n.id))

        if (newNodes.length > 0) {
          const lastNode = prevNodes[prevNodes.length - 1]
          const updatedNodes = [...prevNodes]

          newNodes.forEach((newNode) => {
            // Calculate position for new node (below the last node)
            const position = lastNode
              ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
              : newNode.position || { x: 100, y: 100 }

            // Create appropriate click handler based on node type
            let onClickHandler: () => void
            if (newNode.type === 'gameStart') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id)
                setIsStartDialogOpen(true)
              }
            } else if (newNode.type === 'gameIfElse') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id)
                setIsIfElseDialogOpen(true)
              }
            } else if (newNode.type === 'gameEnd') {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id)
                setIsEndDialogOpen(true)
              }
            } else {
              onClickHandler = () => {
                setSelectedNodeId(newNode.id)
                setSelectedNodeType(newNode.type || null)
                setIsGameNodeDialogOpen(true)
              }
            }

            const nodeWithHandlers: Node = {
              ...newNode,
              position,
              data: {
                ...newNode.data,
                onClick: onClickHandler,
              },
            }

            updatedNodes.push(nodeWithHandlers)
          })

          return updatedNodes
        }

        return prevNodes
      })
    }
  }, [contextNodes])

  // Keep refs updated
  useEffect(() => {
    setContextNodesRef.current = setContextNodes
    setContextEdgesRef.current = setContextEdges
  }, [setContextNodes, setContextEdges])

  // Sync React Flow nodes and edges back to context when they change
  useEffect(() => {
    if (!isSyncingRef.current && nodes.length > 0) {
      isSyncingRef.current = true
      setContextNodesRef.current(nodes)
      setContextEdgesRef.current(edges)
      setTimeout(() => {
        isSyncingRef.current = false
      }, 100)
    }
  }, [nodes, edges])

  // ========== React Flow Handlers ==========
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Handle node deletion - prevent deletion through React Flow UI, only allow via Settings button
      const deleteChanges = changes.filter((c) => c.type === 'remove')
      for (const change of deleteChanges) {
        if (change.type === 'remove') {
          const nodeToDelete = nodes.find((n) => n.id === change.id)
          if (!nodeToDelete) return

          // Prevent deletion of Start node
          if (nodeToDelete.type === 'gameStart') {
            toast.error('Cannot delete Start node')
            return // Prevent deletion
          }

          // Prevent deletion of nodes that should only be deleted via Settings button
          const deletableOnlyViaButton = [
            'gameEnd',
            'gameParagraph',
            'gameImageTerms',
            'gameImagePin',
            'gameIfElse',
          ]
          if (nodeToDelete.type && deletableOnlyViaButton.includes(nodeToDelete.type)) {
            toast.error('Please use the Delete button in the Settings tab to delete this node')
            return // Prevent deletion
          }

          // For any other node types, allow deletion (though there shouldn't be any)
          setNodes((prevNodes) => {
            const newNodes = prevNodes.filter((n) => n.id !== change.id)
            const constraintCheck = checkNodeConstraints(newNodes)
            if (!constraintCheck.valid) {
              toast.error(constraintCheck.reason || 'Cannot delete this node')
              return prevNodes
            }

            // Remove edges connected to deleted node
            setEdges((prevEdges) =>
              prevEdges.filter((e) => e.source !== change.id && e.target !== change.id),
            )
            toast.success('Node deleted')
            setSelectedNodeId(null)
            return newNodes
          })
          return // Exit early after deletion
        }
      }

      // Handle node selection
      const selectChanges = changes.filter((c) => c.type === 'select')
      for (const change of selectChanges) {
        if (change.type === 'select') {
          if (change.selected) {
            setSelectedNodeId(change.id)
          } else {
            setSelectedNodeId(null)
          }
        }
      }

      // Apply all changes (including position changes for dragging)
      setNodes((nodesSnapshot) => {
        const updatedNodes = applyNodeChanges(changes, nodesSnapshot)

        // Only check constraints for non-position changes
        const hasNonPositionChanges = changes.some(
          (c) => c.type !== 'position' && c.type !== 'dimensions' && c.type !== 'select',
        )

        if (hasNonPositionChanges) {
          const constraintCheck = checkNodeConstraints(updatedNodes)
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Node constraint violation')
            return nodesSnapshot // Revert changes
          }
        }

        // Update node data with onClick handlers - use memoized handler creator
        const nodesWithHandlers = updatedNodes.map((node) => {
          const baseData = node.data || {}

          if (!baseData.onClick) {
            if (node.type === 'gameStart') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameStart'),
                },
              }
            }
            if (node.type === 'gameIfElse') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameIfElse'),
                },
              }
            }
            if (node.type === 'gameEnd') {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, 'gameEnd'),
                },
              }
            }
            if (['gameParagraph', 'gameImageTerms', 'gameImagePin'].includes(node.type || '')) {
              return {
                ...node,
                data: {
                  ...baseData,
                  onClick: createNodeClickHandler(node.id, node.type || null),
                },
              }
            }
          }

          return node
        })

        return nodesWithHandlers
      })
    },
    [nodes, checkNodeConstraints, createNodeClickHandler],
  )

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((edgesSnapshot) => {
      return applyEdgeChanges(changes, edgesSnapshot)
    })
  }, [])

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        toast.error('Invalid connection')
        return
      }

      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      if (!sourceNode || !targetNode) {
        toast.error('Invalid nodes')
        return
      }

      // Prevent Start to End direct connection
      if (sourceNode.type === 'gameStart' && targetNode.type === 'gameEnd') {
        toast.error('Cannot connect Start node to End node')
        return
      }

      // Prevent End node from connecting to Start node
      if (sourceNode.type === 'gameEnd' && targetNode.type === 'gameStart') {
        toast.error('Cannot connect End node to Start node')
        return
      }

      // Prevent End node from connecting to End node
      if (sourceNode.type === 'gameEnd' && targetNode.type === 'gameEnd') {
        toast.error('Cannot connect End node to End node')
        return
      }

      // Prevent Start node from connecting to If/Else node
      if (sourceNode.type === 'gameStart' && targetNode.type === 'gameIfElse') {
        toast.error('Cannot connect Start node to If/Else node')
        return
      }

      // Prevent If/else node from connecting to End node
      if (sourceNode.type === 'gameIfElse' && targetNode.type === 'gameEnd') {
        toast.error('Cannot connect If/else node to End node')
        return
      }

      // If/else: max 2 outgoing edges, one per handle (right-top, right-bottom)
      if (sourceNode.type === 'gameIfElse') {
        const existingIfElseEdges = edges.filter((e) => e.source === params.source)
        if (existingIfElseEdges.length >= 2) {
          toast.error('If/else node can only have 2 outgoing connections (one per branch)')
          return
        }
        const sourceHandle = params.sourceHandle ?? ''
        if (
          sourceHandle &&
          existingIfElseEdges.some((e) => (e.sourceHandle ?? '') === sourceHandle)
        ) {
          toast.error('This branch already has a connection')
          return
        }
        // Assign handle if not provided (e.g. drag from node body)
        if (!params.sourceHandle) {
          params.sourceHandle = existingIfElseEdges.length === 0 ? 'right-top' : 'right-bottom'
        }
      }

      setEdges((prevEdges) => {
        let updatedEdges = [...prevEdges]

        // For nodes that can only have one outgoing connection, remove old outgoing edges
        const singleOutgoingTypes = ['gameStart', 'gameParagraph', 'gameImageTerms', 'gameImagePin']
        if (singleOutgoingTypes.includes(sourceNode.type || '')) {
          updatedEdges = updatedEdges.filter((e) => e.source !== params.source)
        }

        // For nodes that can only have one incoming connection (except End which can have up to 10)
        const singleIncomingTypes = [
          'gameParagraph',
          'gameImageTerms',
          'gameImagePin',
          'gameIfElse',
        ]
        if (singleIncomingTypes.includes(targetNode.type || '')) {
          updatedEdges = updatedEdges.filter((e) => e.target !== params.target)
        }

        // For End node, check if we're at the limit
        if (targetNode.type === 'gameEnd') {
          const endIncomingEdges = updatedEdges.filter((e) => e.target === params.target)
          if (endIncomingEdges.length >= MAX_END_NODE_INCOMING_CONNECTIONS) {
            toast.error(
              `End node can only have up to ${MAX_END_NODE_INCOMING_CONNECTIONS} incoming connections`,
            )
            return prevEdges
          }
        }

        // Add the new edge
        const newEdges = addEdge(
          {
            ...params,
            source: params.source!,
            target: params.target!,
          },
          updatedEdges,
        )
        toast.success('Connection updated')
        return newEdges
      })
    },
    [nodes, edges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      // Prevent duplicate drops
      if (isDroppingRef.current) return
      isDroppingRef.current = true

      const reactFlowBounds = containerRef.current?.getBoundingClientRect()
      if (!reactFlowInstance.current || !reactFlowBounds) {
        isDroppingRef.current = false
        return
      }

      const data = event.dataTransfer.getData('application/reactflow')
      if (!data) {
        isDroppingRef.current = false
        return
      }

      try {
        const nodeData = JSON.parse(data)
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNodeId = `${nodeData.nodeId}-${Date.now()}`

        // Create appropriate click handler based on node type
        let onClickHandler: () => void
        if (nodeData.type === 'gameStart') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId)
            setIsStartDialogOpen(true)
          }
        } else if (nodeData.type === 'gameIfElse') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId)
            setIsIfElseDialogOpen(true)
          }
        } else if (nodeData.type === 'gameEnd') {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId)
            setIsEndDialogOpen(true)
          }
        } else {
          onClickHandler = () => {
            setSelectedNodeId(newNodeId)
            setSelectedNodeType(nodeData.type)
            setIsGameNodeDialogOpen(true)
          }
        }

        const baseData: Record<string, unknown> = {
          label: nodeData.label,
          onClick: onClickHandler,
        }
        if (nodeData.type === 'gameParagraph') {
          baseData.paragraphText = DEFAULT_PARAGRAPH
          baseData.title = ''
          baseData.description = ''
        }
        if (nodeData.type === 'gameImageTerms') {
          baseData.title = ''
          baseData.description = ''
          baseData.terms = [{ id: '1', value: '' }]
        }
        if (nodeData.type === 'gameImagePin') {
          baseData.title = ''
          baseData.description = ''
          baseData.squares = []
        }
        const newNode: Node = {
          id: newNodeId,
          type: nodeData.type,
          position,
          data: baseData,
        }

        // Check constraints and add node
        setNodes((prevNodes) => {
          // Check if node already exists
          if (prevNodes.find((n) => n.id === newNodeId)) {
            isDroppingRef.current = false
            return prevNodes
          }

          const testNodes = [...prevNodes, newNode]
          const constraintCheck = checkNodeConstraints(testNodes)
          if (!constraintCheck.valid) {
            toast.error(constraintCheck.reason || 'Cannot add this node')
            isDroppingRef.current = false
            return prevNodes
          }

          // Reset flag after a short delay to allow state updates
          setTimeout(() => {
            isDroppingRef.current = false
          }, 100)

          toast.success('Node added')
          return testNodes
        })
      } catch (error) {
        console.error('Error parsing drop data:', error)
        isDroppingRef.current = false
      }
    },
    [checkNodeConstraints],
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node if clicking on empty space (not on a node) and in select mode
      if (interactionMode !== 'select') return
      if ((event.target as HTMLElement).closest('.react-flow__node')) {
        return
      }

      // Use React Flow's screenToFlowPosition to convert screen coordinates to flow coordinates
      if (reactFlowInstance.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        addContextNode(position)
      }
    },
    [addContextNode, interactionMode],
  )

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance as ReactFlowInstance

      // Center view on start node after a short delay
      setTimeout(() => {
        if (instance) {
          const startNode = nodes.find((n) => n.type === 'gameStart')
          if (startNode) {
            instance.fitView({
              padding: 0.5,
              includeHiddenNodes: false,
              nodes: [startNode],
              minZoom: 0.5,
              maxZoom: 2,
            })
          } else {
            instance.fitView({ padding: 0.3 })
          }
        }
      }, 300)
    },
    [nodes],
  )

  const handleSave = useCallback(async () => {
    if (!projectId) {
      toast.error('Open a project from Game Studio to save.')
      return
    }
    const teacherId = getUserId()
    if (!teacherId) {
      toast.error('You must be signed in to save.')
      return
    }
    try {
      const gameConfig = serializeFlowGameConfig(nodes, edges)
      const description =
        (nodes.find((n) => n.type === 'gameStart')?.data as { description?: string } | undefined)
          ?.description ?? ''
      await updateGameForStudio(projectId, {
        title: gameTitle,
        description,
        theme_id: gameThemeId,
        game_config: gameConfig,
      })
      toast.success('Project saved.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save project.')
    }
  }, [projectId, getUserId, nodes, edges, gameTitle, gameThemeId])

  const handleLeaveProject = useCallback(async () => {
    try {
      await handleSave()
    } catch {
      toast.error('Failed to save project before leaving.')
    }
    navigate('/teacher/game-studio')
  }, [navigate, handleSave])

  const handlePublish = useCallback(async () => {
    if (!projectId) {
      toast.error('Open a project from Game Studio to publish.')
      return
    }
    try {
      const gameConfig = serializeFlowGameConfig(nodes, edges)
      const description =
        (nodes.find((n) => n.type === 'gameStart')?.data as { description?: string } | undefined)
          ?.description ?? ''
      await updateGameForStudio(projectId, {
        title: gameTitle,
        description,
        theme_id: gameThemeId,
        game_config: gameConfig,
      })
      await publishGame(projectId)
      setIsPublished(true)
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [projectId, nodes, edges, gameTitle, gameThemeId])

  // Handler for SettingsDrawer onSave
  const handleSettingsSave = useCallback(
    async (payload: { title: string; description: string; theme_id: ThemeId }) => {
      if (!projectId) {
        toast.error('Open a project from Game Studio to save.')
        return
      }
      try {
        // Update game title and description in database
        await updateGameForStudio(projectId, {
          title: payload.title,
          description: payload.description,
          theme_id: payload.theme_id,
        })

        // Update local canvas state
        setGameTitle(payload.title)
        setGameThemeId(payload.theme_id)

        // Update Start node's description
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.type === 'gameStart'
              ? { ...node, data: { ...node.data, description: payload.description } }
              : node,
          ),
        )
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [projectId],
  )

  // Handler for SettingsDrawer onRollback

  const handleSettingsRollback = useCallback(async (versionId: string) => {
    // Rollback not yet implemented - versionId will be used when implementing version loading
    toast.info(`Rolling back to version ${versionId}`)
  }, [])

  // Handler for SettingsDrawer onDelete
  const handleSettingsDelete = useCallback(async () => {
    if (!projectId) {
      toast.error('No project to delete')
      return
    }
    try {
      await deleteGame(projectId)
      toast.success('Project deleted')
      navigate('/teacher/game-studio')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete project')
    }
  }, [projectId, navigate])

  const handleUnpublish = useCallback(async () => {
    if (!projectId) {
      toast.error('No project to unpublish')
      return
    }
    try {
      await unpublishGame(projectId)
      setIsPublished(false)
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [projectId])

  const handleStartSave = (data: { title: string; description: string; theme_id: ThemeId }) => {
    const startNodeId = nodes.find((n) => n.type === 'gameStart')?.id
    if (!startNodeId) {
      toast.error('Cannot save: no Start node in this project.')
      return
    }
    if (data.title) {
      setGameTitle(data.title)
    }
    setGameThemeId(data.theme_id)
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === startNodeId && node.type === 'gameStart'
          ? {
              ...node,
              data: {
                ...node.data,
                label: data.title,
                title: data.title,
                description: data.description,
              },
            }
          : node,
      ),
    )
    pendingEndSavePersistRef.current = true
    toast.success('Node saved')
  }

  const handleIfElseSave = (
    data: {
      title?: string
      description?: string
      correctMessage?: string
      wrongMessage?: string
      correctPath?: 'A' | 'B'
    },
    nodeId?: string,
  ) => {
    const targetId = nodeId ?? selectedNodeId
    if (!targetId) {
      toast.error('No node selected. Please open the node again and try saving.')
      return
    }
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== targetId) return node
        const nextData = { ...node.data }
        if (data.title !== undefined) nextData.label = data.title
        if (data.description !== undefined) nextData.description = data.description
        if (data.correctMessage !== undefined) nextData.correctMessage = data.correctMessage
        if (data.wrongMessage !== undefined) nextData.wrongMessage = data.wrongMessage
        if (data.correctPath !== undefined) nextData.correctPath = data.correctPath
        return { ...node, data: nextData }
      }),
    )
    pendingEndSavePersistRef.current = true
    toast.success('Node saved')
  }

  const handleGameNodeSave = (
    data: {
      points?: number
      paragraphGameData?: unknown
      imageTermGameData?: unknown
      imagePinGameData?: unknown
    },
    nodeId?: string,
  ) => {
    const targetId = nodeId ?? selectedNodeId
    if (!targetId) {
      toast.error('No node selected. Please open the node again and try saving.')
      return
    }
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== targetId) return node
        const nextData = { ...node.data, points: data.points }
        if (data.paragraphGameData != null && typeof data.paragraphGameData === 'object') {
          Object.assign(nextData, data.paragraphGameData)
        }
        if (data.imageTermGameData != null && typeof data.imageTermGameData === 'object') {
          Object.assign(nextData, data.imageTermGameData)
        }
        if (data.imagePinGameData != null && typeof data.imagePinGameData === 'object') {
          Object.assign(nextData, data.imagePinGameData)
        }
        return { ...node, data: nextData }
      }),
    )
    toast.success('Node saved')
    pendingEndSavePersistRef.current = true
  }

  const handleEndSave = useCallback(
    (data: { title: string; description: string }) => {
      if (!String(data?.title ?? '').trim() || !String(data?.description ?? '').trim()) {
        toast.error('Title and description are required.')
        return
      }
      const endNode = nodes.find((n) => n.type === 'gameEnd')
      if (!endNode) {
        toast.error('Cannot save: no End node in this project.')
        return
      }
      const targetId = endNode.id
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === targetId && node.type === 'gameEnd'
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: data.title,
                  title: data.title,
                  description: data.description,
                },
              }
            : node,
        ),
      )
      pendingEndSavePersistRef.current = true
      toast.success('Node saved')
    },
    [nodes],
  )

  // After End node dialog save, persist project so changes are stored
  useEffect(() => {
    if (!pendingEndSavePersistRef.current || !projectId) return
    const teacherId = getUserId()
    if (!teacherId) return
    pendingEndSavePersistRef.current = false
    const gameConfig = serializeFlowGameConfig(nodes, edges)
    const description =
      (nodes.find((n) => n.type === 'gameStart')?.data as { description?: string } | undefined)
        ?.description ?? ''
    updateGameForStudio(projectId, {
      title: gameTitle,
      description,
      theme_id: gameThemeId,
      game_config: gameConfig,
    })
      .then(() => {
        toast.success('Project saved.')
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to save project.')
      })
  }, [nodes, edges, gameTitle, gameThemeId, projectId, getUserId])

  const handleEndDelete = () => {
    if (selectedNodeId) {
      setNodes((prevNodes) => {
        const nodeToDelete = prevNodes.find((n) => n.id === selectedNodeId)
        if (!nodeToDelete) return prevNodes

        const newNodes = prevNodes.filter((n) => n.id !== selectedNodeId)

        // Remove edges connected to deleted node
        setEdges((prevEdges) =>
          prevEdges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
        )
        toast.success('End node deleted')
        return newNodes
      })
      setIsEndDialogOpen(false)
    }
  }

  const handleIfElseDelete = () => {
    if (!selectedNodeId) return
    const nodeIdToRemove = selectedNodeId
    setEdges((prevEdges) =>
      prevEdges.filter((e) => e.source !== nodeIdToRemove && e.target !== nodeIdToRemove),
    )
    setNodes((prevNodes) => prevNodes.filter((n) => n.id !== nodeIdToRemove))
    toast.success('If/Else node deleted')
    setIsIfElseDialogOpen(false)
    setSelectedNodeId(null)
  }

  const handleGameNodeDelete = (nodeIdOverride?: string) => {
    const nodeIdToDelete = nodeIdOverride ?? selectedNodeId
    if (nodeIdToDelete) {
      setNodes((prevNodes) => {
        const nodeToDelete = prevNodes.find((n) => n.id === nodeIdToDelete)
        if (!nodeToDelete) return prevNodes

        const newNodes = prevNodes.filter((n) => n.id !== nodeIdToDelete)

        setEdges((prevEdges) =>
          prevEdges.filter((e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete),
        )
        toast.success('Game node deleted')
        return newNodes
      })
      setIsGameNodeDialogOpen(false)
      setSelectedNodeId(null)
    }
  }

  // Measure container dimensions for React Flow
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize nodes with onClick handlers - memoized
  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => {
      // Skip if onClick already exists
      if ((node.data as GameNodeData).onClick) {
        return node
      }

      // Add onClick handlers based on node type
      if (node.type === 'gameStart') {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, 'gameStart'),
          },
        }
      }

      if (node.type === 'gameIfElse') {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, 'gameIfElse'),
          },
        }
      }

      if (node.type === 'gameEnd') {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, 'gameEnd'),
          },
        }
      }

      // All other node types open game node dialog
      if (['gameParagraph', 'gameImageTerms', 'gameImagePin'].includes(node.type || '')) {
        return {
          ...node,
          data: {
            ...node.data,
            onClick: createNodeClickHandler(node.id, node.type || null),
          },
        }
      }

      return node
    })
  }, [nodes, createNodeClickHandler])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 w-full relative">
        {loadState === 'loading' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
            <Spinner
              variant="gray"
              size="md"
              speed={1750}
            />
            <Text
              as="p"
              variant="body"
              className="text-sm text-gray-500"
            >
              {t('editorCanvas.loading')}
            </Text>
          </div>
        )}
        <GameSidebar />
        <div
          ref={containerRef}
          className="w-full h-full rounded-4xl bg-gray-100 overflow-hidden relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/70 p-1.5 backdrop-blur-sm pointer-events-auto dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <EllipsisVertical className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 rounded-2xl p-2 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                    {t('editorCanvas.actions.save')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
                    onClick={() => setIsPreviewDrawerOpen(true)}
                  >
                    <Play className="h-4 w-4" />
                    {t('editorCanvas.actions.preview')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
                    onClick={handleLeaveProject}
                  >
                    <DoorOpen className="h-4 w-4" />
                    {t('editorCanvas.actions.leave')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
                    onClick={() => setIsPublishDrawerOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    {t('editorCanvas.actions.publish')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSettingsDrawerOpen(true)}
            >
              <Settings2 className="h-5 w-5" />
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
      <GameSettingsDrawer
        open={isSettingsDrawerOpen}
        onOpenChange={setIsSettingsDrawerOpen}
        projectId={projectId}
        title={gameTitle}
        description={
          (nodes.find((n) => n.type === 'gameStart')?.data as { description?: string } | undefined)
            ?.description ?? ''
        }
        version={projectVersion}
        rollbackVersions={[]}
        onSave={handleSettingsSave}
        themeId={gameThemeId}
        onRollback={handleSettingsRollback}
        onDelete={handleSettingsDelete}
        isPublished={isPublished}
        onUnpublish={handleUnpublish}
      />
      <GamePreviewDrawer
        open={isPreviewDrawerOpen}
        onOpenChange={setIsPreviewDrawerOpen}
        nodes={nodes}
        edges={edges}
      />
      <GamePublishDrawer
        open={isPublishDrawerOpen}
        onOpenChange={setIsPublishDrawerOpen}
        nodes={nodes}
        edges={edges}
        gameTitle={gameTitle}
        onPublish={handlePublish}
      />
      <StartGameDialog
        open={isStartDialogOpen}
        onOpenChange={setIsStartDialogOpen}
        onSave={handleStartSave}
        nodeId={nodes.find((n) => n.type === 'gameStart')?.id}
        initialData={{
          ...(nodes.find((n) => n.type === 'gameStart')?.data as
            | { title?: string; label?: string; description?: string }
            | undefined),
          theme_id: gameThemeId,
        }}
      />
      <IfElseGameDialog
        open={isIfElseDialogOpen}
        onOpenChange={setIsIfElseDialogOpen}
        onSave={handleIfElseSave}
        initialData={
          selectedNodeId
            ? (nodes.find((n) => n.id === selectedNodeId)?.data as
                | {
                    title?: string
                    label?: string
                    description?: string
                    condition?: string
                    correctMessage?: string
                    wrongMessage?: string
                    correctPath?: 'A' | 'B'
                  }
                | undefined)
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
            ? (nodes.find((n) => n.id === selectedNodeId)?.data as
                | {
                    title?: string
                    description?: string
                  }
                | undefined)
            : undefined
        }
        onDelete={handleEndDelete}
      />
      <GameNodeDialog
        open={isGameNodeDialogOpen}
        onOpenChange={setIsGameNodeDialogOpen}
        nodeType={selectedNodeType || undefined}
        nodeId={selectedNodeId || undefined}
        initialData={selectedNodeId ? nodes.find((n) => n.id === selectedNodeId)?.data : undefined}
        onSave={handleGameNodeSave}
        onDelete={selectedNodeId ? () => handleGameNodeDelete(selectedNodeId) : undefined}
        onUploadImage={
          projectId && getUserId()
            ? async (file, nodeId) => {
                const teacherId = getUserId()
                const institutionId = getUserInstitutionId()
                if (!teacherId || !institutionId) return null
                const title = `games_${projectId}_${nodeId}`
                const result = await uploadFile({
                  institutionId,
                  teacherId,
                  file,
                  title,
                  role: 'teachers',
                })
                return result.success && result.path
                  ? { path: result.path, publicUrl: result.publicUrl ?? null }
                  : null
              }
            : undefined
        }
        onRemoveImage={async (path) => {
          await deleteFile(path)
        }}
      />
    </div>
  )
}
