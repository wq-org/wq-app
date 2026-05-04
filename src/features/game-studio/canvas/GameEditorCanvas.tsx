import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  SelectionMode,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useGameStudioContext } from '@/contexts/game-studio'
import { useUser } from '@/contexts/user'
import type { ThemeId } from '@/lib/themes'

import { MAX_END_NODE_INCOMING_CONNECTIONS } from '../constants'
import { buildXYFlowNodeTypes, getRegistryEntry } from '../nodes/_registry/GameNodeRegistry'
import { IF_ELSE_HANDLE_A, IF_ELSE_HANDLE_B } from '../nodes/game-if-else'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import { GAME_END_TYPE } from '../nodes/game-end/game-end.schema'
import { GAME_IF_ELSE_TYPE } from '../nodes/game-if-else/game-if-else.schema'
import { GAME_IMAGE_PIN_TYPE } from '../nodes/game-image-pin/game-image-pin.schema'
import {
  getGameForStudio,
  publishGame,
  unpublishGame,
  updateGameForStudio,
} from '../api/gameStudioApi'
import { serializeFlowGameConfig } from '../utils/gameConfigSerialization'
import { GameSettingsDrawer } from '../components/GameSettingsDrawer'
import { GamePreviewDrawer } from '../components/GamePreviewDrawer'
import { GamePublishDrawer } from '../components/GamePublishDrawer'
import { deleteGame } from '@/features/command-palette'
import { GameEditorSidebar } from './GameEditorSidebar'
import { GameEditorToolbar } from './GameEditorToolbar'

const DEFAULT_TITLE = 'Untitled game'

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: GAME_START_TYPE,
    position: { x: 0, y: 0 },
    data: { label: 'Start' },
  },
]

const SINGLETON_TYPES = new Set<string>([GAME_START_TYPE, GAME_END_TYPE])
const SINGLE_OUTGOING_TYPES = new Set<string>([GAME_START_TYPE, GAME_IMAGE_PIN_TYPE])
const SINGLE_INCOMING_TYPES = new Set<string>([GAME_IMAGE_PIN_TYPE, GAME_IF_ELSE_TYPE])

function checkSingletonConstraints(nodes: Node[]): { valid: boolean; reason?: string } {
  for (const type of SINGLETON_TYPES) {
    const count = nodes.filter((n) => n.type === type).length
    if (count > 1) {
      return { valid: false, reason: `Only one ${type} node is allowed` }
    }
  }
  return { valid: true }
}

function isConnectionAllowed(
  source: Node,
  target: Node,
): { ok: true } | { ok: false; reason: string } {
  if (source.type === GAME_START_TYPE && target.type === GAME_END_TYPE) {
    return { ok: false, reason: 'Cannot connect Start node to End node' }
  }
  if (source.type === GAME_END_TYPE) {
    return { ok: false, reason: 'End node cannot connect outwards' }
  }
  if (source.type === GAME_START_TYPE && target.type === GAME_IF_ELSE_TYPE) {
    return { ok: false, reason: 'Cannot connect Start node to If/Else node' }
  }
  if (source.type === GAME_IF_ELSE_TYPE && target.type === GAME_END_TYPE) {
    return { ok: false, reason: 'Cannot connect If/Else node to End node' }
  }
  return { ok: true }
}

export type GameEditorCanvasProps = {
  projectId?: string
}

