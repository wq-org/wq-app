import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageTermMatchGame } from '@/features/games/image-term-match';
import ImagePinMarkGame from '../../games/image-pin-mark/ImagePinMarkGame';
import ParagraphLineSelectGame from '../../games/paragraph-line-select/ParagraphLineSelectGame';
import type { GameNodeDialogProps } from '../types/game-studio.types';
import GameNodeLayout from './GameNodeLayout';
import { GameEditorProvider } from '@/contexts/game-studio';
import { logColor } from '@/lib/utils';

// Map node types to game components and titles (components may accept initialData)
const nodeTypeToGame: Record<
  string,
  { component: React.ComponentType<{ initialData?: unknown }>; title: string }
> = {
  gameParagraph: {
    component: ParagraphLineSelectGame,
    title: 'Paragraph Line Select',
  },
  gameImageTerms: {
    component: ImageTermMatchGame,
    title: 'Image Term Match',
  },
  gameImagePin: {
    component: ImagePinMarkGame,
    title: 'Image Pin Mark',
  },
};

export default function GameNodeDialog({
  open,
  onOpenChange,
  nodeType,
  nodeId,
  initialData,
  onSave,
}: GameNodeDialogProps) {
  const [points, setPoints] = useState(100);
  const getGameDataRef = useRef<(() => unknown) | null>(null);

  useEffect(() => {
    if (!open) {
      setPoints(100);
    }
  }, [open]);

  if (!nodeType) return null;

  const gameConfig = nodeTypeToGame[nodeType];
  if (!gameConfig) return null;

  const GameComponent = gameConfig.component;

  const handleSave = () => {
    const gameData = getGameDataRef.current?.();

    if (nodeType === 'gameParagraph' && gameData && typeof gameData === 'object') {
      const data = gameData as {
        title?: string;
        description?: string;
        paragraphText?: string;
        sentenceConfigs?: Array<{
          sentenceNumber: number;
          sentenceText: string;
          options: Array<{ id: string; text: string; isCorrect: boolean }>;
          pointsWhenCorrect?: number;
        }>;
        selectedAnswers?: Array<{ sentenceNumber: number; optionId: string }>;
      };

      const gamesPayload = {
        title: data.title ?? '',
        description: data.description ?? '',
        game_type: 'paragraph_line_select',
        game_config: {
          paragraphText: data.paragraphText ?? '',
          questions: (data.sentenceConfigs ?? []).map((q) => ({
            sentenceNumber: q.sentenceNumber,
            sentenceText: q.sentenceText,
            options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
            pointsWhenCorrect: q.pointsWhenCorrect,
          })),
        },
        // Placeholders for DB fields
        id: '(uuid)',
        teacher_id: '(uuid)',
        topic_id: '(uuid)',
        status: 'draft',
        version: 1,
      };

      const gameSessionsPayload = {
        game_id: '(uuid)',
        student_id: '(uuid)',
        score: 0,
        completed: false,
        session_data: {
          selectedAnswers: data.selectedAnswers ?? [],
        },
        progress_data: null,
      };

      logColor('games', gamesPayload, 'db');
      logColor('game_sessions', gameSessionsPayload, 'react');
      onSave?.({ points, paragraphGameData: gameData });
    } else {
      onSave?.({ points });
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPoints(100);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto !w-[90vw] !max-w-[1080px]">
        <DialogHeader>
          <DialogTitle>{gameConfig.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Configure {gameConfig.title} game node
          </DialogDescription>
        </DialogHeader>
        <GameEditorProvider getGameDataRef={getGameDataRef}>
          <GameNodeLayout
            key={open ? nodeId ?? 'none' : 'closed'}
            nodeId={nodeId}
            gameComponent={GameComponent}
            initialData={initialData}
            points={points}
            onPointsChange={setPoints}
            hideSettingsTab={true}
          />
        </GameEditorProvider>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

