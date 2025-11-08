import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'origin-center overflow-visible will-change-transform',
  {
    variants: {
      variant: {
        gray: '[--uib-color:theme(colors.gray.800)]',
        light: '[--uib-color:theme(colors.gray.200)]',
        white: '[--uib-color:theme(colors.white)]',
        black: '[--uib-color:theme(colors.black)]',
      },
      size: {
        sm: 'h-6 w-6 [--uib-size:24px] [--stroke-width:2px]',
        md: 'h-10 w-10 [--uib-size:40px] [--stroke-width:3px]',
        lg: 'h-16 w-16 [--uib-size:64px] [--stroke-width:4px]',
        xl: 'h-24 w-24 [--uib-size:96px] [--stroke-width:5px]',
      },
    },
    defaultVariants: {
      variant: 'gray',
      size: 'md',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Animation speed in milliseconds (default: 2000ms = 2s) */
  speed?: number;
}

/**
 * Spinner
 *
 * A circular loading spinner with customizable color variants and sizes.
 * Based on the Orbit loader animation with stroke-dasharray effect.
 */
export default function Spinner({
  className,
  variant,
  size,
  speed = 2000,
  ...props
}: SpinnerProps) {
  const sizeValue = size === 'sm' ? 24 : size === 'lg' ? 64 : size === 'xl' ? 96 : 40;
  const strokeWidth = size === 'sm' ? 2 : size === 'lg' ? 4 : size === 'xl' ? 5 : 3;
  const radius = (sizeValue - strokeWidth) / 2;
  const center = sizeValue / 2;
  // Convert milliseconds to seconds for CSS animation
  const speedInSeconds = speed / 1000;

  return (
    <>
      <style>{`
        @keyframes spinner-rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes spinner-stretch {
          0% {
            stroke-dasharray: 0, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 75, 150;
            stroke-dashoffset: -25;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading"
        className={cn(spinnerVariants({ variant, size }), className)}
        style={
          {
            '--uib-speed': `${speedInSeconds}s`,
            animation: `spinner-rotate var(--uib-speed) linear infinite`,
          } as React.CSSProperties
        }
        {...props}
      >
        <span className="sr-only">Loading...</span>
        <svg
          viewBox={`0 0 ${sizeValue} ${sizeValue}`}
          height={sizeValue}
          width={sizeValue}
          className="h-full w-full"
        >
          <circle
            className="track"
            cx={center}
            cy={center}
            r={radius}
            pathLength="100"
            fill="none"
            style={
              {
                stroke: 'var(--uib-color)',
                strokeWidth: `var(--stroke-width)`,
                opacity: 0,
                transition: 'stroke 0.5s ease',
              } as React.CSSProperties
            }
          />
          <circle
            className="car"
            cx={center}
            cy={center}
            r={radius}
            pathLength="100"
            fill="none"
            style={
              {
                stroke: 'var(--uib-color)',
                strokeWidth: `var(--stroke-width)`,
                strokeLinecap: 'round',
                strokeDasharray: '1, 200',
                strokeDashoffset: 0,
                animation: `spinner-stretch calc(var(--uib-speed) * 0.75) ease-in-out infinite`,
                willChange: 'stroke-dasharray, stroke-dashoffset',
                transition: 'stroke 0.5s ease',
              } as React.CSSProperties
            }
          />
        </svg>
      </div>
    </>
  );
}
