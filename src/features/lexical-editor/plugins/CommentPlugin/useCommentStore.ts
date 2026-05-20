import { useCallback, useState } from 'react'

import type { Comment, CommentThread, CommentThreadId } from './comment.types'

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function useCommentStore() {
  const [threads, setThreads] = useState<CommentThread[]>([])

  const createThread = useCallback((quote: string, body: string): CommentThread => {
    const threadId = createId('thr')
    const comment: Comment = {
      id: createId('cmt'),
      threadId,
      body,
      author: null,
      createdAt: Date.now(),
    }
    const thread: CommentThread = {
      id: threadId,
      quote,
      comments: [comment],
      createdAt: Date.now(),
      resolved: false,
    }
    setThreads((prev) => [...prev, thread])
    return thread
  }, [])

  const addReply = useCallback((threadId: CommentThreadId, body: string): void => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              comments: [
                ...thread.comments,
                {
                  id: createId('cmt'),
                  threadId,
                  body,
                  author: null,
                  createdAt: Date.now(),
                },
              ],
            }
          : thread,
      ),
    )
  }, [])

  const deleteThread = useCallback((threadId: CommentThreadId): void => {
    setThreads((prev) => prev.filter((thread) => thread.id !== threadId))
  }, [])

  return { threads, createThread, addReply, deleteThread }
}
