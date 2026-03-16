import { TopicCard } from './TopicCard'
import type { TopicCardProps } from '../types/topic.types'

interface TopicCardListProps {
  topics: TopicCardProps[]
  onTopicView?: (id: string) => void
}

export function TopicCardList({ topics, onTopicView }: TopicCardListProps) {
  return (
    <div className="flex flex-wrap gap-5 animate-in fade-in-0 slide-in-from-bottom-4">
      {topics.map((topic) => {
        const resolvedView = onTopicView ?? topic.onView

        return (
          <div
            key={topic.id}
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            <TopicCard
              {...topic}
              onView={resolvedView}
            />
          </div>
        )
      })}
    </div>
  )
}
