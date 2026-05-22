import type { Edge, Node } from '@xyflow/react'

import { getCurrentGameDraftVersionId, updateGameForStudio } from '../api/gameStudioApi'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import type { ThemeId } from '@/lib/themes'

import { serializeFlowGameConfig } from './gameConfigSerialization'
import { syncGameImageLinks } from './syncGameImageLinks'

export type SaveGameStudioDraftParams = {
  projectId: string
  nodes: Node[]
  edges: Edge[]
  gameTitle: string
  gameThemeId: ThemeId
  institutionId: string | null
}

/** Persists current canvas state to `games.game_content` and syncs image-pin cloud links. */
export async function saveGameStudioDraft({
  projectId,
  nodes,
  edges,
  gameTitle,
  gameThemeId,
  institutionId,
}: SaveGameStudioDraftParams): Promise<void> {
  const gameConfig = serializeFlowGameConfig(nodes, edges)
  const description =
    (nodes.find((n) => n.type === GAME_START_TYPE)?.data as { description?: string } | undefined)
      ?.description ?? ''

  await updateGameForStudio(projectId, {
    title: gameTitle,
    description,
    theme_id: gameThemeId,
    game_content: gameConfig,
  })

  if (!institutionId) return

  const draftVersionId = await getCurrentGameDraftVersionId(projectId)
  if (!draftVersionId) return

  await syncGameImageLinks({
    gameVersionId: draftVersionId,
    institutionId,
    nodes,
  })
}
