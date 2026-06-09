import type { FlowGameConfig } from '../types/game-studio.types'
import type { GameDraftDiff, GameLifecycleState } from '../types/game-version.types'

type GameStateSnapshot = {
  archived_at: string | null
  current_published_version_id: string | null
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
  currentContent: FlowGameConfig | null,
  liveContent: FlowGameConfig | null,
): GameDraftDiff {
  const currentNodes = currentContent?.nodes ?? []
  const liveNodes = liveContent?.nodes ?? []

  const liveNodeMap = new Map(liveNodes.map((n) => [n.id, n]))
  const currentNodeMap = new Map(currentNodes.map((n) => [n.id, n]))

  const nodesAdded = currentNodes.filter((n) => !liveNodeMap.has(n.id)).length
  const nodesRemoved = liveNodes.filter((n) => !currentNodeMap.has(n.id)).length
  const nodesModified = currentNodes.filter((n) => {
    const live = liveNodeMap.get(n.id)
    if (!live) return false
    return JSON.stringify(n.data) !== JSON.stringify(live.data)
  }).length

  const totalChanges = nodesAdded + nodesRemoved + nodesModified

  const statusLineKeys: Array<{ key: string; count?: number }> = []
  if (nodesAdded > 0) statusLineKeys.push({ key: 'releasePanel.nodeAdded', count: nodesAdded })
  if (nodesRemoved > 0)
    statusLineKeys.push({ key: 'releasePanel.nodeRemoved', count: nodesRemoved })
  if (nodesModified > 0)
    statusLineKeys.push({ key: 'releasePanel.nodeModified', count: nodesModified })
  if (totalChanges === 0) statusLineKeys.push({ key: 'releasePanel.noChanges' })

  return {
    summary: { totalChanges, nodesAdded, nodesRemoved, nodesModified, metadataChanged: false },
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
