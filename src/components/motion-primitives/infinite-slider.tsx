import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InfiniteSliderProps {
  children: React.ReactNode
  speed?: number
  speedOnHover?: number
  gap?: number
  className?: string
}

export function InfiniteSlider({
  children,
  speed = 40,
  speedOnHover = 20,
  gap = 24,
  className,
}: InfiniteSliderProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const childrenArray = React.Children.toArray(children)
  
  // Duplicate children for seamless loop
  const duplicatedChildren = [...childrenArray, ...childrenArray]

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex"
        animate={{
          x: [0, -100 * childrenArray.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: isHovered ? speedOnHover : speed,
            ease: 'linear',
          },
        }}
        style={{ gap: `${gap}px` }}
      >
        {duplicatedChildren.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
