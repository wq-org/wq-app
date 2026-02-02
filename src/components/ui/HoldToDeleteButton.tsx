"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldToDeleteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onDelete?: () => void;
  holdDuration?: number;
}

function HoldToDeleteButton({
  className,
  onDelete,
  holdDuration = 3000,
  children,
  ...props
}: HoldToDeleteButtonProps) {
  const [isHolding, setIsHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const holdStartRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const startHold = React.useCallback(() => {
    setIsHolding(true);
    holdStartRef.current = Date.now();

    const animate = () => {
      if (holdStartRef.current === null) return;

      const elapsed = Date.now() - holdStartRef.current;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        onDelete?.();
        resetHold();
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [holdDuration, onDelete]);

  const resetHold = React.useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    holdStartRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden",
        "h-14 px-8 rounded-full",
        "bg-gray-100 text-red-500",
        "font-medium text-lg",
        "select-none cursor-pointer",
        "transition-shadow duration-200",
        "hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onMouseDown={startHold}
      onMouseUp={resetHold}
      onMouseLeave={resetHold}
      onTouchStart={startHold}
      onTouchEnd={resetHold}
      onTouchCancel={resetHold}
      {...props}
    >
      {/* Progress fill background */}
      <span
        className={cn(
          "absolute inset-0 bg-red-200 origin-left",
          isHolding ? "transition-none" : "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: `scaleX(${progress / 100})`,
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        <Trash2 className="size-5" />
        <span>{children ?? "Hold to Delete"}</span>
      </span>
    </button>
  );
}

export { HoldToDeleteButton };
