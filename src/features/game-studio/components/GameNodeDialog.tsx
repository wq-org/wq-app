import { useState, useEffect } from 'react';
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

// Map node types to game components and titles
const nodeTypeToGame: Record<string, { component: React.ComponentType; title: string }> = {
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
  onSave,
}: GameNodeDialogProps) {
  const [points, setPoints] = useState(100);

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
    onSave?.({ points });
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
        <GameNodeLayout
          nodeId={nodeId}
          gameComponent={GameComponent}
          points={points}
          onPointsChange={setPoints}
          hideSettingsTab={true}
        />
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

