import { supabase } from '@/lib/supabase'
import type { AgentLesson } from '../types/agent.types'

type LessonAgentRow = {
  id: string
  title: string
  content: unknown
  updated_at: string
}

function toLessonAgentModel(row: LessonAgentRow): AgentLesson {
  return {
    id: row.id,
    title: typeof row.title === 'string' ? row.title : '',
    lexicalState: row.content ?? null,
    updatedAt: new Date(row.updated_at),
  }
}

/** Fetches lessons the current teacher owns (scoped by RLS: topic → course → teacher_id). */
export async function fetchTeacherLessons(): Promise<AgentLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, content, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return ((data ?? []) as LessonAgentRow[]).map(toLessonAgentModel)
}
