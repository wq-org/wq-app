import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type SparkleButtonHue =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'pink'
  | 'orange'

export type SparkleButtonSize = 'sm' | 'default' | 'lg'

export type SparkleButtonProps = {
  children?: ReactNode
  hue?: SparkleButtonHue
  size?: SparkleButtonSize
  showIcon?: boolean
  particleCount?: number
  className?: string
  style?: CSSProperties
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
