import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "rounded-lg border shadow-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-black text-white",
        secondary: "border-border bg-white text-black",
        danger: "border-transparent bg-orange-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const cancelButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      canDismiss: {
        true:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        false: "hidden",
      },
    },
    defaultVariants: {
      canDismiss: false,
    },
  }
)

export type ToastVariants = VariantProps<typeof toastVariants>
export type CancelButtonVariants = VariantProps<typeof cancelButtonVariants>

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
          toast: cn(toastVariants({ variant: "default" })),
          title: "font-semibold",
          description: "opacity-90",
          actionButton: "hidden",
          cancelButton: cn(cancelButtonVariants({ canDismiss: false })),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toastVariants, cancelButtonVariants }
