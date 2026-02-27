import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        violet:
          'border-[oklch(var(--oklch-violet)/0.18)] bg-[oklch(var(--oklch-violet)/0.12)] text-[oklch(var(--oklch-violet))] [a&]:hover:bg-[oklch(var(--oklch-violet)/0.16)]',
        indigo:
          'border-[oklch(var(--oklch-indigo)/0.18)] bg-[oklch(var(--oklch-indigo)/0.12)] text-[oklch(var(--oklch-indigo))] [a&]:hover:bg-[oklch(var(--oklch-indigo)/0.16)]',
        blue: 'border-[oklch(var(--oklch-blue)/0.18)] bg-[oklch(var(--oklch-blue)/0.12)] text-[oklch(var(--oklch-blue))] [a&]:hover:bg-[oklch(var(--oklch-blue)/0.16)]',
        darkblue:
          'border-[oklch(var(--oklch-darkblue)/0.18)] bg-[oklch(var(--oklch-darkblue)/0.12)] text-[oklch(var(--oklch-darkblue))] [a&]:hover:bg-[oklch(var(--oklch-darkblue)/0.16)]',
        cyan: 'border-[oklch(var(--oklch-cyan)/0.18)] bg-[oklch(var(--oklch-cyan)/0.12)] text-[oklch(var(--oklch-cyan))] [a&]:hover:bg-[oklch(var(--oklch-cyan)/0.16)]',
        green:
          'border-[oklch(var(--oklch-green)/0.18)] bg-[oklch(var(--oklch-green)/0.12)] text-[oklch(var(--oklch-green))] [a&]:hover:bg-[oklch(var(--oklch-green)/0.16)]',
        lime: 'border-[oklch(var(--oklch-lime)/0.18)] bg-[oklch(var(--oklch-lime)/0.12)] text-[oklch(var(--oklch-lime))] [a&]:hover:bg-[oklch(var(--oklch-lime)/0.16)]',
        orange:
          'border-[oklch(var(--oklch-orange)/0.18)] bg-[oklch(var(--oklch-orange)/0.12)] text-[oklch(var(--oklch-orange))] [a&]:hover:bg-[oklch(var(--oklch-orange)/0.16)]',
        pink: 'border-[oklch(var(--oklch-pink)/0.18)] bg-[oklch(var(--oklch-pink)/0.12)] text-[oklch(var(--oklch-pink))] [a&]:hover:bg-[oklch(var(--oklch-pink)/0.16)]',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
