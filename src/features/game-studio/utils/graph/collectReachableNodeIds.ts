/** BFS from `startId` following adjacency lists; returns all visited node ids including start. */
export function collectReachableNodeIds(
  startId: string,
  adjacencyByNodeId: Map<string, string[]>,
): Set<string> {
  const reachable = new Set<string>()
  const queue: string[] = [startId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (reachable.has(currentId)) continue
    reachable.add(currentId)

    const neighbors = adjacencyByNodeId.get(currentId) ?? []
    for (const neighborId of neighbors) {
      if (!reachable.has(neighborId)) {
        queue.push(neighborId)
      }
    }
  }

  return reachable
}
