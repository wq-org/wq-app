import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { IfElseGameDialogProps } from '../types/game-studio.types';

export default function IfElseGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: IfElseGameDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCondition(initialData.condition || '');
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (title.trim() && description.trim()) {
      onSave?.({ title, description, condition: condition.trim() || undefined });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setCondition('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto !w-[90vw] !max-w-[1080px]">
        <DialogHeader>
          <DialogTitle>Configure If/Else Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the if/else node with title, description, and condition
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/1000
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe the condition logic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
            />
          </div>
          
          <Separator />
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="configuration">Configuration</Label>
            <div className="p-4 border rounded-lg bg-muted/50 min-h-[100px]">
              {/* Configuration section - left blank as requested */}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !description.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

