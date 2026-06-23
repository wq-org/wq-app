import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { AgentLesson } from '../types/agent.types'

type AgentLessonListProps = {
  lessons: AgentLesson[]
  onSelectLesson: (lesson: AgentLesson) => void
}

export function AgentLessonList({ lessons, onSelectLesson }: AgentLessonListProps) {
  return (
    <div className="flex flex-col gap-1">
      {lessons.map((lesson) => (
        <Button
          key={lesson.id}
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
          onClick={() => onSelectLesson(lesson)}
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <Text
            as="span"
            variant="body"
            className="min-w-0 truncate text-sm"
          >
            {lesson.title || 'Untitled lesson'}
          </Text>
        </Button>
      ))}
    </div>
  )
}
