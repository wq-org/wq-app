/** Node types that participate in publish-time flow validation (mirrors GameNodeRegistry). */
export const FLOW_GRAPH_NODE_TYPES = [
  'gameStart',
  'gameEnd',
  'gameIfElse',
  'gameImagePin',
  'gameDragDropMath',
  'gameOpenQuestion',
] as const

export type FlowGraphNodeType = (typeof FLOW_GRAPH_NODE_TYPES)[number]

/** Playable game nodes required for publish (registry category: games). */
export const GAMEPLAY_NODE_TYPES = ['gameImagePin', 'gameDragDropMath', 'gameOpenQuestion'] as const

export type GameplayNodeType = (typeof GAMEPLAY_NODE_TYPES)[number]

const FLOW_GRAPH_NODE_TYPE_SET = new Set<string>(FLOW_GRAPH_NODE_TYPES)
const GAMEPLAY_NODE_TYPE_SET = new Set<string>(GAMEPLAY_NODE_TYPES)

export function isFlowGraphNodeType(type: string | undefined): type is FlowGraphNodeType {
  return type != null && FLOW_GRAPH_NODE_TYPE_SET.has(type)
}

export function isGameplayNodeType(type: string | undefined): type is GameplayNodeType {
  return type != null && GAMEPLAY_NODE_TYPE_SET.has(type)
}

const GAMEPLAY_DISPLAY_LABELS: Record<GameplayNodeType, string> = {
  gameImagePin: 'Image and Pin',
  gameDragDropMath: 'Drag & drop math',
  gameOpenQuestion: 'Open question',
}

const FLOW_DISPLAY_LABELS: Record<FlowGraphNodeType, string> = {
  gameStart: 'Start',
  gameEnd: 'End Node',
  gameIfElse: 'If/Else',
  ...GAMEPLAY_DISPLAY_LABELS,
}

export function getFlowGraphNodeDisplayLabel(
  type: string | undefined,
  data: Record<string, unknown> | undefined,
): string {
  const label =
    typeof data?.label === 'string'
      ? data.label
      : typeof data?.title === 'string'
        ? data.title
        : undefined
  if (label?.trim()) return label.trim()
  if (type && isFlowGraphNodeType(type)) return FLOW_DISPLAY_LABELS[type]
  return type ?? 'Node'
}
