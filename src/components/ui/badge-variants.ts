import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
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
        teal: 'border-[oklch(var(--oklch-teal)/0.18)] bg-[oklch(var(--oklch-teal)/0.12)] text-[oklch(var(--oklch-teal))] [a&]:hover:bg-[oklch(var(--oklch-teal)/0.16)]',
        green:
          'border-[oklch(var(--oklch-green)/0.18)] bg-[oklch(var(--oklch-green)/0.12)] text-[oklch(var(--oklch-green))] [a&]:hover:bg-[oklch(var(--oklch-green)/0.16)]',
        lime: 'border-[oklch(var(--oklch-lime)/0.18)] bg-[oklch(var(--oklch-lime)/0.12)] text-[oklch(var(--oklch-lime))] [a&]:hover:bg-[oklch(var(--oklch-lime)/0.16)]',
        orange:
          'border-[oklch(var(--oklch-orange)/0.18)] bg-[oklch(var(--oklch-orange)/0.12)] text-[oklch(var(--oklch-orange))] [a&]:hover:bg-[oklch(var(--oklch-orange)/0.16)]',
        pink: 'border-[oklch(var(--oklch-pink)/0.18)] bg-[oklch(var(--oklch-pink)/0.12)] text-[oklch(var(--oklch-pink))] [a&]:hover:bg-[oklch(var(--oklch-pink)/0.16)]',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        error:
          'text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30',
        info: 'border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90',
        success: 'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
        'success-light': 'border-transparent bg-success/15 text-success [a&]:hover:bg-success/20',
        'primary-light': 'border-transparent bg-primary/15 text-primary [a&]:hover:bg-primary/20',
        warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
        invert: 'border-transparent bg-invert text-invert-foreground [a&]:hover:bg-invert/90',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
      size: {
        xs: 'gap-0.5 px-1 py-px text-[10px] leading-tight [&>svg]:size-2',
        sm: 'gap-1 px-1.5 py-0.5 text-xs [&>svg]:size-2.5',
        default: 'gap-1 px-2 py-0.5 text-xs [&>svg]:size-3',
        lg: 'gap-1.5 px-2.5 py-1 text-sm [&>svg]:size-4',
        xl: 'gap-2 px-3 py-1.5 text-base [&>svg]:size-4',
        '2xl': 'gap-2 px-4 py-2 text-lg [&>svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const badgeDashedBorderVariants = cva('border-2 border-dashed', {
  variants: {
    variant: {
      default: 'border-primary/40',
      secondary: 'border-secondary-foreground/20',
      violet: 'border-[oklch(var(--oklch-violet)/0.45)]',
      indigo: 'border-[oklch(var(--oklch-indigo)/0.45)]',
      blue: 'border-[oklch(var(--oklch-blue)/0.45)]',
      darkblue: 'border-[oklch(var(--oklch-darkblue)/0.45)]',
      cyan: 'border-[oklch(var(--oklch-cyan)/0.45)]',
      teal: 'border-[oklch(var(--oklch-teal)/0.45)]',
      green: 'border-[oklch(var(--oklch-green)/0.45)]',
      lime: 'border-[oklch(var(--oklch-lime)/0.45)]',
      orange: 'border-[oklch(var(--oklch-orange)/0.45)]',
      pink: 'border-[oklch(var(--oklch-pink)/0.45)]',
      destructive: 'border-white/30',
      error: 'border-red-500/40',
      info: 'border-info/45',
      success: 'border-success/45',
      'success-light': 'border-success/35',
      'primary-light': 'border-primary/35',
      warning: 'border-warning/45',
      invert: 'border-invert/40',
      outline: 'border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
