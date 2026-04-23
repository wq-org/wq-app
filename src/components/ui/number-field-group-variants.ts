import { cva } from 'class-variance-authority'

export const numberFieldGroupVariants = cva(
  'relative flex w-full justify-between rounded-lg border border-input px-2 py-1.5 data-disabled:pointer-events-none data-disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-within:has-aria-invalid:border-destructive focus-within:has-aria-invalid:ring-destructive/20 dark:focus-within:has-aria-invalid:ring-destructive/40 style-vega:rounded-lg style-maia:rounded-lg style-nova:rounded-lg style-lyra:rounded-lg style-mira:rounded-lg style-vega:bg-transparent style-vega:dark:bg-input/30 style-maia:bg-input/30 style-nova:bg-transparent style-nova:dark:bg-input/30 style-lyra:bg-transparent style-lyra:dark:bg-input/30 style-mira:bg-input/20 style-mira:dark:bg-input/30 style-vega:shadow-xs style-vega:transition-[color,box-shadow] style-maia:transition-colors style-nova:transition-colors style-lyra:transition-colors style-mira:transition-colors style-vega:focus-within:border-ring style-vega:focus-within:ring-ring/50 style-vega:focus-within:ring-3 style-maia:focus-within:border-ring style-maia:focus-within:ring-ring/50 style-maia:focus-within:ring-[3px] style-nova:focus-within:border-ring style-nova:focus-within:ring-ring/50 style-nova:focus-within:ring-3 style-lyra:focus-within:border-ring style-lyra:focus-within:ring-ring/50 style-lyra:focus-within:ring-1 style-mira:focus-within:border-ring style-mira:focus-within:ring-ring/30 style-mira:focus-within:ring-2',
  {
    variants: {
      size: {
        sm: 'style-vega:h-8 style-vega:text-sm style-maia:h-8 style-maia:text-sm style-nova:h-7 style-nova:text-sm style-lyra:h-7 style-lyra:text-xs style-mira:h-6 style-mira:text-xs/relaxed',
        default:
          'style-vega:h-9 style-vega:text-sm style-maia:h-9 style-maia:text-sm style-nova:h-8 style-nova:text-sm style-lyra:h-8 style-lyra:text-xs style-mira:h-7 style-mira:text-xs/relaxed',
        lg: 'style-vega:h-10 style-vega:text-sm style-maia:h-10 style-maia:text-sm style-nova:h-9 style-nova:text-sm style-lyra:h-9 style-lyra:text-xs style-mira:h-8 style-mira:text-xs/relaxed',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
