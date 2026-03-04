import { Text } from '@/components/ui/text'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import FeedbackDisplay from './FeedbackDisplay'
import { useTranslation } from 'react-i18next'

export interface GameResultTableRow {
  key: string | number
  statementText: string
  statementTruncated: string
  selectedAnswerTexts: string[]
  earned: number
  max: number
  /** Optional feedback shown for this row (e.g. when correct/wrong). */
  feedback?: string
  /** Optional variant for feedback styling. */
  feedbackVariant?: 'correct' | 'wrong'
}

/** Optional column and footer labels for reuse across games. */
export interface GameResultTableColumnLabels {
  /** First column (question/expected). */
  statement?: string
  /** Second column (user selection). */
  selectedAnswers?: string
  /** Third column (earned/max). */
  result?: string
  /** Fourth column (feedback). */
  feedback?: string
  /** Footer row label. */
  footer?: string
}

export interface GameResultTableProps {
  /** Pre-computed rows for display. */
  rows: GameResultTableRow[]
  /** Total earned across all rows. */
  totalEarned: number
  /** Total max across all rows. */
  totalMax: number
  /** Optional heading above the table. */
  title?: string
  /** Optional column/footer labels; omit to use defaults. */
  columnLabels?: GameResultTableColumnLabels
  /** Wrap content for readable compact panels instead of truncating. */
  wrapContent?: boolean
}

/**
 * Display-only table for game results. Column headers and footer are configurable.
 */
export default function GameResultTable({
  rows,
  totalEarned,
  totalMax,
  title,
  columnLabels,
  wrapContent = false,
}: GameResultTableProps) {
  const { t } = useTranslation('features.games')
  if (rows.length === 0) return null

  const labels: Required<GameResultTableColumnLabels> = {
    statement: t('resultTable.columns.statement'),
    selectedAnswers: t('resultTable.columns.selectedAnswers'),
    result: t('resultTable.columns.result'),
    feedback: t('resultTable.columns.feedback'),
    footer: t('resultTable.columns.footer'),
    ...columnLabels,
  }

  return (
    <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4">
      <Text
        as="h3"
        variant="h3"
        className="text-sm font-medium text-gray-700 mb-2"
      >
        {title ?? t('resultTable.title')}
      </Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.statement}</TableHead>
            <TableHead>{labels.selectedAnswers}</TableHead>
            <TableHead>{labels.result}</TableHead>
            <TableHead>{labels.feedback}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
              className="animate-in fade-in-0 slide-in-from-bottom-2"
            >
              <TableCell className="max-w-[200px] min-w-0 align-top">
                {wrapContent ? (
                  <Text
                    as="span"
                    variant="small"
                    className="block whitespace-normal break-all leading-relaxed"
                  >
                    {row.statementText}
                  </Text>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Text
                        as="span"
                        variant="small"
                        className="truncate block cursor-default"
                      >
                        {row.statementTruncated}
                      </Text>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-sm"
                    >
                      {row.statementText}
                    </TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] min-w-0 align-top">
                {row.selectedAnswerTexts.length === 0 ? (
                  t('resultTable.emptyValue')
                ) : (
                  <div className="flex flex-col gap-1">
                    {row.selectedAnswerTexts.map((text, i) =>
                      wrapContent ? (
                        <Text
                          key={i}
                          as="span"
                          variant="small"
                          className="block whitespace-normal break-all leading-relaxed"
                        >
                          {text}
                        </Text>
                      ) : (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <Text
                              as="span"
                              variant="small"
                              className="truncate block cursor-default"
                            >
                              {text}
                            </Text>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-sm"
                          >
                            {text}
                          </TooltipContent>
                        </Tooltip>
                      ),
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground text-sm align-top">
                {row.earned}/{row.max}
              </TableCell>
              <TableCell
                className={cn(
                  'max-w-60 min-w-0 wrap-break-word whitespace-normal align-top',
                  wrapContent && 'min-w-[12rem]',
                )}
              >
                <FeedbackDisplay
                  feedback={row.feedback}
                  variant={row.feedbackVariant}
                  className="min-h-0 border-0 bg-transparent px-0 py-0 wrap-break-word"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={2}
              className="font-medium"
            >
              {labels.footer}
            </TableCell>
            <TableCell className="font-medium">
              {totalEarned}/{totalMax}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
