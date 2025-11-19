import { Handle, Position } from '@xyflow/react';
import { MapPin } from 'lucide-react';

interface GameImagePinNodeProps {
  data?: {
    label?: string;
    onClick?: () => void;
    gameType?: string;
  };
}

export default function GameImagePinNode({ data }: GameImagePinNodeProps) {
  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[120px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={data?.onClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-800 !border-2 !border-white"
        id="top"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-emerald-500" />
      </div>
      <span className="text-gray-900 font-medium">
        {data?.label || 'Image and Pin'}
      </span>
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

