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
  'fixed bottom-[var(--scroll-driven-index-bottom)] z-[2147483000] h-auto min-h-0 w-[var(--scroll-driven-index-trigger-width)] cursor-pointer rounded-full border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-xl outline-offset-2 backdrop-blur-xl transition-all duration-300 ease-in-out [anchor-name:--scroll-driven-index-opener] [isolation:isolate] supports-[backdrop-filter]:bg-popover/90',
  {
    variants: {
      alignment: {
        left: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-4',
      },
      tone: {
        default: '',
        muted: 'text-foreground',
      },
    },
    defaultVariants: {
      alignment: 'center',
      tone: 'default',
    },
  },
)

export const scrollDrivenIndexPanelVariants = cva(
  'group fixed bottom-[var(--scroll-driven-index-bottom)] z-[2147483001] hidden h-[var(--scroll-driven-index-trigger-height)] max-h-[70vh] w-[var(--scroll-driven-index-trigger-width)] max-w-[calc(100vw-2rem)] overflow-visible rounded-[28px] border-0 bg-transparent p-0 text-foreground [isolation:isolate] transition-[display,overlay,width,height,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [inset:unset] [interpolate-size:allow-keywords] [margin:unset] [position-anchor:--scroll-driven-index-opener] [transition-behavior:allow-discrete] backdrop:animate-in backdrop:fade-in-0 backdrop:bg-black/25 backdrop:backdrop-blur-md backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-300 starting:[&:popover-open]:h-[var(--scroll-driven-index-trigger-height)] starting:[&:popover-open]:w-[var(--scroll-driven-index-trigger-width)] starting:[&:popover-open]:rounded-[28px] starting:[&:popover-open]:backdrop:opacity-0 [&:popover-open]:flex [&:popover-open]:h-[min(28rem,70vh)] [&:popover-open]:w-[min(600px,calc(100vw-2rem))] [&:popover-open]:rounded-[2rem] [&:popover-open]:backdrop:opacity-100',
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
