import type { PublishIssue } from '../types/publish-validation.types'
import type { GraphIssue } from '../types/graph-validation.types'

const NODE_ISSUE_PREFIXES = [
  'imagePin.',
  'openQuestion.',
  'dndMath.',
  'start.meta.',
  'end.meta.',
  'ifElse.',
] as const

export function isNodePublishIssueCode(code: string): boolean {
  return NODE_ISSUE_PREFIXES.some((prefix) => code.startsWith(prefix))
}

export function getPublishIssueMessageKey(issue: PublishIssue | GraphIssue): string {
  const namespace = isNodePublishIssueCode(issue.code) ? 'nodeIssues' : 'graphIssues'
  return `publishValidation.${namespace}.${issue.code}`
}

export function graphIssueToPublishIssue(issue: GraphIssue): PublishIssue {
  return { ...issue, severity: 'error' }
}

/** Preview fallback when i18n is unavailable — code plus optional label param. */
export function formatPublishIssueFallback(issue: PublishIssue): string {
  const label = issue.params?.label
  return label ? `${issue.code}: ${label}` : issue.code
}

export function resolvePublishIssueMessage(
  issue: PublishIssue,
  translate: (key: string, params?: Record<string, string | number>) => string,
): string {
  return translate(getPublishIssueMessageKey(issue), issue.params)
}

/** Stable, unique React list key for publish validation rows. */
export function getPublishIssueReactKey(issue: PublishIssue, index: number): string {
  const parts = [
    issue.code,
    issue.nodeId,
    issue.edgeId,
    issue.rectId,
    issue.tabId,
    issue.params?.rectIndex,
    issue.params?.tabTitle,
  ]
    .map((part) => (part == null ? '' : String(part)))
    .filter(Boolean)

  if (parts.length === 0) return `publish-issue-${index}`

  return `${parts.join(':')}:${index}`
}
