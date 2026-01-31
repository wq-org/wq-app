import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOG_COLORS = {
  danger: '#FF6B6B',
  db: '#178582',
  react: '#4F6BFE',
} as const

export type LogColorName = keyof typeof LOG_COLORS

/** Log a message and optional data to the console with a given color (danger, db, react). */
export function logColor(
  message: string,
  data?: unknown,
  color: LogColorName = 'db'
): void {
  const hex = LOG_COLORS[color]
  if (data !== undefined) {
    console.log(`%c ${message}`, `color: ${hex}`, data)
  } else {
    console.log(`%c ${message}`, `color: ${hex}`)
  }
}
