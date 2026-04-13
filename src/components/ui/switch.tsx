import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { switchThumbVariants, switchVariants } from './switch-variants'

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>

function Switch({ className, color, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ color, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(switchThumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
