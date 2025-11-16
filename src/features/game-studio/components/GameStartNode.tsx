import { Play } from 'lucide-react';

interface GameStartNodeProps {
  data?: { 
    onClick?: () => void;
  };
}

export default function GameStartNode({ data }: GameStartNodeProps) {
  return (
    <div 
      className="relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[120px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={data?.onClick}
    >
      <div className="p-2 rounded-lg border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
        <Play className="w-4 h-4 text-blue-500" />
      </div>
      <span className="text-gray-900 font-medium">Start</span>
    </div>
  );
}

