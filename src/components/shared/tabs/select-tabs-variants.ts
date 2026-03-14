import { cva, type VariantProps } from 'class-variance-authority'

const tabToneVariants = {
  default: '',
  violet: '',
  indigo: '',
  blue: '',
  cyan: '',
  teal: '',
  green: '',
  lime: '',
  orange: '',
  pink: '',
  darkblue: '',
} as const

const activeToneClasses = {
  default: 'border-foreground',
  violet: 'border-[oklch(var(--oklch-violet))]',
  indigo: 'border-[oklch(var(--oklch-indigo))]',
  blue: 'border-[oklch(var(--oklch-blue))]',
  cyan: 'border-[oklch(var(--oklch-cyan))]',
  teal: 'border-[oklch(var(--oklch-teal))]',
  green: 'border-[oklch(var(--oklch-green))]',
  lime: 'border-[oklch(var(--oklch-lime))]',
  orange: 'border-[oklch(var(--oklch-orange))]',
  pink: 'border-[oklch(var(--oklch-pink))]',
  darkblue: 'border-blue-500 active:animate-in active:zoom-in-95',
} as const

const inactiveToneClasses = {
  default: 'border-transparent',
  violet: 'border-transparent',
  indigo: 'border-transparent',
  blue: 'border-transparent',
  cyan: 'border-transparent',
  teal: 'border-transparent',
  green: 'border-transparent',
  lime: 'border-transparent',
  orange: 'border-transparent',
  pink: 'border-transparent',
  darkblue: 'border-transparent',
} as const

const inactiveToneTextClasses = {
  default: 'text-muted-foreground group-hover:text-foreground',
  violet: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-violet))]',
  indigo: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-indigo))]',
  blue: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-blue))]',
  cyan: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-cyan))]',
  teal: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-teal))]',
  green: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-green))]',
  lime: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-lime))]',
  orange: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-orange))]',
  pink: 'text-muted-foreground group-hover:text-[oklch(var(--oklch-pink))]',
  darkblue: 'text-muted-foreground group-hover:text-blue-500',
} as const

const activeToneCompoundVariants = [
  { tone: 'default', active: true, className: activeToneClasses.default },
  { tone: 'violet', active: true, className: activeToneClasses.violet },
  { tone: 'indigo', active: true, className: activeToneClasses.indigo },
  { tone: 'blue', active: true, className: activeToneClasses.blue },
  { tone: 'cyan', active: true, className: activeToneClasses.cyan },
  { tone: 'teal', active: true, className: activeToneClasses.teal },
  { tone: 'green', active: true, className: activeToneClasses.green },
  { tone: 'lime', active: true, className: activeToneClasses.lime },
  { tone: 'orange', active: true, className: activeToneClasses.orange },
  { tone: 'pink', active: true, className: activeToneClasses.pink },
  { tone: 'darkblue', active: true, className: activeToneClasses.darkblue },
] as const

const inactiveToneCompoundVariants = [
  { tone: 'default', active: false, className: inactiveToneClasses.default },
  { tone: 'violet', active: false, className: inactiveToneClasses.violet },
  { tone: 'indigo', active: false, className: inactiveToneClasses.indigo },
  { tone: 'blue', active: false, className: inactiveToneClasses.blue },
  { tone: 'cyan', active: false, className: inactiveToneClasses.cyan },
  { tone: 'teal', active: false, className: inactiveToneClasses.teal },
  { tone: 'green', active: false, className: inactiveToneClasses.green },
  { tone: 'lime', active: false, className: inactiveToneClasses.lime },
  { tone: 'orange', active: false, className: inactiveToneClasses.orange },
  { tone: 'pink', active: false, className: inactiveToneClasses.pink },
  { tone: 'darkblue', active: false, className: inactiveToneClasses.darkblue },
] as const

export const selectTabsContainerVariants = cva('', {
  variants: {
    layout: {
      default: 'flex gap-12',
      compact: 'flex gap-4',
    },
  },
  defaultVariants: {
    layout: 'default',
  },
})

export const selectTabButtonVariants = cva(
  'group flex items-center gap-2 border-b-2 focus:outline-none transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      layout: {
        default: 'pb-2',
        compact: 'pb-1.5',
      },
      tone: tabToneVariants,
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [...activeToneCompoundVariants, ...inactiveToneCompoundVariants],
    defaultVariants: {
      layout: 'default',
      tone: 'default',
      active: false,
    },
  },
)

