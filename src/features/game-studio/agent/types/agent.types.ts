export type AgentMode = 'pdf' | 'lesson' | 'note'

export interface AgentLesson {
  id: string
  title: string
  lexicalState: unknown
  updatedAt: Date
}
