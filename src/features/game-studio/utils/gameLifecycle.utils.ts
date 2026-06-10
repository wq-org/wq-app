import type { ThemeId } from '@/lib/themes'

import type { FlowGameConfig } from '../types/game-studio.types'
import type {
  GameDraftDiff,
  GameLifecycleState,
  PublishedGameVersion,
} from '../types/game-version.types'

type GameStateSnapshot = {
  archived_at: string | null
  current_published_version_id: string | null
}

type GameDraftMetadata = {
  title: string
  description: string | null
  themeId: ThemeId
  content: FlowGameConfig | null
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim()
}

export function resolveGameLifecycleState(
  game: GameStateSnapshot | null,
  diff: GameDraftDiff | null,
): GameLifecycleState {
  if (!game) return 'draftOnly'
  if (game.archived_at) return 'archived'
  if (!game.current_published_version_id) return 'draftOnly'
  if (diff && diff.summary.totalChanges > 0) return 'publishedWithDraftChanges'
  return 'publishedClean'
}

export function buildGameReleaseDiff(
  draft: GameDraftMetadata,
  live: PublishedGameVersion | null,
): GameDraftDiff {
  if (!live) {
    const hasDraftContent =
      (draft.content?.nodes?.length ?? 0) > 0 ||
      normalizeText(draft.title).length > 0 ||
      normalizeText(draft.description).length > 0

    return {
      summary: {
        totalChanges: hasDraftContent ? 1 : 0,
        nodesAdded: 0,
        nodesRemoved: 0,
        nodesModified: 0,
        metadataChanged: hasDraftContent,
      },
      statusLineKeys: [{ key: 'releasePanel.noChanges' }],
      recommendedReleaseType: hasDraftContent ? 'minor' : 'none',
    }
  }

  const currentNodes = draft.content?.nodes ?? []
  const liveNodes = live.content?.nodes ?? []

  const liveNodeMap = new Map(liveNodes.map((n) => [n.id, n]))
  const currentNodeMap = new Map(currentNodes.map((n) => [n.id, n]))

  const nodesAdded = currentNodes.filter((n) => !liveNodeMap.has(n.id)).length
  const nodesRemoved = liveNodes.filter((n) => !currentNodeMap.has(n.id)).length
  const nodesModified = currentNodes.filter((n) => {
    const liveNode = liveNodeMap.get(n.id)
    if (!liveNode) return false
    return JSON.stringify(n.data) !== JSON.stringify(liveNode.data)
  }).length

  const titleChanged = normalizeText(draft.title) !== normalizeText(live.gameTitle)
  const descriptionChanged =
    normalizeText(draft.description) !== normalizeText(live.gameDescription)
  const themeChanged = draft.themeId !== live.themeId
  const metadataChanged = titleChanged || descriptionChanged || themeChanged

  const graphChanges = nodesAdded + nodesRemoved + nodesModified
  const totalChanges = graphChanges + (metadataChanged ? 1 : 0)

  const statusLineKeys: Array<{ key: string; count?: number }> = []
  if (nodesAdded > 0) statusLineKeys.push({ key: 'releasePanel.nodeAdded', count: nodesAdded })
  if (nodesRemoved > 0)
    statusLineKeys.push({ key: 'releasePanel.nodeRemoved', count: nodesRemoved })
  if (nodesModified > 0)
    statusLineKeys.push({ key: 'releasePanel.nodeModified', count: nodesModified })
  if (metadataChanged) statusLineKeys.push({ key: 'releasePanel.metadataChanged' })
  if (totalChanges === 0) statusLineKeys.push({ key: 'releasePanel.noChanges' })

  return {
    summary: { totalChanges, nodesAdded, nodesRemoved, nodesModified, metadataChanged },
    statusLineKeys,
    recommendedReleaseType: totalChanges > 0 ? 'minor' : 'none',
  }
}

export function formatGamePublishedAt(publishedAt: Date | string | null, locale = 'en'): string {
  if (!publishedAt) return '—'
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
