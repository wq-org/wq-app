import { cn } from '@/lib/utils'

export type RadioTone =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'darkblue'

type ToneClasses = {
  ring: string
  text: string
  soft: string
  solid: string
}

export const radioToneClasses: Record<RadioTone, ToneClasses> = {
  violet: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-violet))]',
    text: 'text-[oklch(var(--oklch-violet))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-violet)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-violet))]',
  },
  indigo: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-indigo))]',
    text: 'text-[oklch(var(--oklch-indigo))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-indigo)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-indigo))]',
  },
  blue: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-blue))]',
    text: 'text-[oklch(var(--oklch-blue))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-blue)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-blue))]',
  },
  cyan: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-cyan))]',
    text: 'text-[oklch(var(--oklch-cyan))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-cyan)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-cyan))]',
  },
  teal: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-teal))]',
    text: 'text-[oklch(var(--oklch-teal))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-teal)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-teal))]',
  },
  green: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-green))]',
    text: 'text-[oklch(var(--oklch-green))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-green)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-green))]',
  },
  lime: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-lime))]',
    text: 'text-[oklch(var(--oklch-lime))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-lime)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-lime))]',
  },
  orange: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-orange))]',
    text: 'text-[oklch(var(--oklch-orange))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-orange)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-orange))]',
  },
  pink: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-pink))]',
    text: 'text-[oklch(var(--oklch-pink))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-pink)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-pink))]',
  },
  darkblue: {
    ring: 'data-[state=checked]:ring-[oklch(var(--oklch-darkblue))]',
    text: 'text-[oklch(var(--oklch-darkblue))]',
    soft: 'data-[state=checked]:bg-[oklch(var(--oklch-darkblue)/0.12)]',
    solid: 'data-[state=checked]:bg-[oklch(var(--oklch-darkblue))]',
  },
}

export type RadioToneVariant = 'default' | 'soft' | 'solid'

export function getRadioToneClasses(tone: RadioTone, variant: RadioToneVariant) {
  const color = radioToneClasses[tone]

  if (variant === 'solid') {
    return cn(
      color.ring,
      color.solid,
      'data-[state=checked]:border-transparent data-[state=checked]:text-white',
      'data-[state=checked]:[&_svg]:text-white',
      'data-[state=checked]:[&_svg.check-icon]:fill-white',
    )
  }

  if (variant === 'soft') {
    return cn(
      color.ring,
      color.text,
      color.soft,
      'border-transparent bg-muted/40 data-[state=checked]:border-transparent',
      'data-[state=checked]:[&_svg.check-icon]:fill-current',
    )
  }

  return cn(
    color.ring,
    color.text,
    'data-[state=checked]:border-transparent',
    'data-[state=checked]:[&_svg.check-icon]:fill-current',
  )
}

export function getSoftToneRadioItemClasses(tone: RadioTone) {
  const color = radioToneClasses[tone]

  return cn(
    color.text,
    color.ring,
    color.soft,
    'border-transparent bg-muted/40 ring-1 ring-transparent',
    '[&_svg]:fill-current',
    'data-[state=checked]:border-transparent data-[state=checked]:ring-1',
  )
}
