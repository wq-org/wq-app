import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { cn } from '@/lib/utils'
import { toastVariants, cancelButtonVariants } from './sonner-variants'

const DEFAULT_DURATION_MS = 3000

export type ToasterComponentProps = ToasterProps & {
  /** Toast visibility duration in milliseconds. Default: 3000 (3 seconds). */
  duration?: number
}

const Toaster = ({ duration = DEFAULT_DURATION_MS, ...props }: ToasterComponentProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      duration={duration}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        duration,
        classNames: {
          toast: cn(toastVariants({ variant: 'default' })),
          title: 'font-semibold',
          description: 'opacity-90',
          actionButton: 'hidden',
          cancelButton: cn(cancelButtonVariants({ canDismiss: false })),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
