import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Node, Edge } from '@xyflow/react'
import { getGameForStudio } from '@/features/game-studio/api/gameStudioApi'
import { GamePlayView } from '../components/GamePlayView'
import { GamePlayProvider } from '@/contexts/game-play'
import Spinner from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { ArrowLeft } from 'lucide-react'

export default function PlayGamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gameId) {
      setError('Missing game ID')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getGameForStudio(gameId)
      .then((game) => {
        if (!game) {
          setError('Game not found')
          setNodes([])
          setEdges([])
          return
        }
        const config = game.game_config
        if (!config?.nodes?.length) {
          setError('Game has no content')
          setNodes([])
          setEdges([])
          return
        }
        const loadedNodes: Node[] = config.nodes.map((n) => ({
          id: n.id,
          type: n.type ?? 'default',
          position: n.position ?? { x: 0, y: 0 },
          data: { ...n.data },
        }))
        const gameDescription = game.description?.trim()
        if (gameDescription) {
          const startNode = loadedNodes.find((n) => n.type === 'gameStart')
          if (startNode) {
            const desc = (startNode.data as Record<string, unknown>)?.description
            if (desc == null || String(desc).trim() === '') {
              startNode.data = {
                ...startNode.data,
                description: gameDescription,
              } as Record<string, unknown>
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
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load game')
        setNodes([])
        setEdges([])
      })
      .finally(() => setLoading(false))
  }, [gameId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <Text
          as="p"
          variant="body"
          className="text-muted-foreground"
        >
          {error}
        </Text>
        <Button
          variant="outline"
          onClick={() => navigate('/teacher/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Button>
      </div>
    )
  }

  return (
    <GamePlayProvider>
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 flex items-center gap-4 border-b px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teacher/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          <GamePlayView
            nodes={nodes}
            edges={edges}
          />
        </div>
      </div>
    </GamePlayProvider>
  )
}
