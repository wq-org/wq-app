export type NoteType = 'lesson' | 'personal' | 'shared'

export interface Note {
  id: string
  user_id: string
  title: string
  description: string
  content: unknown
  note_type: NoteType | string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CreateNoteInput {
  userId: string
  title: string
  description: string
  role: string
}
