'use client'

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { PublishIssue } from '../types/publish-validation.types'
import { resolvePublishIssueMessage } from '../utils/formatPublishIssue'

export type GamePublishGraphIssueListProps = {
  issues: PublishIssue[]
  canPublish: boolean
  onFocusNode?: (nodeId: string) => void
}

function IssueRow({
  issue,
  message,
  onFocusNode,
}: {
  issue: PublishIssue
  message: string
  onFocusNode?: (nodeId: string) => void
}) {
  const isWarning = issue.severity === 'warning'
  const textClass = isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-destructive'
  const focusableNodeId = issue.nodeId

  if (focusableNodeId && onFocusNode) {
    return (
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-auto w-full justify-start px-2 py-1.5 text-left text-sm font-normal underline-offset-2 hover:underline',
          textClass,
        )}
        onClick={() => onFocusNode(focusableNodeId)}
      >
        {message}
      </Button>
    )
  }

  return <span className={`px-2 py-1.5 text-sm ${textClass}`}>{message}</span>
}

export function GamePublishGraphIssueList({
  issues,
  canPublish,
  onFocusNode,
}: GamePublishGraphIssueListProps) {
  const { t } = useTranslation('features.gameStudio')

  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  const hasWarningsOnly = canPublish && warnings.length > 0

  return (
    <div className="space-y-3 px-6 pt-4">
      <div className="flex items-center gap-2">
        {canPublish ? (
          hasWarningsOnly ? (
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
          ) : (
            <CheckCircle2 className="size-5 shrink-0 text-green-600" />
          )
        ) : (
          <AlertCircle className="size-5 shrink-0 text-destructive" />
        )}
        <Text
          as="p"
          variant="body"
          className="font-medium"
        >
          {canPublish
            ? hasWarningsOnly
              ? t('publishValidation.requirementsMetWithWarnings')
              : t('publishValidation.requirementsMet')
            : t('publishValidation.requirementsNotMet')}
        </Text>
      </div>

      {errors.length > 0 ? (
        <IssueSection
          title={t('publishValidation.errorsTitle')}
          issues={errors}
          onFocusNode={onFocusNode}
          translate={t}
        />
      ) : null}

      {warnings.length > 0 ? (
        <IssueSection
          title={t('publishValidation.warningsTitle')}
          issues={warnings}
          onFocusNode={onFocusNode}
          translate={t}
        />
      ) : null}
    </div>
  )
}

function IssueSection({
  title,
  issues,
  onFocusNode,
  translate,
}: {
  title: string
  issues: PublishIssue[]
  onFocusNode?: (nodeId: string) => void
  translate: (key: string, params?: Record<string, string | number>) => string
}) {
  return (
    <div className="space-y-2">
      <Text
        as="p"
        variant="small"
        muted
      >
        {title}
      </Text>
      <ul
        role="list"
        className="space-y-1"
      >
        {issues.map((issue, index) => {
          const message = resolvePublishIssueMessage(issue, translate)
          return (
            <li key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`}>
              <IssueRow
                issue={issue}
                message={message}
                onFocusNode={onFocusNode}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
