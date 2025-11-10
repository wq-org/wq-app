import { Handle, Position } from '@xyflow/react';
import { Gamepad2 } from 'lucide-react';

interface GameActionNodeProps {
  data?: {
    label?: string;
    onClick?: () => void;
    gameType?: string;
  };
}

export default function GameActionNode({ data }: GameActionNodeProps) {
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
      <div className="p-2 rounded-lg bg-purple-700/15 flex items-center justify-center">
        <Gamepad2 className="w-4 h-4 text-purple-700 fill-purple-700" />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-900 font-medium text-sm">
          {data?.label || 'Action'}
        </span>
        {data?.gameType && (
          <span className="text-xs text-gray-500">{data.gameType}</span>
        )}
      </div>
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

