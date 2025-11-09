import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

interface GameStartNodeProps {
  data?: { 
    label?: string;
    onClick?: () => void;
  };
}

export default function GameStartNode({ data }: GameStartNodeProps) {
  return (
    <div 
      className="relative flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-800 shadow-sm min-w-[120px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={data?.onClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="top"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="p-2 rounded-lg bg-green-700/15 flex items-center justify-center">
        <Play className="w-4 h-4 text-green-700 fill-green-700" />
      </div>
      <span className="text-gray-900 font-medium">{data?.label || 'Start'}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="bottom"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

