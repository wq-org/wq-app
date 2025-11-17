import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGameStudioContext } from '@/contexts/game-studio';

interface GameNodeSettingsProps {
  nodeId?: string;
}

export default function GameNodeSettings({ nodeId }: GameNodeSettingsProps) {
  const { getNode, updateNode } = useGameStudioContext();
  const node = nodeId ? getNode(nodeId) : null;
  
  const [title, setTitle] = useState(node?.data?.title || node?.data?.label || '');
  const [description, setDescription] = useState(node?.data?.description || '');

  useEffect(() => {
    if (node) {
      setTitle(node.data?.title || node.data?.label || '');
      setDescription(node.data?.description || '');
    }
  }, [node]);

  const handleSave = () => {
    if (nodeId) {
      updateNode(nodeId, { title, description });
    }
  };

  const hasChanges = 
    title !== (node?.data?.title || node?.data?.label || '') ||
    description !== (node?.data?.description || '');

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

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

