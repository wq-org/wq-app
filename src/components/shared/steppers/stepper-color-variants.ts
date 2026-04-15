import { cva } from 'class-variance-authority'

export const stepperColorVariants = [
  'default',
  'darkblue',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
  'success-light',
] as const

export type StepperColorVariant = (typeof stepperColorVariants)[number]

export const stepperIndicatorColorVariants = cva('data-[state=inactive]:text-muted-foreground', {
  variants: {
    colorVariant: {
      default:
        'data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=completed]:border-foreground data-[state=completed]:bg-foreground data-[state=completed]:text-background',
      darkblue:
        'data-[state=active]:border-[oklch(var(--oklch-darkblue))] data-[state=active]:bg-[oklch(var(--oklch-darkblue))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-darkblue))] data-[state=completed]:bg-[oklch(var(--oklch-darkblue))] data-[state=completed]:text-white',
      violet:
        'data-[state=active]:border-[oklch(var(--oklch-violet))] data-[state=active]:bg-[oklch(var(--oklch-violet))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-violet))] data-[state=completed]:bg-[oklch(var(--oklch-violet))] data-[state=completed]:text-white',
      indigo:
        'data-[state=active]:border-[oklch(var(--oklch-indigo))] data-[state=active]:bg-[oklch(var(--oklch-indigo))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-indigo))] data-[state=completed]:bg-[oklch(var(--oklch-indigo))] data-[state=completed]:text-white',
      blue: 'data-[state=active]:border-[oklch(var(--oklch-blue))] data-[state=active]:bg-[oklch(var(--oklch-blue))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-blue))] data-[state=completed]:bg-[oklch(var(--oklch-blue))] data-[state=completed]:text-white',
      cyan: 'data-[state=active]:border-[oklch(var(--oklch-cyan))] data-[state=active]:bg-[oklch(var(--oklch-cyan))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-cyan))] data-[state=completed]:bg-[oklch(var(--oklch-cyan))] data-[state=completed]:text-white',
      teal: 'data-[state=active]:border-[oklch(var(--oklch-teal))] data-[state=active]:bg-[oklch(var(--oklch-teal))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-teal))] data-[state=completed]:bg-[oklch(var(--oklch-teal))] data-[state=completed]:text-white',
      green:
        'data-[state=active]:border-[oklch(var(--oklch-green))] data-[state=active]:bg-[oklch(var(--oklch-green))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-green))] data-[state=completed]:bg-[oklch(var(--oklch-green))] data-[state=completed]:text-white',
      lime: 'data-[state=active]:border-[oklch(var(--oklch-lime))] data-[state=active]:bg-[oklch(var(--oklch-lime))] data-[state=active]:text-black data-[state=completed]:border-[oklch(var(--oklch-lime))] data-[state=completed]:bg-[oklch(var(--oklch-lime))] data-[state=completed]:text-black',
      orange:
        'data-[state=active]:border-[oklch(var(--oklch-orange))] data-[state=active]:bg-[oklch(var(--oklch-orange))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-orange))] data-[state=completed]:bg-[oklch(var(--oklch-orange))] data-[state=completed]:text-white',
      pink: 'data-[state=active]:border-[oklch(var(--oklch-pink))] data-[state=active]:bg-[oklch(var(--oklch-pink))] data-[state=active]:text-white data-[state=completed]:border-[oklch(var(--oklch-pink))] data-[state=completed]:bg-[oklch(var(--oklch-pink))] data-[state=completed]:text-white',
      'success-light':
        'data-[state=active]:border-success data-[state=active]:bg-success/15 data-[state=active]:text-success data-[state=completed]:border-success data-[state=completed]:bg-success data-[state=completed]:text-success-foreground',
    },
  },
  defaultVariants: {
    colorVariant: 'default',
  },
})

