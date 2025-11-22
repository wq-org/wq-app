import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGameStudioContext } from '@/contexts/game-studio';
import type { GameNodeSettingsProps } from '../types/game-studio.types';

export default function GameNodeSettings({ nodeId }: GameNodeSettingsProps) {
  const { getNode } = useGameStudioContext();
  const node = nodeId ? getNode(nodeId) : null;
  
  const [title, setTitle] = useState<string>(() => {
    const nodeTitle = node?.data?.title || node?.data?.label;
    return typeof nodeTitle === 'string' ? nodeTitle : '';
  });
  const [description, setDescription] = useState<string>(() => {
    const nodeDesc = node?.data?.description;
    return typeof nodeDesc === 'string' ? nodeDesc : '';
  });

  useEffect(() => {
    if (node) {
      const nodeTitle = node.data?.title || node.data?.label;
      const nodeDesc = node.data?.description;
      setTitle(typeof nodeTitle === 'string' ? nodeTitle : '');
      setDescription(typeof nodeDesc === 'string' ? nodeDesc : '');
    }
  }, [node]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="node-title">Title</Label>
        <Input
          id="node-title"
          placeholder="Enter node title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="node-description">Description</Label>
        <Textarea
          id="node-description"
          placeholder="Enter node description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

    </div>
  );
}