export function GameEditorCanvas({ projectId }: GameEditorCanvasProps) {
  const navigate = useNavigate()
  const { getUserId } = useUser()
  const {
    nodes: contextNodes,
    setNodes: setContextNodes,
    setEdges: setContextEdges,
    addNode: addContextNode,
  } = useGameStudioContext()

  const nodeTypes = useMemo(() => buildXYFlowNodeTypes(), [])

  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>([])
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    projectId ? 'loading' : 'idle',
  )

  const [openDialogNodeId, setOpenDialogNodeId] = useState<string | null>(null)
  const [gameTitle, setGameTitle] = useState<string>(DEFAULT_TITLE)
  const [gameThemeId, setGameThemeId] = useState<ThemeId>('blue')
  const [projectVersion, setProjectVersion] = useState<number>(1)
  const [isPublished, setIsPublished] = useState(false)
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false)
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false)
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false)
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('select')
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDroppingRef = useRef(false)
  const isSyncingRef = useRef(false)

  // ---- Load project ----
  useEffect(() => {
    if (!projectId) {
      setLoadState('idle')
      setGameThemeId('blue')
      return
    }
    setLoadState('loading')
    getGameForStudio(projectId)
      .then((game) => {
        if (game) setIsPublished(game.status === 'published')
        if (!game?.game_content?.nodes?.length) {
          setLoadState('loaded')
          return
        }
        const config = game.game_content
        const loadedNodes: Node[] = config.nodes.map((n) => ({
          id: n.id,
          type: n.type ?? 'default',
          position: n.position ?? { x: 0, y: 0 },
          data: { ...n.data },
        }))
        const description = game.description?.trim()
        if (description) {
          const startNode = loadedNodes.find((n) => n.type === GAME_START_TYPE)
          if (startNode) {
            const desc = (startNode.data as Record<string, unknown>)?.description
            if (desc == null || String(desc).trim() === '') {
              startNode.data = { ...startNode.data, description }
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
        setGameTitle(game.title || DEFAULT_TITLE)
        setGameThemeId(game.theme_id || 'blue')
        setProjectVersion(game.version ?? 1)
        setLoadState('loaded')
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load project')
        setLoadState('error')
      })
  }, [projectId])

  // ---- Click-to-open dialog handler injection (single behaviour for every node type) ----
  const openDialogForNode = useCallback((nodeId: string) => {
    setOpenDialogNodeId(nodeId)
  }, [])

  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as Record<string, unknown> | undefined
      if (data?.onClick) return node
      const entry = getRegistryEntry(node.type)
      if (!entry || !entry.DialogComponent) return node
      const id = node.id
      return {
        ...node,
        data: {
          ...data,
          onClick: () => openDialogForNode(id),
        },
      }
    })
  }, [nodes, openDialogForNode])

  // ---- Sync context nodes added externally (e.g. command palette) ----
  useEffect(() => {
    if (contextNodes.length === 0) return
    setNodes((prev) => {
      const existing = new Set(prev.map((n) => n.id))
      const incoming = contextNodes.filter((n) => !existing.has(n.id))
      if (incoming.length === 0) return prev
      const lastNode = prev[prev.length - 1]
      const next = [...prev]
      incoming.forEach((newNode) => {
        const position = lastNode
          ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
          : (newNode.position ?? { x: 100, y: 100 })
        next.push({ ...newNode, position })
      })
      return next
    })
  }, [contextNodes])

  // ---- Mirror state to context for sidebars/panels that read it ----
  useEffect(() => {
    if (isSyncingRef.current || nodes.length === 0) return
    isSyncingRef.current = true
    setContextNodes(nodes)
    setContextEdges(edges)
    setTimeout(() => {
      isSyncingRef.current = false
    }, 100)
  }, [nodes, edges, setContextNodes, setContextEdges])

  // ---- React Flow handlers ----
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const removals = changes.filter((c) => c.type === 'remove')
      for (const change of removals) {
        if (change.type !== 'remove') continue
        const node = nodes.find((n) => n.id === change.id)
        if (!node) continue
        const entry = getRegistryEntry(node.type)
        if (!entry?.isDeletable) {
          toast.error(`Cannot delete ${entry?.label ?? node.type ?? 'this'} node`)
          return
        }
      }

      setNodes((snapshot) => {
        const updated = applyNodeChanges(changes, snapshot)
        const hasNonPosition = changes.some(
          (c) => c.type !== 'position' && c.type !== 'dimensions' && c.type !== 'select',
        )
        if (hasNonPosition) {
          const constraint = checkSingletonConstraints(updated)
          if (!constraint.valid) {
            toast.error(constraint.reason ?? 'Node constraint violation')
            return snapshot
          }
        }
        return updated
      })

      const removedIds = removals
        .map((c) => (c.type === 'remove' ? c.id : null))
        .filter((id): id is string => id != null)
      if (removedIds.length > 0) {
        setEdges((prev) =>
          prev.filter((e) => !removedIds.includes(e.source) && !removedIds.includes(e.target)),
        )
      }
    },
    [nodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((snapshot) => applyEdgeChanges(changes, snapshot)),
    [],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        toast.error('Invalid connection')
        return
      }
      const source = nodes.find((n) => n.id === params.source)
      const target = nodes.find((n) => n.id === params.target)
      if (!source || !target) {
        toast.error('Invalid nodes')
        return
      }

      const allowed = isConnectionAllowed(source, target)
      if (!allowed.ok) {
        toast.error(allowed.reason)
        return
      }

      // If/Else: max 2 outgoing, one per branch handle
      const params2: Connection = { ...params }
      if (source.type === GAME_IF_ELSE_TYPE) {
        const existing = edges.filter((e) => e.source === params.source)
        if (existing.length >= 2) {
          toast.error('If/else node can only have 2 outgoing connections')
          return
        }
        const handle = params2.sourceHandle ?? ''
        if (handle && existing.some((e) => (e.sourceHandle ?? '') === handle)) {
          toast.error('This branch already has a connection')
          return
        }
        if (!params2.sourceHandle) {
          params2.sourceHandle = existing.length === 0 ? IF_ELSE_HANDLE_A : IF_ELSE_HANDLE_B
        }
      }

      setEdges((prev) => {
        let next = [...prev]
        if (source.type && SINGLE_OUTGOING_TYPES.has(source.type)) {
          next = next.filter((e) => e.source !== params2.source)
        }
        if (target.type && SINGLE_INCOMING_TYPES.has(target.type)) {
          next = next.filter((e) => e.target !== params2.target)
        }
        if (target.type === GAME_END_TYPE) {
          const incoming = next.filter((e) => e.target === params2.target)
          if (incoming.length >= MAX_END_NODE_INCOMING_CONNECTIONS) {
            toast.error(
              `End node can only have up to ${MAX_END_NODE_INCOMING_CONNECTIONS} incoming connections`,
            )
            return prev
          }
        }
        const result = addEdge(
          { ...params2, source: params2.source!, target: params2.target! },
          next,
        )
        toast.success('Connection updated')
        return result
      })
    },
    [nodes, edges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (isDroppingRef.current) return
    isDroppingRef.current = true

    const bounds = containerRef.current?.getBoundingClientRect()
    if (!reactFlowInstance.current || !bounds) {
      isDroppingRef.current = false
      return
    }
    const raw = event.dataTransfer.getData('application/reactflow')
    if (!raw) {
      isDroppingRef.current = false
      return
    }
    try {
      const payload = JSON.parse(raw) as { type: string; label?: string; nodeId?: string }
      const entry = getRegistryEntry(payload.type)
      if (!entry) {
        toast.error(`Unknown node type: ${payload.type}`)
        isDroppingRef.current = false
        return
      }
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      const newNodeId = `${payload.type}-${Date.now()}`
      const newNode: Node = {
        id: newNodeId,
        type: entry.type,
        position,
        data: { ...entry.defaultConfig, label: payload.label ?? entry.label },
      }

      setNodes((prev) => {
        if (prev.find((n) => n.id === newNodeId)) {
          isDroppingRef.current = false
          return prev
        }
        if (!entry.allowMultiple && prev.some((n) => n.type === entry.type)) {
          toast.error(`Only one ${entry.label} node is allowed`)
          isDroppingRef.current = false
          return prev
        }
        const test = [...prev, newNode]
        const constraint = checkSingletonConstraints(test)
        if (!constraint.valid) {
          toast.error(constraint.reason ?? 'Cannot add this node')
          isDroppingRef.current = false
          return prev
        }
        setTimeout(() => {
          isDroppingRef.current = false
        }, 100)
        toast.success('Node added')
        return test
      })
    } catch (err) {
      console.error('Error parsing drop data:', err)
      isDroppingRef.current = false
    }
  }, [])

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (interactionMode !== 'select') return
      if ((event.target as HTMLElement).closest('.react-flow__node')) return
      if (!reactFlowInstance.current) return
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addContextNode(position)
    },
    [addContextNode, interactionMode],
  )

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance
      setTimeout(() => {
        const startNode = nodes.find((n) => n.type === GAME_START_TYPE)
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
      }, 300)
    },
    [nodes],
  )

  // ---- Save / publish ----
  const persist = useCallback(
    async (status: 'save' | 'publish') => {
      if (!projectId) {
        toast.error('Open a project from Game Studio to save.')
        return
      }
      const teacherId = getUserId()
      if (!teacherId) {
        toast.error('You must be signed in to save.')
        return
      }
      const gameConfig = serializeFlowGameConfig(nodes, edges)
      const description =
        (
          nodes.find((n) => n.type === GAME_START_TYPE)?.data as
            | { description?: string }
            | undefined
        )?.description ?? ''
      await updateGameForStudio(projectId, {
        title: gameTitle,
        description,
        theme_id: gameThemeId,
        game_content: gameConfig,
      })
      if (status === 'publish') {
        await publishGame(projectId)
        setIsPublished(true)
      }
    },
    [projectId, getUserId, nodes, edges, gameTitle, gameThemeId],
  )

  const handleSave = useCallback(async () => {
    try {
      await persist('save')
      toast.success('Project saved.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save project.')
    }
  }, [persist])

  const handlePublish = useCallback(async () => {
    try {
      await persist('publish')
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [persist])

  const handleLeave = useCallback(async () => {
    try {
      await persist('save')
    } catch {
      toast.error('Failed to save project before leaving.')
    }
    navigate('/teacher/game-studio')
  }, [navigate, persist])

  const handleSettingsSave = useCallback(
    async (payload: { title: string; description: string; theme_id: ThemeId }) => {
      if (!projectId) {
        toast.error('Open a project from Game Studio to save.')
        return
      }
      try {
        await updateGameForStudio(projectId, {
          title: payload.title,
          description: payload.description,
          theme_id: payload.theme_id,
        })
        setGameTitle(payload.title)
        setGameThemeId(payload.theme_id)
        setNodes((prev) =>
          prev.map((node) =>
            node.type === GAME_START_TYPE
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

  const handleSettingsRollback = useCallback(async (versionId: string) => {
    toast.info(`Rolling back to version ${versionId}`)
  }, [])

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

  // ---- Container measure ----
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ---- Command bar listener (pan / select / home) ----
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { actionId?: string } | undefined
      if (detail?.actionId === 'pan') {
        setInteractionMode('pan')
        toast.success('Pan mode activated')
      } else if (detail?.actionId === 'select') {
        setInteractionMode('select')
        toast.success('Select mode activated')
      } else if (detail?.actionId === 'home') {
        navigate('/teacher/game-studio')
      }
    }
    window.addEventListener('command-action', handler)
    return () => window.removeEventListener('command-action', handler)
  }, [navigate])

  // ---- Resolve open dialog from registry ----
  const openDialog = useMemo(() => {
    if (!openDialogNodeId) return null
    const node = nodes.find((n) => n.id === openDialogNodeId)
    if (!node) return null
    const entry = getRegistryEntry(node.type)
    if (!entry?.DialogComponent) return null
    return { Component: entry.DialogComponent, nodeId: node.id }
  }, [openDialogNodeId, nodes])

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
              Loading…
            </Text>
          </div>
        )}
        <GameEditorSidebar />
        <div
          ref={containerRef}
          className="w-full h-full rounded-4xl bg-gray-100 overflow-hidden relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <GameEditorToolbar
            onSave={handleSave}
            onPreview={() => setIsPreviewDrawerOpen(true)}
            onLeave={handleLeave}
            onPublish={() => setIsPublishDrawerOpen(true)}
            onOpenSettings={() => setIsSettingsDrawerOpen(true)}
          />

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
          (
            nodes.find((n) => n.type === GAME_START_TYPE)?.data as
              | { description?: string }
              | undefined
          )?.description ?? ''
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

      {openDialog ? (
        <openDialog.Component
          nodeId={openDialog.nodeId}
          onClose={() => setOpenDialogNodeId(null)}
        />
      ) : null}
    </div>
  )
}
