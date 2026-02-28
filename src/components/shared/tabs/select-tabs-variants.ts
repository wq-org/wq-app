import { cva, type VariantProps } from 'class-variance-authority'

const activeToneClasses = {
  default: 'border-black text-black',
  violet: 'border-[oklch(var(--oklch-violet))] text-[oklch(var(--oklch-violet))]',
  indigo: 'border-[oklch(var(--oklch-indigo))] text-[oklch(var(--oklch-indigo))]',
  blue: 'border-[oklch(var(--oklch-blue))] text-[oklch(var(--oklch-blue))]',
  cyan: 'border-[oklch(var(--oklch-cyan))] text-[oklch(var(--oklch-cyan))]',
  teal: 'border-[oklch(var(--oklch-teal))] text-[oklch(var(--oklch-teal))]',
  green: 'border-[oklch(var(--oklch-green))] text-[oklch(var(--oklch-green))]',
  lime: 'border-[oklch(var(--oklch-lime))] text-[oklch(var(--oklch-lime))]',
  orange: 'border-[oklch(var(--oklch-orange))] text-[oklch(var(--oklch-orange))]',
  pink: 'border-[oklch(var(--oklch-pink))] text-[oklch(var(--oklch-pink))]',
  darkblue: 'border-blue-500 text-blue-500 active:animate-in active:zoom-in-95',
} as const

const inactiveToneHoverClasses = {
  default:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-black/60 hover:[&_span]:text-black/60',
  violet:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-violet)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-violet)/0.6)]',
  indigo:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-indigo)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-indigo)/0.6)]',
  blue: 'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-blue)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-blue)/0.6)]',
  cyan: 'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-cyan)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-cyan)/0.6)]',
  teal: 'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-teal)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-teal)/0.6)]',
  green:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-green)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-green)/0.6)]',
  lime: 'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-lime)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-lime)/0.6)]',
  orange:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-orange)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-orange)/0.6)]',
  pink: 'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-[oklch(var(--oklch-pink)/0.6)] hover:[&_span]:text-[oklch(var(--oklch-pink)/0.6)]',
  darkblue:
    'border-transparent [&_svg]:text-black/40 [&_span]:text-black/40 hover:[&_svg]:text-blue-500/60 hover:[&_span]:text-blue-500/60 transition-colors duration-200',
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
  { tone: 'default', active: false, className: inactiveToneHoverClasses.default },
  { tone: 'violet', active: false, className: inactiveToneHoverClasses.violet },
  { tone: 'indigo', active: false, className: inactiveToneHoverClasses.indigo },
  { tone: 'blue', active: false, className: inactiveToneHoverClasses.blue },
  { tone: 'cyan', active: false, className: inactiveToneHoverClasses.cyan },
  { tone: 'teal', active: false, className: inactiveToneHoverClasses.teal },
  { tone: 'green', active: false, className: inactiveToneHoverClasses.green },
  { tone: 'lime', active: false, className: inactiveToneHoverClasses.lime },
  { tone: 'orange', active: false, className: inactiveToneHoverClasses.orange },
  { tone: 'pink', active: false, className: inactiveToneHoverClasses.pink },
  { tone: 'darkblue', active: false, className: inactiveToneHoverClasses.darkblue },
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
  'flex items-center gap-2 border-b-2 focus:outline-none transition-all',
  {
    variants: {
      layout: {
        default: 'pb-2',
        compact: 'pb-1.5',
      },
      tone: activeToneClasses,
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
    tone: {
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
    },
    active: {
      true: '',
      false: 'text-black/40',
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
      className: 'text-black',
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
      className: 'text-black/40',
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
    tone: {
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
    },
    active: {
      true: 'font-medium',
      false: 'text-black/40 font-medium',
    },
  },
  compoundVariants: [
    {
      active: true,
      tone: 'default',
      className: 'text-black font-medium',
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
      className: 'text-black/40',
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
