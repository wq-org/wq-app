import { cva } from 'class-variance-authority'

export const numberFieldButtonVariants = cva(
  'relative flex shrink-0 cursor-pointer items-center justify-center transition-colors pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:bg-accent',
  {
    variants: {
      size: {
        sm: "style-vega:px-2.5 style-maia:px-2.5 style-nova:px-2 style-lyra:px-2 style-mira:px-2 style-vega:[&_svg:not([class*='size-'])]:size-3.5 style-maia:[&_svg:not([class*='size-'])]:size-3.5 style-nova:[&_svg:not([class*='size-'])]:size-3.5 style-lyra:[&_svg:not([class*='size-'])]:size-3.5 style-mira:[&_svg:not([class*='size-'])]:size-3",
        default:
          "style-vega:px-3 style-maia:px-3 style-nova:px-2.5 style-lyra:px-2.5 style-mira:px-2.5 style-vega:[&_svg:not([class*='size-'])]:size-4 style-maia:[&_svg:not([class*='size-'])]:size-4 style-nova:[&_svg:not([class*='size-'])]:size-4 style-lyra:[&_svg:not([class*='size-'])]:size-4 style-mira:[&_svg:not([class*='size-'])]:size-3.5",
        lg: "style-vega:px-3.5 style-maia:px-3.5 style-nova:px-3 style-lyra:px-3 style-mira:px-3 style-vega:[&_svg:not([class*='size-'])]:size-4 style-maia:[&_svg:not([class*='size-'])]:size-4 style-nova:[&_svg:not([class*='size-'])]:size-4 style-lyra:[&_svg:not([class*='size-'])]:size-4 style-mira:[&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
