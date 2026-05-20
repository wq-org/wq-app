import { cva } from 'class-variance-authority'

export const scrollDrivenIndexVariants = cva(
  '[--scroll-driven-index-bottom:2rem] [--scroll-driven-index-speed:0.3s] [--scroll-driven-index-trigger-width:190px] [--scroll-driven-index-trigger-height:44px]',
  {
    variants: {
      alignment: {
        left: '',
        center: '',
        right: '',
      },
      tone: {
        default: '',
        muted: '',
      },
    },
    defaultVariants: {
      alignment: 'center',
      tone: 'default',
    },
  },
)

export const scrollDrivenIndexTriggerVariants = cva(
  'scroll-driven-index__trigger fixed z-9999999 cursor-pointer border-0 outline-offset-2',
  {
    variants: {
      tone: {
        default: 'bg-foreground text-background',
        muted: 'bg-muted text-foreground',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
)
