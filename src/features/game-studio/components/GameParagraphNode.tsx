import { Handle, Position } from '@xyflow/react';
import { StickyNote } from 'lucide-react';
import type { GameParagraphNodeProps } from '../types/game-studio.types';

export default function GameParagraphNode({ data, selected }: GameParagraphNodeProps) {
  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[180px] cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-2 border-gray-300' : ''}`}
      onClick={data?.onClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="left"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
        <StickyNote className="w-4 h-4 text-emerald-500" />
      </div>
      <span className="text-gray-900 font-medium">
        {data?.label || 'Paragraph'}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="right"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

