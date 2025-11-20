import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface GameInformationProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  points?: number;
  onPointsChange?: (points: number) => void;
}

export default function GameInformation({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  points,
  onPointsChange,
}: GameInformationProps) {
  const [pointsInput, setPointsInput] = useState<string>('');

  useEffect(() => {
    if (points !== undefined) {
      setPointsInput(points.toFixed(1));
    } else {
      setPointsInput('100.0');
    }
  }, [points]);

  const handlePointsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d?$/.test(value)) {
      setPointsInput(value);
      
      // Parse and validate the value
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Clamp between 0.0 and 100.0
        const clampedValue = Math.max(0.0, Math.min(100.0, numValue));
        // Round to one decimal place
        const roundedValue = Math.round(clampedValue * 10) / 10;
        onPointsChange?.(roundedValue);
      } else if (value === '') {
        onPointsChange?.(0);
      }
    }
  };

  const handlePointsBlur = () => {
    // Ensure value is properly formatted on blur
    const numValue = parseFloat(pointsInput);
    if (isNaN(numValue)) {
      setPointsInput('100.0');
      onPointsChange?.(100.0);
    } else {
      const clampedValue = Math.max(0.0, Math.min(100.0, numValue));
      const roundedValue = Math.round(clampedValue * 10) / 10;
      setPointsInput(roundedValue.toFixed(1));
      onPointsChange?.(roundedValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Label>Game Information</Label>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            placeholder="Enter game description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        {onPointsChange && (
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="points">Points</Label>
              <p className="text-xs text-muted-foreground">
                Set the points awarded for completing this game node (0.0-100.0)
              </p>
            </div>
            <Input
              id="points"
              type="text"
              inputMode="decimal"
              placeholder="100.0"
              value={pointsInput}
              onChange={handlePointsInputChange}
              onBlur={handlePointsBlur}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

