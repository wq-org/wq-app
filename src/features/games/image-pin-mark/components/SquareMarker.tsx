import { cn } from '@/lib/utils';

export interface SquareMarkerProps {
  number: number;
  x: number;
  y: number;
  onDelete?: () => void;
  className?: string;
  pointerEvents?: 'auto' | 'none';
}

export default function SquareMarker({
  number,
  x,
  y,
  onDelete,
  className,
  pointerEvents = 'auto',
}: SquareMarkerProps) {
  return (
    <div
      className={cn(
        'absolute flex items-center justify-center rounded-lg border-2 border-white bg-white/80 backdrop-blur-sm shadow-lg',
        'w-20 h-20 text-xl font-bold text-gray-900',
        pointerEvents === 'none' && 'pointer-events-none',
        className
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={(e) => {
        if (pointerEvents === 'auto') {
          e.stopPropagation();
          onDelete?.();
        }
      }}
    >
      {number}
    </div>
  );
}