export const selectTabIconVariants = cva('', {
  variants: {
    tone: tabToneVariants,
    active: {
      true: '',
      false: '',
    },
    layout: {
      default: '',
      compact: 'size-4',
    },
  },
  compoundVariants: [
    {
      active: true,
      tone: 'default',
      className: 'text-foreground',
    },
    {
      active: true,
      tone: 'violet',
      className: 'text-[oklch(var(--oklch-violet))]',
    },
    {
      active: true,
      tone: 'indigo',
      className: 'text-[oklch(var(--oklch-indigo))]',
    },
    {
      active: true,
      tone: 'blue',
      className: 'text-[oklch(var(--oklch-blue))]',
    },
    {
      active: true,
      tone: 'cyan',
      className: 'text-[oklch(var(--oklch-cyan))]',
    },
    {
      active: true,
      tone: 'teal',
      className: 'text-[oklch(var(--oklch-teal))]',
    },
    {
      active: true,
      tone: 'green',
      className: 'text-[oklch(var(--oklch-green))]',
    },
    {
      active: true,
      tone: 'lime',
      className: 'text-[oklch(var(--oklch-lime))]',
    },
    {
      active: true,
      tone: 'orange',
      className: 'text-[oklch(var(--oklch-orange))]',
    },
    {
      active: true,
      tone: 'pink',
      className: 'text-[oklch(var(--oklch-pink))]',
    },
    {
      active: true,
      tone: 'darkblue',
      className: 'text-blue-500',
    },
    {
      active: false,
      tone: 'default',
      className: inactiveToneTextClasses.default,
    },
    {
      active: false,
      tone: 'violet',
      className: inactiveToneTextClasses.violet,
    },
    {
      active: false,
      tone: 'indigo',
      className: inactiveToneTextClasses.indigo,
    },
    {
      active: false,
      tone: 'blue',
      className: inactiveToneTextClasses.blue,
    },
    {
      active: false,
      tone: 'cyan',
      className: inactiveToneTextClasses.cyan,
    },
    {
      active: false,
      tone: 'teal',
      className: inactiveToneTextClasses.teal,
    },
    {
      active: false,
      tone: 'green',
      className: inactiveToneTextClasses.green,
    },
    {
      active: false,
      tone: 'lime',
      className: inactiveToneTextClasses.lime,
    },
    {
      active: false,
      tone: 'orange',
      className: inactiveToneTextClasses.orange,
    },
    {
      active: false,
      tone: 'pink',
      className: inactiveToneTextClasses.pink,
    },
    {
      active: false,
      tone: 'darkblue',
      className: inactiveToneTextClasses.darkblue,
    },
  ],
  defaultVariants: {
    tone: 'default',
    active: false,
    layout: 'default',
  },
})

export const selectTabTextVariants = cva('', {
  variants: {
    layout: {
      default: 'text-xl',
      compact: 'text-sm',
    },
    tone: tabToneVariants,
    active: {
      true: 'font-medium',
      false: 'font-medium',
    },
  },
  compoundVariants: [
    {
      active: true,
      tone: 'default',
      className: 'text-foreground font-medium',
    },
    {
      active: true,
      tone: 'violet',
      className: 'text-[oklch(var(--oklch-violet))] font-medium',
    },
    {
      active: true,
      tone: 'indigo',
      className: 'text-[oklch(var(--oklch-indigo))] font-medium',
    },
    {
      active: true,
      tone: 'blue',
      className: 'text-[oklch(var(--oklch-blue))] font-medium',
    },
    {
      active: true,
      tone: 'cyan',
      className: 'text-[oklch(var(--oklch-cyan))] font-medium',
    },
    {
      active: true,
      tone: 'teal',
      className: 'text-[oklch(var(--oklch-teal))] font-medium',
    },
    {
      active: true,
      tone: 'green',
      className: 'text-[oklch(var(--oklch-green))] font-medium',
    },
    {
      active: true,
      tone: 'lime',
      className: 'text-[oklch(var(--oklch-lime))] font-medium',
    },
    {
      active: true,
      tone: 'orange',
      className: 'text-[oklch(var(--oklch-orange))] font-medium',
    },
    {
      active: true,
      tone: 'pink',
      className: 'text-[oklch(var(--oklch-pink))] font-medium',
    },
    {
      active: true,
      tone: 'darkblue',
      className: 'text-blue-500 font-medium',
    },
    {
      active: false,
      tone: 'default',
      className: inactiveToneTextClasses.default,
    },
    {
      active: false,
      tone: 'violet',
      className: inactiveToneTextClasses.violet,
    },
    {
      active: false,
      tone: 'indigo',
      className: inactiveToneTextClasses.indigo,
    },
    {
      active: false,
      tone: 'blue',
      className: inactiveToneTextClasses.blue,
    },
    {
      active: false,
      tone: 'cyan',
      className: inactiveToneTextClasses.cyan,
    },
    {
      active: false,
      tone: 'teal',
      className: inactiveToneTextClasses.teal,
    },
    {
      active: false,
      tone: 'green',
      className: inactiveToneTextClasses.green,
    },
    {
      active: false,
      tone: 'lime',
      className: inactiveToneTextClasses.lime,
    },
    {
      active: false,
      tone: 'orange',
      className: inactiveToneTextClasses.orange,
    },
    {
      active: false,
      tone: 'pink',
      className: inactiveToneTextClasses.pink,
    },
    {
      active: false,
      tone: 'darkblue',
      className: inactiveToneTextClasses.darkblue,
    },
  ],
  defaultVariants: {
    layout: 'default',
    tone: 'default',
    active: false,
  },
})

export type SelectTabsLayoutVariant = VariantProps<typeof selectTabsContainerVariants>['layout']
export type SelectTabsColorVariant = VariantProps<typeof selectTabButtonVariants>['tone']
