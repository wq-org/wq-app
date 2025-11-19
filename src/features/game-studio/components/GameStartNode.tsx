import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { GameStartNodeProps } from '../types/game-studio.types';

export default function GameStartNode({ data, selected }: GameStartNodeProps) {
  return (
    <div 
      className={`relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[180px] cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-2 border-gray-300' : ''}`}
      onClick={data?.onClick}
    >
      <div className="p-2 rounded-lg border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
        <Play className="w-4 h-4 text-blue-500" />
      </div>
      <span className="text-gray-900 font-medium">Start</span>
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

