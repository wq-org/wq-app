import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  BellElectric,
  Blocks,
  Book,
  Calendar,
  CalendarRange,
  Cloud,
  GraduationCap,
  ListTodo,
  MessageCircle,
  MousePointer2,
  StickyNote,
  UserStar,
  Warehouse,
} from 'lucide-react'

/**
 * Stable icon per catalog key (seed + common names). Unknown keys fall through to substring heuristics, then {@link Blocks}.
 */
const FEATURE_ICON_BY_KEY: Readonly<Record<string, LucideIcon>> = {
  institution: Warehouse,
  student: BellElectric,
  teacher: GraduationCap,
  classroom: Warehouse,
  reward_system: UserStar,
  course: Book,
  game_studio: MousePointer2,
  task: ListTodo,
  calendar: CalendarRange,
  cloud_storage: Cloud,
  note: StickyNote,
  chat: MessageCircle,
  notification: Bell,
  max_teachers: GraduationCap,
  max_students: BellElectric,
  max_classrooms: Warehouse,
  storage_quota_mb: Cloud,
}

function iconFromKeyHeuristic(key: string): LucideIcon | null {
  const k = key.toLowerCase()
  if (k.includes('agenda') || k.includes('timetable')) return Calendar
  if (k.includes('calendar') || k.includes('schedule')) return CalendarRange
  if (k.includes('chat') || k.includes('message')) return MessageCircle
  if (k.includes('course') || k.includes('lesson') || k.includes('learn')) return Book
  if (k.includes('cloud') || k.includes('storage') || k.includes('quota') || k.includes('file'))
    return Cloud
  if (k.includes('game') || k.includes('studio') || k.includes('workflow')) return MousePointer2
  if (k.includes('task') || k.includes('todo') || k.includes('list')) return ListTodo
  if (k.includes('note')) return StickyNote
  if (k.includes('notif') || k.includes('bell')) return Bell
  if (k.includes('reward') || k.includes('star')) return UserStar
  if (k.includes('teacher') || k.includes('faculty')) return GraduationCap
  if (k.includes('student') || k.includes('learner')) return BellElectric
  if (k.includes('class') || k.includes('room') || k.includes('warehouse') || k.includes('org'))
    return Warehouse
  return null
}

export function getFeatureDefinitionIcon(key: string): LucideIcon {
  const exact = FEATURE_ICON_BY_KEY[key]
  if (exact) return exact
  return iconFromKeyHeuristic(key) ?? Blocks
}
