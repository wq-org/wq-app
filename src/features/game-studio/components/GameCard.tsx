import { Card } from '@/components/ui/card';
import { ArrowRight, Coffee, CheckCircle, Flag } from 'lucide-react';

export interface GameCardProps {
  id: string;
  title: string;
  description: string;
  route?: string;
  button: string;
  onPlay?: () => void;
}

export default function GameCard({
  id: _id,
  title,
  description,
  route: _route,
  button,
  onPlay,
}: GameCardProps) {
  return (
    <Card 
      className="max-w-md w-full p-8 shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow"
    >
      {/* Avatar Group */}
      <div className="relative h-40 mb-8">
        {/* Top Left - Avatar with coffee icon */}
        <div className="absolute left-4 top-0 w-16 h-16 rounded-full bg-[#FFD4D4] overflow-hidden flex items-center justify-center">
          <span className="text-3xl">😎</span>
          <div className="absolute -right-2 -top-2 w-8 h-8 bg-[#B8B8FF] rounded-full flex items-center justify-center shadow-md">
            <Coffee className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Top Middle - Purple avatar with checkmark */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-20 rounded-full bg-[#E8B8E8] p-2">
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            <div className="text-4xl">🧕</div>
          </div>
          <div className="absolute -bottom-1 right-2 w-8 h-8 bg-[#B8B8FF] rounded-full flex items-center justify-center shadow-md">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Top Right - Light blue avatar with flag */}
        <div className="absolute right-4 top-2 w-20 h-20 rounded-full bg-[#C0E8FF] p-2">
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            <div className="text-4xl">👨‍💼</div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FFB8D8] rounded-full flex items-center justify-center shadow-md">
            <Flag className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
          {title}
        </h2>
        <p className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
          {description}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          className="inline-flex items-center gap-1 text-blue-500 hover:opacity-80 font-medium text-sm transition-opacity"
        >
          {button}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
