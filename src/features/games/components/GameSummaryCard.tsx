import { ListOrdered, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface GameSummaryCardProps {
  totalQuestions: number;
  totalPoints: number;
}

export default function GameSummaryCard({
  totalQuestions,
  totalPoints,
}: GameSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
}
