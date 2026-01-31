import { useState } from 'react';
import { ListOrdered, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DESCRIPTION_TRUNCATE_LENGTH = 100;

export interface GameSummaryCardProps {
  totalQuestions: number;
  totalPoints: number;
  /** Optional description; when over 600 characters, an expand/collapse control is shown. */
  description?: string;
}

export default function GameSummaryCard({
  totalQuestions,
  totalPoints,
  description,
}: GameSummaryCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const isDescriptionLong = typeof description === 'string' && description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const descriptionDisplay =
    isDescriptionLong && !descriptionExpanded
      ? `${description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}…`
      : description ?? '';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2">
            <ListOrdered className="size-4" aria-hidden />
            Total questions: {totalQuestions}
          </span>
          <span className="flex items-center gap-2">
            <Award className="size-4" aria-hidden />
            Total points: {totalPoints}
          </span>
        </div>
        {description !== undefined && description !== '' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{descriptionDisplay}</p>
            {isDescriptionLong && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setDescriptionExpanded((prev) => !prev)}
              >
                {descriptionExpanded ? (
                  <>
                    <ChevronUp className="size-4" aria-hidden />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" aria-hidden />
                    Expand
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
