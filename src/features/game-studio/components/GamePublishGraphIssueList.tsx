'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

import type { GraphIssue } from '../types/graph-validation.types'

export type GamePublishGraphIssueListProps = {
  issues: GraphIssue[]
  canPublish: boolean
  onFocusNode?: (nodeId: string) => void
}

function resolveIssueMessage(
  issue: GraphIssue,
  translate: (key: string, params?: Record<string, string | number>) => string,
): string {
  return translate(`publishValidation.graphIssues.${issue.code}`, issue.params)
}

export function GamePublishGraphIssueList({
  issues,
  canPublish,
  onFocusNode,
}: GamePublishGraphIssueListProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div className="space-y-3 px-6 pt-4">
      <div className="flex items-center gap-2">
        {canPublish ? (
          <CheckCircle2 className="size-5 shrink-0 text-green-600" />
        ) : (
          <AlertCircle className="size-5 shrink-0 text-destructive" />
        )}
        <Text
          as="p"
          variant="body"
          className="font-medium"
        >
          {canPublish
            ? t('publishValidation.requirementsMet')
            : t('publishValidation.requirementsNotMet')}
        </Text>
      </div>

      {!canPublish && issues.length > 0 ? (
        <div className="space-y-2">
          <Text
            as="p"
            variant="small"
            muted
          >
            {t('publishValidation.rulesTitle')}
          </Text>
          <ul
            role="list"
            className="space-y-1"
          >
            {issues.map((issue, index) => {
              const message = resolveIssueMessage(issue, t)
              const focusableNodeId = issue.nodeId

              if (focusableNodeId && onFocusNode) {
                return (
                  <li key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`}>
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-destructive underline-offset-2 hover:bg-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => onFocusNode(focusableNodeId)}
                    >
                      {message}
                    </button>
                  </li>
                )
              }

              return (
                <li
                  key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`}
                  className="px-2 py-1.5 text-sm text-destructive"
                >
                  {message}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
