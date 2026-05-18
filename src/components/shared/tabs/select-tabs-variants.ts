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

// Underline animates left-to-right via scaleX on the ::after pseudo-element.
// The button sets text-[color] when active so after:bg-current picks up the right hue.
export const selectTabButtonVariants = cva(
  "group relative flex items-center gap-2 focus:outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-out",
  {
    variants: {
      layout: {
        default: 'pb-2',
        compact: 'pb-1.5',
      },
      tone: tabToneVariants,
      active: {
        true: 'after:scale-x-100',
        false: 'after:scale-x-0',
      },
    },
    compoundVariants: [
      { tone: 'default', active: true, className: 'text-foreground' },
      { tone: 'violet', active: true, className: 'text-[oklch(var(--oklch-violet))]' },
      { tone: 'indigo', active: true, className: 'text-[oklch(var(--oklch-indigo))]' },
      { tone: 'blue', active: true, className: 'text-[oklch(var(--oklch-blue))]' },
      { tone: 'cyan', active: true, className: 'text-[oklch(var(--oklch-cyan))]' },
      { tone: 'teal', active: true, className: 'text-[oklch(var(--oklch-teal))]' },
      { tone: 'green', active: true, className: 'text-[oklch(var(--oklch-green))]' },
      { tone: 'lime', active: true, className: 'text-[oklch(var(--oklch-lime))]' },
      { tone: 'orange', active: true, className: 'text-[oklch(var(--oklch-orange))]' },
      { tone: 'pink', active: true, className: 'text-[oklch(var(--oklch-pink))]' },
      { tone: 'darkblue', active: true, className: 'text-blue-500' },
    ],
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
    { active: true, tone: 'default', className: 'text-foreground' },
    { active: true, tone: 'violet', className: 'text-[oklch(var(--oklch-violet))]' },
    { active: true, tone: 'indigo', className: 'text-[oklch(var(--oklch-indigo))]' },
    { active: true, tone: 'blue', className: 'text-[oklch(var(--oklch-blue))]' },
    { active: true, tone: 'cyan', className: 'text-[oklch(var(--oklch-cyan))]' },
    { active: true, tone: 'teal', className: 'text-[oklch(var(--oklch-teal))]' },
    { active: true, tone: 'green', className: 'text-[oklch(var(--oklch-green))]' },
    { active: true, tone: 'lime', className: 'text-[oklch(var(--oklch-lime))]' },
    { active: true, tone: 'orange', className: 'text-[oklch(var(--oklch-orange))]' },
    { active: true, tone: 'pink', className: 'text-[oklch(var(--oklch-pink))]' },
    { active: true, tone: 'darkblue', className: 'text-blue-500' },
    { active: false, tone: 'default', className: inactiveToneTextClasses.default },
    { active: false, tone: 'violet', className: inactiveToneTextClasses.violet },
    { active: false, tone: 'indigo', className: inactiveToneTextClasses.indigo },
    { active: false, tone: 'blue', className: inactiveToneTextClasses.blue },
    { active: false, tone: 'cyan', className: inactiveToneTextClasses.cyan },
    { active: false, tone: 'teal', className: inactiveToneTextClasses.teal },
    { active: false, tone: 'green', className: inactiveToneTextClasses.green },
    { active: false, tone: 'lime', className: inactiveToneTextClasses.lime },
    { active: false, tone: 'orange', className: inactiveToneTextClasses.orange },
    { active: false, tone: 'pink', className: inactiveToneTextClasses.pink },
    { active: false, tone: 'darkblue', className: inactiveToneTextClasses.darkblue },
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
    { active: true, tone: 'default', className: 'text-foreground font-medium' },
    { active: true, tone: 'violet', className: 'text-[oklch(var(--oklch-violet))] font-medium' },
    { active: true, tone: 'indigo', className: 'text-[oklch(var(--oklch-indigo))] font-medium' },
    { active: true, tone: 'blue', className: 'text-[oklch(var(--oklch-blue))] font-medium' },
    { active: true, tone: 'cyan', className: 'text-[oklch(var(--oklch-cyan))] font-medium' },
    { active: true, tone: 'teal', className: 'text-[oklch(var(--oklch-teal))] font-medium' },
    { active: true, tone: 'green', className: 'text-[oklch(var(--oklch-green))] font-medium' },
    { active: true, tone: 'lime', className: 'text-[oklch(var(--oklch-lime))] font-medium' },
    { active: true, tone: 'orange', className: 'text-[oklch(var(--oklch-orange))] font-medium' },
    { active: true, tone: 'pink', className: 'text-[oklch(var(--oklch-pink))] font-medium' },
    { active: true, tone: 'darkblue', className: 'text-blue-500 font-medium' },
    { active: false, tone: 'default', className: inactiveToneTextClasses.default },
    { active: false, tone: 'violet', className: inactiveToneTextClasses.violet },
    { active: false, tone: 'indigo', className: inactiveToneTextClasses.indigo },
    { active: false, tone: 'blue', className: inactiveToneTextClasses.blue },
    { active: false, tone: 'cyan', className: inactiveToneTextClasses.cyan },
    { active: false, tone: 'teal', className: inactiveToneTextClasses.teal },
    { active: false, tone: 'green', className: inactiveToneTextClasses.green },
    { active: false, tone: 'lime', className: inactiveToneTextClasses.lime },
    { active: false, tone: 'orange', className: inactiveToneTextClasses.orange },
    { active: false, tone: 'pink', className: inactiveToneTextClasses.pink },
    { active: false, tone: 'darkblue', className: inactiveToneTextClasses.darkblue },
  ],
  defaultVariants: {
    layout: 'default',
    tone: 'default',
    active: false,
  },
})

export type SelectTabsLayoutVariant = VariantProps<typeof selectTabsContainerVariants>['layout']
export type SelectTabsColorVariant = VariantProps<typeof selectTabButtonVariants>['tone']
