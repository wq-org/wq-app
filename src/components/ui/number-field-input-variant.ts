import { cva } from 'class-variance-authority'

export const numberFieldInputVariants = cva(
  'w-full min-w-0 flex-1 bg-transparent text-center tabular-nums outline-none',
  {
    variants: {
      size: {
        sm: 'style-vega:px-3 style-vega:py-1 style-maia:px-3 style-maia:py-1 style-nova:px-2.5 style-nova:py-0.5 style-lyra:px-2.5 style-lyra:py-0.5 style-mira:px-2 style-mira:py-0.5',
        default:
          'style-vega:px-3.5 style-vega:py-1.5 style-maia:px-3.5 style-maia:py-1.5 style-nova:px-3 style-nova:py-1 style-lyra:px-3 style-lyra:py-1 style-mira:px-2.5 style-mira:py-0.5',
        lg: 'style-vega:px-4 style-vega:py-2 style-maia:px-4 style-maia:py-2 style-nova:px-3.5 style-nova:py-1.5 style-lyra:px-3.5 style-lyra:py-1.5 style-mira:px-3 style-mira:py-1',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
