import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const imagePinVariants = cva(
  'rounded-full border-2 border-white animate-pulse relative',
  {
    variants: {
      variant: {
        default: 'bg-black',
        secondary: 'bg-[#052127]',
        correct: 'bg-blue-400',
        wrong: 'bg-orange-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)


const pingVariants = cva(
  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
  {
    variants: {
      variant: {
        default: 'bg-black',
        secondary: 'bg-[#052127]',
        correct: 'bg-blue-400',
        wrong: 'bg-orange-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface ImagePinProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof imagePinVariants> {
  size?: number
}

export default function ImagePin({ className, variant, size = 24, ...props }: ImagePinProps) {
  return (
    <div
      data-pin
      className={cn(imagePinVariants({ variant }), className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      {...props}
    >
      <span className={cn(pingVariants({ variant }))} />
    </div>
  )
}
