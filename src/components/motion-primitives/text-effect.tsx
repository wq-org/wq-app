import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type TextEffectPreset = 'fade-in' | 'fade-in-blur' | 'slide-up' | 'slide-down'
type TextEffectPer = 'word' | 'char' | 'line'

interface TextEffectProps {
  children: string
  per?: TextEffectPer
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span'
  preset?: TextEffectPreset
  delay?: number
  speedSegment?: number
  className?: string
}

const presetVariants = {
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'fade-in-blur': {
    hidden: { opacity: 0, filter: 'blur(12px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
}

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  preset = 'fade-in',
  delay = 0,
  speedSegment = 0.1,
  className,
}: TextEffectProps) {
  const MotionComponent = motion[as] as typeof motion.div
  const variant = presetVariants[preset]

  const segments =
    per === 'line'
      ? children.split('\n')
      : per === 'word'
        ? children.split(' ')
        : children.split('')

  return (
    <MotionComponent
      className={cn('inline-block', className)}
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: speedSegment,
        delayChildren: delay,
      }}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          className="inline-block whitespace-pre"
          variants={variant}
          transition={{
            type: 'spring',
            bounce: 0.3,
            duration: 0.8,
          }}
        >
          {segment}
          {per !== 'char' && index < segments.length - 1 && (per === 'line' ? <br /> : '\u00A0')}
        </motion.span>
      ))}
    </MotionComponent>
  )
}
