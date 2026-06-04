import type { GraphValidationResult } from './graph-validation.types'

export type PublishIssueSeverity = 'error' | 'warning'

export type PublishIssue = {
  code: string
  severity: PublishIssueSeverity
  nodeId?: string
  edgeId?: string
  params?: Record<string, string | number>
  tabId?: string
  rectId?: string
}

export type PublishValidationResult = {
  canPublish: boolean
  issues: PublishIssue[]
  graph: GraphValidationResult
}
