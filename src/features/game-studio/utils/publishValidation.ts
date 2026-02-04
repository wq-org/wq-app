import type { Node, Edge } from '@xyflow/react'

const GAME_NODE_TYPES = ['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'] as const

export function getNodeLabel(node: Node): string {
  const d = node.data as Record<string, unknown> | undefined
  const label = (d?.label ?? d?.title ?? node.id) as string
  return typeof label === 'string' && label.trim() ? label : node.id
}

export function getReachableFromStart(nodes: Node[], edges: Edge[]): Set<string> {
  const start = nodes.find((n) => n.type === 'gameStart')
  if (!start) return new Set()
  const out = new Set<string>()
  const queue: string[] = [start.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target))
  }
  return out
}

export function getReachableToEnd(nodes: Node[], edges: Edge[]): Set<string> {
  const end = nodes.find((n) => n.type === 'gameEnd')
  if (!end) return new Set()
  const out = new Set<string>()
  const queue: string[] = [end.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.target === id).forEach((e) => queue.push(e.source))
  }
  return out
}

/** Per-node validation: returns list of short missing-item labels. Uses flattened node.data. */
export function getNodeValidationErrors(node: Node): string[] {
  const type = node.type
  const data = node.data as Record<string, unknown> | undefined
  const errors: string[] = []

  if (type === 'gameStart') {
    const title = (data?.title ?? data?.label ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) errors.push('Missing title')
    if (!String(description).trim()) errors.push('Missing description')
    return errors
  }

  if (type === 'gameEnd') {
    const title = (data?.title ?? data?.label ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) errors.push('Missing title')
    if (!String(description).trim()) errors.push('Missing description')
    return errors
  }

  if (type === 'gameIfElse') {
    const condition = (data?.condition ?? '') as string
    if (!String(condition).trim()) errors.push('Missing condition')
    return errors
  }

  if (type === 'gameParagraph') {
    const title = (data?.title ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) errors.push('Missing title')
    if (!String(description).trim()) errors.push('Missing description')
    const configs = Array.isArray(data?.sentenceConfigs) ? data.sentenceConfigs : []
    if (configs.length === 0) {
      errors.push('No sentence content')
      return errors
    }
    const hasValidQuestion = configs.some((c: Record<string, unknown>) => {
      const opts = Array.isArray(c.options) ? c.options : []
      const correct = opts.filter((o: Record<string, unknown>) => o.isCorrect === true)
      const wrong = opts.filter((o: Record<string, unknown>) => o.isCorrect === false)
      const correctWithPoints = correct.some(
        (o: Record<string, unknown>) => typeof o.points === 'number' && o.points >= 0,
      )
      const wrongWithPoints = wrong.some(
        (o: Record<string, unknown>) =>
          typeof o.pointsWhenWrong === 'number' && o.pointsWhenWrong >= 0,
      )
      return correct.length >= 1 && wrong.length >= 1 && correctWithPoints && wrongWithPoints
    })
    if (!hasValidQuestion) errors.push('Need 1 correct + 1 wrong option with points')
    return errors
  }

  if (type === 'gameImageTerms') {
    const title = (data?.title ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) errors.push('Missing title')
    if (!String(description).trim()) errors.push('Missing description')
    const hasImage = Boolean(
      (typeof data?.imagePreview === 'string' && data.imagePreview.trim()) ||
        (typeof data?.filepath === 'string' && data.filepath.trim()),
    )
    if (!hasImage) errors.push('Missing image')
    const terms = Array.isArray(data?.terms) ? data.terms : []
    if (terms.length < 2) {
      errors.push('Need 2+ terms')
      return errors
    }
    // Treat isCorrect as truthy/falsy so we accept boolean, 1/0, or string forms from JSON/DB
    const correct = terms.filter((t: Record<string, unknown>) => !!t.isCorrect)
    const wrong = terms.filter((t: Record<string, unknown>) => !t.isCorrect)
    const correctWithPoints = correct.some(
      (t: Record<string, unknown>) => typeof t.points === 'number' && t.points >= 0,
    )
    const wrongWithPoints = wrong.some(
      (t: Record<string, unknown>) =>
        (typeof t.pointsWhenWrong === 'number' && t.pointsWhenWrong >= 0) ||
        (typeof t.points === 'number' && t.points >= 0),
    )
    if (correct.length === 0 || wrong.length === 0) errors.push('Need correct and wrong term')
    else if (!correctWithPoints || !wrongWithPoints) errors.push('Missing points')
    return errors
  }

  if (type === 'gameImagePin') {
    const title = (data?.title ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) errors.push('Missing title')
    if (!String(description).trim()) errors.push('Missing description')
    const hasImage = Boolean(
      (typeof data?.imagePreview === 'string' && data.imagePreview.trim()) ||
        (typeof data?.filepath === 'string' && data.filepath.trim()),
    )
    if (!hasImage) errors.push('Missing image')
    const squares = Array.isArray(data?.squares) ? data.squares : []
    if (squares.length < 1) {
      errors.push('No squares')
      return errors
    }
    const hasValidSquare = squares.some(
      (s: Record<string, unknown>) =>
        String(s.question ?? '').trim() !== '' &&
        typeof s.points === 'number' &&
        (typeof s.pointsWhenWrong === 'number' || s.pointsWhenWrong === undefined),
    )
    if (!hasValidSquare) {
      const hasQuestion = squares.some(
        (s: Record<string, unknown>) => String(s.question ?? '').trim() !== '',
      )
      const hasPoints = squares.some(
        (s: Record<string, unknown>) =>
          typeof s.points === 'number' &&
          (typeof s.pointsWhenWrong === 'number' || s.pointsWhenWrong === undefined),
      )
      if (!hasQuestion) errors.push('Missing question text')
      if (!hasPoints) errors.push('Missing points')
    }
    return errors
  }

  return errors
}

