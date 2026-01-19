import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface AnimatedGroupProps {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
}

export function AnimatedGroup({ children, className, variants }: AnimatedGroupProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={variants?.container}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={variants?.item}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
