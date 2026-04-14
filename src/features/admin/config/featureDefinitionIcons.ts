import type { LucideIcon } from 'lucide-react'
import {
  BadgeQuestionMark,
  Bell,
  BellElectric,
  Blocks,
  BookOpen,
  Calendar,
  CalendarRange,
  ClipboardPen,
  Gauge,
  Cloud,
  GraduationCap,
  ListTodo,
  MessageCircle,
  Pin,
  SplinePointer,
  StickyNote,
  University,
  UserStar,
  UsersRound,
  Workflow,
} from 'lucide-react'

/**
 * Stable icon per catalog key (seed + common names). Unknown keys fall through to substring heuristics, then {@link Blocks}.
 */
const FEATURE_ICON_BY_KEY: Readonly<Record<string, LucideIcon>> = {
  institution: University,
  student: BellElectric,
  teacher: GraduationCap,
  classroom: ClipboardPen,
  reward_system: UserStar,
  course: BookOpen,
  game_studio: SplinePointer,
  task: ListTodo,
  calendar: CalendarRange,
  cloud_storage: Cloud,
  note: StickyNote,
  chat: MessageCircle,
  notification: Bell,
  max_teachers: Gauge,
  max_students: Gauge,
  max_classrooms: Gauge,
  storage_quota_mb: Gauge,
  deepl: Workflow,
  multiplayer: UsersRound,
  openquestion: BadgeQuestionMark,
  open_question: BadgeQuestionMark,
  image_pin: Pin,
}

function iconFromKeyHeuristic(key: string): LucideIcon | null {
  const k = key.toLowerCase()
  if (k.includes('agenda') || k.includes('timetable')) return Calendar
  if (k.includes('calendar') || k.includes('schedule')) return CalendarRange
  if (k.includes('chat') || k.includes('message')) return MessageCircle
  if (k.includes('course') || k.includes('lesson') || k.includes('learn')) return BookOpen
  if (k.includes('limit') || k.startsWith('max_') || k.includes('quota')) return Gauge
  if (k.includes('cloud') || k.includes('storage') || k.includes('quota') || k.includes('file'))
    return Cloud
  if (k.includes('game') || k.includes('studio')) return SplinePointer
  if (k.includes('workflow') || k.includes('deepl')) return Workflow
  if (k.includes('multi') || k.includes('team') || k.includes('group')) return UsersRound
  if (k.includes('openquestion') || k.includes('open_question') || k.includes('question'))
    return BadgeQuestionMark
  if (k.includes('image') || k.includes('pin')) return Pin
  if (k.includes('task') || k.includes('todo') || k.includes('list')) return ListTodo
  if (k.includes('note')) return StickyNote
  if (k.includes('notif') || k.includes('bell')) return Bell
  if (k.includes('reward') || k.includes('star')) return UserStar
  if (k.includes('teacher') || k.includes('faculty')) return GraduationCap
  if (k.includes('student') || k.includes('learner')) return BellElectric
  if (
    k.includes('institution') ||
    k.includes('university') ||
    k.includes('class') ||
    k.includes('room') ||
    k.includes('warehouse') ||
    k.includes('org')
  )
    return University
  return null
}

export function getFeatureDefinitionIcon(key: string): LucideIcon {
  const exact = FEATURE_ICON_BY_KEY[key]
  if (exact) return exact
  return iconFromKeyHeuristic(key) ?? Blocks
}
