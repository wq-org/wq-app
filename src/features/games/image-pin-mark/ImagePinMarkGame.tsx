import { useState } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import ImagePin from './components/ImagePin';
import PinArea from './components/PinArea';
import GameInformation from '@/features/games/components/GameInformation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ImagePinMarkGame() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const [pinVariant] = useState<'default' | 'secondary'>('default');

  const handlePinMove = (position: { x: number; y: number }) => {
    setPinPosition(position);
  };

  const editorContent = (
    <div className="space-y-6">
      <GameInformation
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <ImagePin variant={pinVariant} />
    </div>
  );

  const previewContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Label>Preview</Label>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <PinArea onPinMove={handlePinMove}>
              {pinPosition && (
                <div
                  className="absolute"
                  style={{
                    left: `${pinPosition.x}px`,
                    top: `${pinPosition.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <ImagePin variant={pinVariant} />
                </div>
              )}
            </PinArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const settingsContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Label>Settings</Label>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pin Variant:</span>
              <span className="font-medium capitalize">{pinVariant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pin Position:</span>
              <span className="font-medium">
                {pinPosition
                  ? `(${Math.round(pinPosition.x)}, ${Math.round(pinPosition.y)})`
                  : 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <GameLayout
      editorContent={editorContent}
      previewContent={previewContent}
      settingsContent={settingsContent}
    />
  );
}

