import { cva, type VariantProps } from 'class-variance-authority'

export const imageCarouselItemVariants = cva('group shrink-0 cursor-pointer pl-2 text-left', {
  variants: {
    size: {
      xs: 'w-16',
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-48',
      xl: 'w-64',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const imageCarouselTitleVariants = cva(
  'mt-1 min-w-0 max-w-full truncate font-medium text-foreground',
  {
    variants: {
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type ImageCarouselSize = NonNullable<VariantProps<typeof imageCarouselItemVariants>['size']>
