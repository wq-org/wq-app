import type { StepNode } from '../../types/scoring.types'

/**
 * Validates structural integrity of a step tree.
 *
 * Throws when:
 * - tree is empty
 * - a dependency id does not exist
 * - cyclic dependencies are detected
 */
export function validateStepTree(tree: readonly StepNode[]): void {
  if (tree.length === 0) {
    throw new Error('Step tree must contain at least one node')
  }

  const byId = new Map<string, StepNode>()
  for (const node of tree) {
    byId.set(node.id, node)
  }

  for (const node of tree) {
    for (const depId of node.deps) {
      if (!byId.has(depId)) {
        throw new Error(`Unknown dep: ${depId}`)
      }
    }
  }

  // Detect cycles via DFS coloring.
  const colors = new Map<string, 0 | 1 | 2>()
  const visit = (id: string) => {
    const color = colors.get(id) ?? 0
    if (color === 1) throw new Error('Cyclic step tree')
    if (color === 2) return
    colors.set(id, 1)
    const node = byId.get(id)
    if (!node) return
    for (const depId of node.deps) visit(depId)
    colors.set(id, 2)
  }
  for (const node of tree) visit(node.id)
}

/**
 * Topologically sorts the tree so every node appears after all dependencies.
 */
export function topoSort(tree: readonly StepNode[]): StepNode[] {
  validateStepTree(tree)

  const byId = new Map<string, StepNode>()
  const indegree = new Map<string, number>()
  const dependents = new Map<string, string[]>()

  for (const node of tree) {
    byId.set(node.id, node)
    indegree.set(node.id, node.deps.length)
    dependents.set(node.id, [])
  }

  for (const node of tree) {
    for (const depId of node.deps) {
      const list = dependents.get(depId)
      if (list) list.push(node.id)
    }
  }

  const queue: string[] = []
  for (const [id, degree] of indegree.entries()) {
    if (degree === 0) queue.push(id)
  }

  const ordered: StepNode[] = []
  while (queue.length > 0) {
    const id = queue.shift()
    if (!id) break
    const node = byId.get(id)
    if (!node) continue
    ordered.push(node)
    for (const childId of dependents.get(id) ?? []) {
      const next = (indegree.get(childId) ?? 0) - 1
      indegree.set(childId, next)
      if (next === 0) queue.push(childId)
    }
  }

  if (ordered.length !== tree.length) {
    throw new Error('Cyclic step tree')
  }
  return ordered
}

/**
 * Returns the final node in dependency order.
 * In MVP we treat the last topologically sorted node as the final result step.
 */
export function getFinalNode(tree: readonly StepNode[]): StepNode {
  const ordered = topoSort(tree)
  return ordered[ordered.length - 1]
}
