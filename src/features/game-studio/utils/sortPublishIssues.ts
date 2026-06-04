import type { PublishIssue } from '../types/publish-validation.types'

const GRAPH_CODE_ORDER = [
  'start.missing',
  'start.duplicate',
  'start.noOutgoing',
  'end.missing',
  'end.duplicate',
  'end.hasOutgoing',
  'game.missing',
  'edge.sourceMissing',
  'edge.targetMissing',
  'edge.selfLoop',
  'flow.endUnreachable',
  'flow.notReachableFromStart',
  'flow.cannotReachEnd',
  'ifElse.branch.missing',
] as const

function graphCodeRank(code: string): number {
  const index = GRAPH_CODE_ORDER.indexOf(code as (typeof GRAPH_CODE_ORDER)[number])
  return index === -1 ? GRAPH_CODE_ORDER.length : index
}

function comparePublishIssues(a: PublishIssue, b: PublishIssue): number {
  const aIsGraph =
    !a.code.startsWith('imagePin.') &&
    !a.code.startsWith('openQuestion.') &&
    !a.code.startsWith('dndMath.') &&
    !a.code.startsWith('start.meta.') &&
    !a.code.startsWith('end.meta.') &&
    !a.code.startsWith('ifElse.')

  const bIsGraph =
    !b.code.startsWith('imagePin.') &&
    !b.code.startsWith('openQuestion.') &&
    !b.code.startsWith('dndMath.') &&
    !b.code.startsWith('start.meta.') &&
    !b.code.startsWith('end.meta.') &&
    !b.code.startsWith('ifElse.')

  if (aIsGraph && !bIsGraph) return -1
  if (!aIsGraph && bIsGraph) return 1

  if (aIsGraph && bIsGraph) {
    const rankDiff = graphCodeRank(a.code) - graphCodeRank(b.code)
    if (rankDiff !== 0) return rankDiff
  }

  if (a.severity !== b.severity) {
    return a.severity === 'error' ? -1 : 1
  }

  const nodeCompare = (a.nodeId ?? '').localeCompare(b.nodeId ?? '')
  if (nodeCompare !== 0) return nodeCompare

  return a.code.localeCompare(b.code)
}

export function sortPublishIssues(issues: PublishIssue[]): PublishIssue[] {
  return [...issues].sort(comparePublishIssues)
}
