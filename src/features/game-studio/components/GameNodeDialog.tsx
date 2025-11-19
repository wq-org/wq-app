import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageTermMatchGame } from '@/features/games/image-term-match';
import ImagePinMarkGame from '../../games/image-pin-mark/ImagePinMarkGame';
import ParagraphLineSelectGame from '../../games/paragraph-line-select/ParagraphLineSelectGame';
import type { GameNodeDialogProps } from '../types/game-studio.types';

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
}: GameNodeDialogProps) {
  if (!nodeType) return null;

  const gameConfig = nodeTypeToGame[nodeType];
  if (!gameConfig) return null;

  const GameComponent = gameConfig.component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto !w-[90vw] !max-w-[1080px]">
        <DialogHeader>
          <DialogTitle>{gameConfig.title}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <GameComponent />
        </div>
      </DialogContent>
    </Dialog>
  );
}

