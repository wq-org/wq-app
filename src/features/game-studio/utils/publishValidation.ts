import type { Edge, Node } from '@xyflow/react'

import type { PublishValidationResult } from '../types/publish-validation.types'
import { collectNodePublishIssues } from './collectNodePublishIssues'
import { graphIssueToPublishIssue } from './formatPublishIssue'
import { validateGameStudioGraph } from './graph/validateGameStudioGraph'
import { sortPublishIssues } from './sortPublishIssues'

export function getPublishValidationResult(nodes: Node[], edges: Edge[]): PublishValidationResult {
  const graph = validateGameStudioGraph(nodes, edges)
  const graphIssues = graph.issues.map(graphIssueToPublishIssue)
  const nodeIssues = collectNodePublishIssues(nodes, graph)
  const issues = sortPublishIssues([...graphIssues, ...nodeIssues])
  const canPublish = issues.every((issue) => issue.severity !== 'error')

  return { canPublish, issues, graph }
}

export { validateGameStudioGraph } from './graph/validateGameStudioGraph'
export type {
  GraphIssue,
  GraphIssueCode,
  GraphValidationResult,
  NodeReachabilityIssue,
} from '../types/graph-validation.types'
export type {
  PublishIssue,
  PublishIssueSeverity,
  PublishValidationResult,
} from '../types/publish-validation.types'
