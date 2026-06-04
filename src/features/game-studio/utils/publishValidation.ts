import type { Edge, Node } from '@xyflow/react'

import type { GraphValidationResult } from '../types/graph-validation.types'
import { validateGameStudioGraph } from './graph/validateGameStudioGraph'

export type PublishValidationResult = GraphValidationResult

/** Phase 1: graph-level publish gate only (node content validation comes later). */
export function getPublishValidationResult(nodes: Node[], edges: Edge[]): PublishValidationResult {
  return validateGameStudioGraph(nodes, edges)
}

export { validateGameStudioGraph } from './graph/validateGameStudioGraph'
export type {
  GraphIssue,
  GraphIssueCode,
  GraphValidationResult,
  NodeReachabilityIssue,
} from '../types/graph-validation.types'