export interface NodeValidationItem {
  node: Node
  label: string
  errors: string[]
}

export interface ValidationResult {
  nodeItems: NodeValidationItem[]
  globalErrors: string[]
  canPublish: boolean
}

export function getValidationResult(nodes: Node[], edges: Edge[]): ValidationResult {
  const globalErrors: string[] = []
  const startNode = nodes.find((n) => n.type === 'gameStart')
  const endNode = nodes.find((n) => n.type === 'gameEnd')
  const gameNodes = nodes.filter(
    (n) => n.type && GAME_NODE_TYPES.includes(n.type as (typeof GAME_NODE_TYPES)[number]),
  )

  if (!startNode) globalErrors.push('At least one Start node is required')
  if (gameNodes.length === 0)
    globalErrors.push(
      'At least one game node (Paragraph, Image Terms, Image Pin, or If/Else) is required',
    )
  if (!endNode) globalErrors.push('At least one End node is required')

  if (startNode && endNode && nodes.length > 0) {
    const fromStart = getReachableFromStart(nodes, edges)
    const toEnd = getReachableToEnd(nodes, edges)
    const disconnected: string[] = []
    nodes.forEach((n) => {
      if (!fromStart.has(n.id) || !toEnd.has(n.id)) disconnected.push(getNodeLabel(n))
    })
    if (disconnected.length)
      globalErrors.push(`Disconnected nodes (must link Start to End): ${disconnected.join(', ')}`)
  }

  const nodeItems: NodeValidationItem[] = nodes.map((node) => ({
    node,
    label: getNodeLabel(node),
    errors: getNodeValidationErrors(node),
  }))

  const hasNodeErrors = nodeItems.some((item) => item.errors.length > 0)
  const canPublish = globalErrors.length === 0 && !hasNodeErrors

  return { nodeItems, globalErrors, canPublish }
}

/** Get points contribution from a single node. Uses flattened node.data. */
export function getPointsForNode(node: Node): number {
  const type = node.type
  const data = node.data as Record<string, unknown> | undefined
  if (!type || !GAME_NODE_TYPES.includes(type as (typeof GAME_NODE_TYPES)[number])) return 0
  if (typeof data?.points === 'number' && data.points >= 0) return data.points
  if (type === 'gameParagraph' && data) {
    const configs = Array.isArray(data.sentenceConfigs) ? data.sentenceConfigs : []
    return (
      configs.reduce((sum: number, config: Record<string, unknown>) => {
        const opts = Array.isArray(config.options) ? config.options : []
        const optSum = opts.reduce(
          (s: number, o: Record<string, unknown>) =>
            s + (typeof o.points === 'number' ? o.points : 0),
          0,
        )
        return sum + (optSum > 0 ? optSum : ((config.pointsWhenCorrect as number) ?? 0))
      }, 0) || 0
    )
  }
  if (type === 'gameImageTerms' && data) {
    const terms = Array.isArray(data.terms) ? data.terms : []
    return terms
      .filter((t: Record<string, unknown>) => t.isCorrect === true)
      .reduce(
        (s: number, t: Record<string, unknown>) =>
          s + (typeof t.points === 'number' ? t.points : 1),
        0,
      )
  }
  if (type === 'gameImagePin' && data) {
    const squares = Array.isArray(data.squares) ? data.squares : []
    return squares.reduce(
      (s: number, sq: Record<string, unknown>) =>
        s + (typeof sq.points === 'number' && sq.points > 0 ? sq.points : 1),
      0,
    )
  }
  return 100
}

export function hasParagraphPenalties(nodes: Node[]): boolean {
  return nodes.some((node) => {
    if (node.type !== 'gameParagraph') return false
    const data = node.data as Record<string, unknown> | undefined
    const configs = Array.isArray(data?.sentenceConfigs) ? data.sentenceConfigs : []
    return configs.some(
      (config: Record<string, unknown>) =>
        Array.isArray(config.options) &&
        config.options.some(
          (o: Record<string, unknown>) =>
            o.isCorrect !== true && Number(o.pointsWhenWrong ?? 0) > 0,
        ),
    )
  })
}

export function getDisplayNameForNodeType(type: string | undefined): string {
  switch (type) {
    case 'gameStart':
      return 'Start'
    case 'gameEnd':
      return 'End Node'
    case 'gameParagraph':
      return 'Paragraph'
    case 'gameImageTerms':
      return 'Image and Terms'
    case 'gameImagePin':
      return 'Image and Pin'
    case 'gameIfElse':
      return 'If/Else'
    default:
      return type ?? 'Node'
  }
}
