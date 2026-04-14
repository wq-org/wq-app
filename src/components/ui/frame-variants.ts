import { cva } from 'class-variance-authority'

export const frameVariants = cva(
  [
    'relative flex flex-col bg-muted/50 gap-0.75 p-0.75 rounded-(--frame-radius)',
    'style-vega:[--frame-radius:var(--radius-xl)] style-nova:[--frame-radius:var(--radius-xl)]',
    'style-lyra:[--frame-radius:var(--radius-none)] style-maia:[--frame-radius:var(--radius-2xl)] style-mira:[--frame-radius:var(--radius-lg)]',
    // Default panel token values — overridden per-variant below
    '[--frame-panel-bg:var(--color-card)] [--frame-panel-border-color:var(--color-border)] [--frame-border-color:var(--color-border)]',
  ],
  {
    variants: {
      variant: {
        default: 'border border-[var(--frame-border-color)] bg-clip-padding',
        inverse:
          '[--frame-panel-bg:color-mix(in_oklch,var(--color-muted)_40%,transparent)] border border-[var(--frame-border-color)] bg-background bg-clip-padding',
        ghost: '',
      },
      spacing: {
        xs: '[--frame-panel-p:--spacing(2)] [--frame-panel-header-px:--spacing(2)] [--frame-panel-header-py:--spacing(1)] [--frame-panel-footer-px:--spacing(2)] [--frame-panel-footer-py:--spacing(1)]',
        sm: '[--frame-panel-p:--spacing(3)] [--frame-panel-header-px:--spacing(3)] [--frame-panel-header-py:--spacing(2)] [--frame-panel-footer-px:--spacing(3)] [--frame-panel-footer-py:--spacing(2)]',
        default:
          '[--frame-panel-p:--spacing(4)] [--frame-panel-header-px:--spacing(4)] [--frame-panel-header-py:--spacing(3)] [--frame-panel-footer-px:--spacing(4)] [--frame-panel-footer-py:--spacing(3)]',
        lg: '[--frame-panel-p:--spacing(5)] [--frame-panel-header-px:--spacing(5)] [--frame-panel-header-py:--spacing(4)] [--frame-panel-footer-px:--spacing(5)] [--frame-panel-footer-py:--spacing(4)]',
      },
      stacked: {
        true: [
          'gap-0 *:has-[+[data-slot=frame-panel]]:rounded-b-none',
          '*:has-[+[data-slot=frame-panel]]:before:hidden',
          '*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:rounded-t-none',
          '*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:border-t-0',
          // No FrameHeader present: first panel sits flush against the outer frame border
          '[&:not(:has([data-slot=frame-panel-header]))_[data-slot=frame-panel]:is(:first-child)]:border-t-0',
        ],
        false: [
          'data-[spacing=sm]:*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-0.5',
          'data-[spacing=default]:*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1',
          'data-[spacing=lg]:*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-2',
        ],
      },
      dense: {
        // Positional rules must stay as parent selectors — cannot be expressed via CSS vars
        true: 'p-0 gap-0 border-[var(--frame-border-color)] [&_[data-slot=frame-panel]]:-mx-px [&_[data-slot=frame-panel]]:before:hidden [&_[data-slot=frame-panel]:last-child]:-mb-px',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'default',
      stacked: false,
      dense: false,
    },
  },
)
