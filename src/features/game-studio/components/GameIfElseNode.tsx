import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface GameIfElseNodeProps {
  data?: {
    label?: string;
    onClick?: () => void;
    condition?: string;
  };
  selected?: boolean;
}

export default function GameIfElseNode({ data, selected }: GameIfElseNodeProps) {
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
      <div className="p-2 rounded-lg border border-orange-500/20 bg-orange-500/10 flex items-center justify-center">
        <GitBranch className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-900 font-medium">
          {data?.label || 'If / else'}
        </span>
        {data?.condition && (
          <span className="text-xs text-gray-500">{data.condition}</span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="right-top"
        onClick={(e) => e.stopPropagation()}
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="right-bottom"
        onClick={(e) => e.stopPropagation()}
        style={{ top: '70%' }}
      />
    </div>
  );
}
