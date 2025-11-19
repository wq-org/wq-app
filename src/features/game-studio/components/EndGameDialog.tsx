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
import type { EndGameDialogProps } from '../types/game-studio.types';
import GameNodeLayout from './GameNodeLayout';

interface EndGameDialogPropsWithDelete extends EndGameDialogProps {
  onDelete?: () => void;
}

export default function EndGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  nodeId,
  onDelete,
}: EndGameDialogPropsWithDelete) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (title.trim() && description.trim()) {
      onSave?.({ title, description });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure End Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the end node with title and description
          </DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          overviewContent={
            <div className="flex flex-col gap-4">
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
                  placeholder="Enter end message"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
              </div>
            </div>
          }
          showDelete={true}
          onDelete={handleDelete}
        />
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

