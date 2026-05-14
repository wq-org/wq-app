// separator-variants.ts
import { cva, type VariantProps } from 'class-variance-authority'

// ─── CVA Separator Variants ──────────────────────────────────────────────────

export const separatorVariants = cva(
  'shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
  {
    variants: {
      variant: {
        // Semantic / system tokens
        default: 'bg-border',
        muted: 'bg-border/50',
        destructive: 'bg-destructive/40',
        primary: 'bg-primary/40',

        // OKLCH spectral palette — mirrors button-variants.ts
        violet: 'bg-[oklch(var(--oklch-violet)/0.35)] dark:bg-[oklch(var(--oklch-violet)/0.25)]',
        indigo: 'bg-[oklch(var(--oklch-indigo)/0.35)] dark:bg-[oklch(var(--oklch-indigo)/0.25)]',
        blue: 'bg-[oklch(var(--oklch-blue)/0.35)] dark:bg-[oklch(var(--oklch-blue)/0.25)]',
        cyan: 'bg-[oklch(var(--oklch-cyan)/0.35)] dark:bg-[oklch(var(--oklch-cyan)/0.25)]',
        teal: 'bg-[oklch(var(--oklch-teal)/0.35)] dark:bg-[oklch(var(--oklch-teal)/0.25)]',
        green: 'bg-[oklch(var(--oklch-green)/0.35)] dark:bg-[oklch(var(--oklch-green)/0.25)]',
        lime: 'bg-[oklch(var(--oklch-lime)/0.35)] dark:bg-[oklch(var(--oklch-lime)/0.25)]',
        orange: 'bg-[oklch(var(--oklch-orange)/0.35)] dark:bg-[oklch(var(--oklch-orange)/0.25)]',
        pink: 'bg-[oklch(var(--oklch-pink)/0.35)] dark:bg-[oklch(var(--oklch-pink)/0.25)]',
      },

      // Thickness — vertical vs horizontal contexts
      size: {
        thin: 'data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
        default: 'data-[orientation=horizontal]:h-[1.5px] data-[orientation=vertical]:w-[1.5px]',
        thick: 'data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5',
      },

      // Optional visual emphasis
      glow: {
        none: '',
        sm: [
          'data-[orientation=horizontal]:shadow-[0_0_4px_0_currentColor]',
          'data-[orientation=vertical]:shadow-[4px_0_4px_0_currentColor]',
        ].join(' '),
        md: [
          'data-[orientation=horizontal]:shadow-[0_0_8px_1px_currentColor]',
          'data-[orientation=vertical]:shadow-[8px_0_8px_1px_currentColor]',
        ].join(' '),
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
      glow: 'none',
    },
  },
)

export type SeparatorVariants = VariantProps<typeof separatorVariants>
