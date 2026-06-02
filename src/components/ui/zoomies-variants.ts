import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Color tokens aligned with `button-variants` oklch theme colors.
 * `default` follows `--foreground` (same idea as `Text` color `default` / semantic text).
 */
export const zoomiesVariants = cva(
  [
    'relative flex items-center justify-center overflow-hidden transform-gpu',
    '[height:var(--uib-stroke)] [width:var(--uib-size)] [border-radius:calc(var(--uib-stroke)/2)]',
  ].join(' '),
  {
    variants: {
      color: {
        default: '[--uib-color:var(--foreground)]',
        black: '[--uib-color:black]',
        violet: '[--uib-color:oklch(var(--oklch-violet))]',
        indigo: '[--uib-color:oklch(var(--oklch-indigo))]',
        blue: '[--uib-color:oklch(var(--oklch-blue))]',
        cyan: '[--uib-color:oklch(var(--oklch-cyan))]',
        teal: '[--uib-color:oklch(var(--oklch-teal))]',
        green: '[--uib-color:oklch(var(--oklch-green))]',
        lime: '[--uib-color:oklch(var(--oklch-lime))]',
        orange: '[--uib-color:oklch(var(--oklch-orange))]',
        pink: '[--uib-color:oklch(var(--oklch-pink))]',
        darkblue: '[--uib-color:oklch(var(--oklch-darkblue))]',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
)

export type ZoomiesColorVariant = NonNullable<VariantProps<typeof zoomiesVariants>['color']>
