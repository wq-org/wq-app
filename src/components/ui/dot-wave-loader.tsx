import React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { dotWaveVariants } from './dot-wave-loader-variant'

const DotWaveLoader: React.FC<VariantProps<typeof dotWaveVariants>> = ({ variant }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={cn(dotWaveVariants({ variant }))}
        style={{ animationDuration: '0.5s' }}
      ></div>
      <div
        className={cn(dotWaveVariants({ variant }), 'delay-150')}
        style={{ animationDuration: '0.5s' }}
      ></div>
      <div
        className={cn(dotWaveVariants({ variant }), 'delay-300')}
        style={{ animationDuration: '0.5s' }}
      ></div>
    </div>
  )
}

export default DotWaveLoader
