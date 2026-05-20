import { cva } from 'class-variance-authority'

export const scrollDrivenIndexVariants = cva(
  '[--scroll-driven-index-bottom:2rem] [--scroll-driven-index-trigger-height:56px] [--scroll-driven-index-trigger-width:190px] [timeline-scope:--content]',
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
  'fixed bottom-[var(--scroll-driven-index-bottom)] z-[9999999] h-auto min-h-0 w-[var(--scroll-driven-index-trigger-width)] cursor-pointer rounded-[22px] border-0 p-[6px] outline-offset-2 [anchor-name:--scroll-driven-index-opener]',
  {
    variants: {
      alignment: {
        left: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-4',
      },
      tone: {
        default: 'bg-foreground/90 text-background backdrop-blur-md',
        muted: 'bg-muted/80 text-foreground backdrop-blur-md',
      },
    },
    defaultVariants: {
      alignment: 'center',
      tone: 'default',
    },
  },
)

export const scrollDrivenIndexPanelVariants = cva(
  'group fixed bottom-[var(--scroll-driven-index-bottom)] z-[99999999] hidden h-[var(--scroll-driven-index-trigger-height)] max-h-[70vh] w-[var(--scroll-driven-index-trigger-width)] max-w-[calc(100vw-2rem)] overflow-visible rounded-[22px] border-0 bg-transparent p-0 text-foreground transition-[display,overlay,width,height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [inset:unset] [interpolate-size:allow-keywords] [margin:unset] [position-anchor:--scroll-driven-index-opener] [transition-behavior:allow-discrete] backdrop:animate-in backdrop:bg-black/25 backdrop:backdrop-blur-md backdrop:fade-out-0 backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-300 starting:[&:popover-open]:h-[var(--scroll-driven-index-trigger-height)] starting:[&:popover-open]:w-[var(--scroll-driven-index-trigger-width)] starting:[&:popover-open]:backdrop:opacity-0 [&:popover-open]:flex [&:popover-open]:h-[min(28rem,70vh)] [&:popover-open]:w-[min(600px,calc(100vw-2rem))] [&:popover-open]:backdrop:opacity-100',
  {
    variants: {
      alignment: {
        left: 'left-4 backdrop:[mask:linear-gradient(225deg,#0000_0%,#fff_100%)]',
        center:
          'left-1/2 -translate-x-1/2 backdrop:[mask:linear-gradient(180deg,#0000_0%,#fff_100%)]',
        right: 'right-4 backdrop:[mask:linear-gradient(135deg,#0000_0%,#fff_100%)]',
      },
    },
    defaultVariants: {
      alignment: 'center',
    },
  },
)
