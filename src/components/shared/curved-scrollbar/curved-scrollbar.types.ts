import type { CSSProperties, ImgHTMLAttributes, ReactNode } from 'react'

export type CurvedScrollbarTheme = 'system' | 'light' | 'dark'
export type CurvedScrollbarSize = 'sm' | 'default' | 'lg'

export type CurvedScrollbarProps = {
  children: ReactNode
  theme?: CurvedScrollbarTheme
  enabled?: boolean
  width?: number | string
  height?: number | string
  radius?: number
  scrollPadding?: number
  stroke?: number
  inset?: number
  trail?: number
  thumbSize?: number
  thumbAlpha?: number
  trackAlpha?: number
  color?: string
  size?: CurvedScrollbarSize
  className?: string
  style?: CSSProperties
}

export type CurvedScrollbarViewportProps = {
  children: ReactNode
  className?: string
}

export type CurvedScrollbarHeaderProps = {
  children: ReactNode
  className?: string
}

export type CurvedScrollbarContentProps = {
  children: ReactNode
  className?: string
}

export type CurvedScrollbarFooterProps = {
  children: ReactNode
  className?: string
}

export type CurvedTitleProps = {
  children: ReactNode
  className?: string
}

export type CurvedTextVariant = 'intro' | 'body' | 'footer'

export type CurvedTextProps = {
  children: ReactNode
  variant?: CurvedTextVariant
  className?: string
}

export type CurvedImagePlacement = 'hero' | 'content'

export type CurvedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  placement?: CurvedImagePlacement
}
