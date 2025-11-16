import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface PinAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  onPinMove?: (position: { x: number; y: number }) => void;
}

export default function PinArea({
  className,
  children,
  onPinMove,
  ...props
}: PinAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const updatePosition = (e: React.MouseEvent | MouseEvent) => {
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Clamp to area bounds
      const clampedX = Math.max(0, Math.min(rect.width, x));
      const clampedY = Math.max(0, Math.min(rect.height, y));
      onPinMove?.({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if clicking directly on the pin
    if ((e.target as HTMLElement).closest('[data-pin]')) {
      return;
    }
    setIsDragging(true);
    updatePosition(e);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        updatePosition(e);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, onPinMove]);

  return (
    <div
      ref={areaRef}
      data-pin-area
      className={cn(
        'relative w-full h-full border-2 border-dashed border-gray-400 rounded-lg cursor-crosshair',
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </div>
  );
}

