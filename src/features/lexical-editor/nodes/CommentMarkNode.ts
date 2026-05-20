import { MarkNode, type SerializedMarkNode } from '@lexical/mark'
import {
  $applyNodeReplacement,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  type Spread,
} from 'lexical'

import type { CommentThread } from '../plugins/CommentPlugin/comment.types'

export type SerializedCommentMarkNode = Spread<
  {
    commentThreads?: Record<string, CommentThread>
  },
  SerializedMarkNode
>

const EMPTY_THREADS: Record<string, CommentThread> = {}

function cloneThread(thread: CommentThread): CommentThread {
  return {
    ...thread,
    replies: thread.replies.map((reply) => ({ ...reply })),
  }
}

function cloneThreads(
  commentThreads: Record<string, CommentThread>,
): Record<string, CommentThread> {
  const next: Record<string, CommentThread> = {}
  Object.entries(commentThreads).forEach(([threadId, thread]) => {
    next[threadId] = cloneThread(thread)
  })
  return next
}

export class CommentMarkNode extends MarkNode {
  __commentThreads: Record<string, CommentThread>

  static getType(): string {
    return 'comment-mark'
  }

  static clone(node: CommentMarkNode): CommentMarkNode {
    return new CommentMarkNode(node.__ids, node.__key, node.__commentThreads)
  }

  static importJSON(serializedNode: SerializedCommentMarkNode): CommentMarkNode {
    return $createCommentMarkNode(serializedNode.ids).updateFromJSON(serializedNode)
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedCommentMarkNode>): this {
    super.updateFromJSON(serializedNode)
    return this.setCommentThreads(serializedNode.commentThreads ?? EMPTY_THREADS)
  }

  exportJSON(): SerializedCommentMarkNode {
    return {
      ...super.exportJSON(),
      commentThreads: this.getCommentThreads(),
    }
  }

  constructor(
    ids: readonly string[] = [],
    key?: NodeKey,
    commentThreads: Record<string, CommentThread> = EMPTY_THREADS,
  ) {
    super(ids, key)
    this.__commentThreads = commentThreads
  }

  getCommentThreads(): Record<string, CommentThread> {
    return cloneThreads(this.getLatest<CommentMarkNode>().__commentThreads)
  }

  getCommentThread(threadId: string): CommentThread | null {
    const thread = this.getLatest<CommentMarkNode>().__commentThreads[threadId]
    return thread ? cloneThread(thread) : null
  }

  setCommentThreads(commentThreads: Record<string, CommentThread>): this {
    const writable = this.getWritable<CommentMarkNode>()
    writable.__commentThreads = cloneThreads(commentThreads)
    return writable
  }

  setCommentThread(threadId: string, thread: CommentThread): this {
    const writable = this.getWritable<CommentMarkNode>()
    writable.__commentThreads = {
      ...writable.__commentThreads,
      [threadId]: cloneThread(thread),
    }
    return writable
  }

  removeCommentThread(threadId: string): this {
    const writable = this.getWritable<CommentMarkNode>()
    if (!(threadId in writable.__commentThreads)) {
      return writable
    }
    const next = { ...writable.__commentThreads }
    delete next[threadId]
    writable.__commentThreads = next
    return writable
  }
}

export function $createCommentMarkNode(
  ids: readonly string[] = [],
  commentThreads: Record<string, CommentThread> = EMPTY_THREADS,
): CommentMarkNode {
  return $applyNodeReplacement(new CommentMarkNode(ids, undefined, commentThreads))
}

export function $isCommentMarkNode(node: LexicalNode | null | undefined): node is CommentMarkNode {
  return node instanceof CommentMarkNode
}
