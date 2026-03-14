import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  GraduationCap,
  Library,
  Microscope,
  Music,
  Palette,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import type { IconEntry } from '@/components/shared'

type AuthGridIcon = IconEntry & {
  icon: LucideIcon
}

export const AUTH_GRID_ICONS: AuthGridIcon[] = [
  {
    icon: GraduationCap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: BookOpen,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
  {
    icon: Pencil,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: FlaskConical,
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20',
  },
  {
    icon: Globe,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Calculator,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Music,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  {
    icon: Palette,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  {
    icon: Microscope,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
  },
  {
    icon: Library,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
]
