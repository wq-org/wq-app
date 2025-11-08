import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Use cleaner, more neutral gray shades instead of pure black.
// The "gray-800" is a deep, modern and softer neutral, but not as harsh as "black".
// You can add more variants for different grays if desired.
const pulsarVariants = cva(
  'relative',
  {
    variants: {
      variant: {
        gray: '[--pulsar-color:theme(colors.gray.800)]',
        light: '[--pulsar-color:theme(colors.gray.200)]',
        white: '[--pulsar-color:theme(colors.white)]',
      },
      size: {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
      },
    },
    defaultVariants: {
      variant: 'gray',
      size: 'md',
    },
  }
);

export interface PulsarLoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pulsarVariants> {
  /** Animation speed in milliseconds */
  speed?: number;
}

/**
 * PulsarLoading
 *
 * A pulsing loader animation with customizable color variants.
 * Based on the Pulsar loader from uiball.com/ldrs
 */
export default function PulsarLoading({
  className,
  variant,
  size,
  speed = 1750,
  ...props
}: PulsarLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(pulsarVariants({ variant, size }), className)}
      style={
        {
          '--pulsar-speed': `${speed}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>

      {/* Inline styles for the pulsar animation */}
      <style>{`
        @keyframes pulsar-pulse {
          0%, 100% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.25;
          }
        }
      `}</style>

      {/* First pulse circle */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-300 animate-[pulsar-pulse_var(--pulsar-speed)_ease-in-out_infinite] [transform:scale(0)]"
        style={{
          backgroundColor: 'var(--pulsar-color)',
          animationDuration: 'var(--pulsar-speed)',
        }}
      />

      {/* Second pulse circle (delayed) */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-300 animate-[pulsar-pulse_var(--pulsar-speed)_ease-in-out_infinite] [transform:scale(0)]"
        style={{
          backgroundColor: 'var(--pulsar-color)',
          animationDuration: 'var(--pulsar-speed)',
          animationDelay: 'calc(var(--pulsar-speed) / -2)',
        }}
      />
    </div>
  );
}

