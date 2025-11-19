import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, MapPin, FileText } from 'lucide-react';
import { ImageTermMatchGame } from '@/features/games/image-term-match';
import ImagePinMarkGame from '../../games/image-pin-mark/ImagePinMarkGame';
import ParagraphLineSelectGame from '../../games/paragraph-line-select/ParagraphLineSelectGame';
import GameNodeLayout from './GameNodeLayout';

import type { GameOption } from '../types/game-studio.types';
const gameOptions: GameOption[] = [
  {
    id: 'image-term-match',
    icon: Image,
    title: 'Image Term Match',
    description: 'User gets 1 image and 4 terms, one is correct',
    component: ImageTermMatchGame,
  },
  {
    id: 'image-pin-mark',
    icon: MapPin,
    title: 'Image Pin Mark',
    description: 'User gets an image and pin or mark areas (correct or wrong)',
    component: ImagePinMarkGame,
  },
  {
    id: 'paragraph-line-select',
    icon: FileText,
    title: 'Paragraph Line Select',
    description: 'User gets a paragraph and finds correct lines with possible answers',
    component: ParagraphLineSelectGame,
  },
];

interface ActionGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId?: string;
}

export default function ActionGameDialog({
  open,
  onOpenChange,
  nodeId,
}: ActionGameDialogProps) {
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);

  const handleOptionClick = (option: GameOption) => {
    setSelectedGame(option);
  };

  const handleClose = () => {
    setSelectedGame(null);
    onOpenChange(false);
  };

  const SelectedGameComponent = selectedGame?.component;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Game Action</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a game action type for this node
          </DialogDescription>
        </DialogHeader>

        {!selectedGame ? (
          <div className="flex flex-row gap-4 mt-4">
            {gameOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="flex-1 cursor-pointer p-4 border rounded-lg hover:shadow-md transition-shadow"
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Icon className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <GameNodeLayout
            nodeId={nodeId}
            gameComponent={SelectedGameComponent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
