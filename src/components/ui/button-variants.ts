import { cva } from 'class-variance-authority'

export const inheritBlueContent = '[&_span]:text-blue-500 [&_p]:text-blue-500 [&_svg]:text-blue-500'
const inheritVioletContent =
  '[&_span]:text-[oklch(var(--oklch-violet))] [&_p]:text-[oklch(var(--oklch-violet))] [&_svg]:text-[oklch(var(--oklch-violet))]'
const inheritIndigoContent =
  '[&_span]:text-[oklch(var(--oklch-indigo))] [&_p]:text-[oklch(var(--oklch-indigo))] [&_svg]:text-[oklch(var(--oklch-indigo))]'
const inheritBlueOklchContent =
  '[&_span]:text-[oklch(var(--oklch-blue))] [&_p]:text-[oklch(var(--oklch-blue))] [&_svg]:text-[oklch(var(--oklch-blue))]'
const inheritCyanContent =
  '[&_span]:text-[oklch(var(--oklch-cyan))] [&_p]:text-[oklch(var(--oklch-cyan))] [&_svg]:text-[oklch(var(--oklch-cyan))]'
const inheritTealContent =
  '[&_span]:text-[oklch(var(--oklch-teal))] [&_p]:text-[oklch(var(--oklch-teal))] [&_svg]:text-[oklch(var(--oklch-teal))]'
const inheritGreenContent =
  '[&_span]:text-[oklch(var(--oklch-green))] [&_p]:text-[oklch(var(--oklch-green))] [&_svg]:text-[oklch(var(--oklch-green))]'
const inheritLimeContent =
  '[&_span]:text-[oklch(var(--oklch-lime))] [&_p]:text-[oklch(var(--oklch-lime))] [&_svg]:text-[oklch(var(--oklch-lime))]'
const inheritOrangeContent =
  '[&_span]:text-[oklch(var(--oklch-orange))] [&_p]:text-[oklch(var(--oklch-orange))] [&_svg]:text-[oklch(var(--oklch-orange))]'
const inheritPinkContent =
  '[&_span]:text-[oklch(var(--oklch-pink))] [&_p]:text-[oklch(var(--oklch-pink))] [&_svg]:text-[oklch(var(--oklch-pink))]'

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        delete:
          'text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30',
        confirm:
          'text-blue-500 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30',
        active: '!h-auto text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-50',
        darkblue: `text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritBlueContent}`,
        violet: `border-0 bg-transparent text-[oklch(var(--oklch-violet))] hover:opacity-80 hover:bg-[oklch(var(--oklch-violet)/0.12)] hover:text-[oklch(var(--oklch-violet))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritVioletContent}`,
        indigo: `border-0 bg-transparent text-[oklch(var(--oklch-indigo))] hover:opacity-80 hover:bg-[oklch(var(--oklch-indigo)/0.12)] hover:text-[oklch(var(--oklch-indigo))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritIndigoContent}`,
        blue: `border-0 bg-transparent text-[oklch(var(--oklch-blue))] hover:opacity-80 hover:bg-[oklch(var(--oklch-blue)/0.12)] hover:text-[oklch(var(--oklch-blue))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritBlueOklchContent}`,
        cyan: `border-0 bg-transparent text-[oklch(var(--oklch-cyan))] hover:opacity-80 hover:bg-[oklch(var(--oklch-cyan)/0.12)] hover:text-[oklch(var(--oklch-cyan))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritCyanContent}`,
        teal: `border-0 bg-transparent text-[oklch(var(--oklch-teal))] hover:opacity-80 hover:bg-[oklch(var(--oklch-teal)/0.12)] hover:text-[oklch(var(--oklch-teal))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritTealContent}`,
        green: `border-0 bg-transparent text-[oklch(var(--oklch-green))] hover:opacity-80 hover:bg-[oklch(var(--oklch-green)/0.12)] hover:text-[oklch(var(--oklch-green))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritGreenContent}`,
        lime: `border-0 bg-transparent text-[oklch(var(--oklch-lime))] hover:opacity-80 hover:bg-[oklch(var(--oklch-lime)/0.12)] hover:text-[oklch(var(--oklch-lime))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritLimeContent}`,
        orange: `border-0 bg-transparent text-[oklch(var(--oklch-orange))] hover:opacity-80 hover:bg-[oklch(var(--oklch-orange)/0.12)] hover:text-[oklch(var(--oklch-orange))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritOrangeContent}`,
        pink: `border-0 bg-transparent text-[oklch(var(--oklch-pink))] hover:opacity-80 hover:bg-[oklch(var(--oklch-pink)/0.12)] hover:text-[oklch(var(--oklch-pink))] transition-all duration-200 active:animate-in active:zoom-in-95 ${inheritPinkContent}`,
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
