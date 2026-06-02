import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { dotWaveVariants } from './dot-wave-loader-variant'

export type DotWaveLoaderProps = VariantProps<typeof dotWaveVariants> & {
  className?: string
}

export function DotWaveLoader({ variant, className }: DotWaveLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <div
        className={cn(dotWaveVariants({ variant }), 'delay-0')}
        style={{ animationDuration: '0.5s' }}
      />
      <div
        className={cn(dotWaveVariants({ variant }), 'delay-150')}
        style={{ animationDuration: '0.5s' }}
      />
      <div
        className={cn(dotWaveVariants({ variant }), 'delay-300')}
        style={{ animationDuration: '0.5s' }}
      />
    </div>
  )
}

export default DotWaveLoader