export const stepperSeparatorColorVariants = cva('', {
  variants: {
    colorVariant: {
      default: 'group-data-[state=completed]/step:bg-foreground',
      darkblue: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-darkblue))]',
      violet: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-violet))]',
      indigo: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-indigo))]',
      blue: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-blue))]',
      cyan: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-cyan))]',
      teal: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-teal))]',
      green: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-green))]',
      lime: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-lime))]',
      orange: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-orange))]',
      pink: 'group-data-[state=completed]/step:bg-[oklch(var(--oklch-pink))]',
      'success-light': 'group-data-[state=completed]/step:bg-success',
    },
  },
  defaultVariants: {
    colorVariant: 'default',
  },
})

export const stepperProgressBarIndicatorColorVariants = cva('', {
  variants: {
    colorVariant: {
      default: 'data-[state=active]:bg-foreground data-[state=completed]:bg-foreground',
      darkblue:
        'data-[state=active]:bg-[oklch(var(--oklch-darkblue))] data-[state=completed]:bg-[oklch(var(--oklch-darkblue))]',
      violet:
        'data-[state=active]:bg-[oklch(var(--oklch-violet))] data-[state=completed]:bg-[oklch(var(--oklch-violet))]',
      indigo:
        'data-[state=active]:bg-[oklch(var(--oklch-indigo))] data-[state=completed]:bg-[oklch(var(--oklch-indigo))]',
      blue: 'data-[state=active]:bg-[oklch(var(--oklch-blue))] data-[state=completed]:bg-[oklch(var(--oklch-blue))]',
      cyan: 'data-[state=active]:bg-[oklch(var(--oklch-cyan))] data-[state=completed]:bg-[oklch(var(--oklch-cyan))]',
      teal: 'data-[state=active]:bg-[oklch(var(--oklch-teal))] data-[state=completed]:bg-[oklch(var(--oklch-teal))]',
      green:
        'data-[state=active]:bg-[oklch(var(--oklch-green))] data-[state=completed]:bg-[oklch(var(--oklch-green))]',
      lime: 'data-[state=active]:bg-[oklch(var(--oklch-lime))] data-[state=completed]:bg-[oklch(var(--oklch-lime))]',
      orange:
        'data-[state=active]:bg-[oklch(var(--oklch-orange))] data-[state=completed]:bg-[oklch(var(--oklch-orange))]',
      pink: 'data-[state=active]:bg-[oklch(var(--oklch-pink))] data-[state=completed]:bg-[oklch(var(--oklch-pink))]',
      'success-light': 'data-[state=active]:bg-success/35 data-[state=completed]:bg-success',
    },
  },
  defaultVariants: {
    colorVariant: 'default',
  },
})

export const stepperStatusBadgeVariants = cva('', {
  variants: {
    colorVariant: {
      default: 'bg-foreground/12 text-foreground',
      darkblue: 'bg-[oklch(var(--oklch-darkblue)/0.14)] text-[oklch(var(--oklch-darkblue))]',
      violet: 'bg-[oklch(var(--oklch-violet)/0.14)] text-[oklch(var(--oklch-violet))]',
      indigo: 'bg-[oklch(var(--oklch-indigo)/0.14)] text-[oklch(var(--oklch-indigo))]',
      blue: 'bg-[oklch(var(--oklch-blue)/0.14)] text-[oklch(var(--oklch-blue))]',
      cyan: 'bg-[oklch(var(--oklch-cyan)/0.14)] text-[oklch(var(--oklch-cyan))]',
      teal: 'bg-[oklch(var(--oklch-teal)/0.14)] text-[oklch(var(--oklch-teal))]',
      green: 'bg-[oklch(var(--oklch-green)/0.14)] text-[oklch(var(--oklch-green))]',
      lime: 'bg-[oklch(var(--oklch-lime)/0.2)] text-[oklch(var(--oklch-lime))]',
      orange: 'bg-[oklch(var(--oklch-orange)/0.14)] text-[oklch(var(--oklch-orange))]',
      pink: 'bg-[oklch(var(--oklch-pink)/0.14)] text-[oklch(var(--oklch-pink))]',
      'success-light': 'bg-success/15 text-success',
    },
  },
  defaultVariants: {
    colorVariant: 'default',
  },
})
