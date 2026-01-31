import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface GameResultTableRow {
  key: string | number;
  statementText: string;
  statementTruncated: string;
  selectedAnswerTexts: string[];
  earned: number;
  max: number;
}

export interface GameResultTableProps {
  /** Pre-computed rows for display. */
  rows: GameResultTableRow[];
  /** Total earned across all rows. */
  totalEarned: number;
  /** Total max across all rows. */
  totalMax: number;
  /** Optional heading above the table. */
  title?: string;
}

/**
 * Display-only table for game results: Statement, Selected answers, Result, and Overall.
 */
export default function GameResultTable({
  rows,
  totalEarned,
  totalMax,
  title = 'Selected Answers',
}: GameResultTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Statement</TableHead>
            <TableHead>Selected answers</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="max-w-[200px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate block cursor-default">
                      {row.statementTruncated}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    {row.statementText}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="max-w-[200px]">
                {row.selectedAnswerTexts.length === 0 ? (
                  '—'
                ) : (
                  <div className="flex flex-col gap-1">
                    {row.selectedAnswerTexts.map((text, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <span className="truncate block cursor-default">
                            {text}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm">
                          {text}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                {row.earned}/{row.max}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-medium">
              Overall
            </TableCell>
            <TableCell className="font-medium">
              {totalEarned}/{totalMax}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
