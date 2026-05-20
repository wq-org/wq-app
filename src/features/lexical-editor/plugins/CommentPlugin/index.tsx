import {
  $isMarkNode,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
  type MarkNode,
} from '@lexical/mark'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getNearestNodeFromDOMNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  type LexicalNode,
} from 'lexical'
import { useEffect, useMemo, useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import { $createCommentMarkNode, $isCommentMarkNode } from '../../nodes/CommentMarkNode'
import { OPEN_COMMENT_DIALOG_COMMAND } from '../../commands/commentCommands'
import { CommentDialog } from './CommentDialog'
import { CommentList } from './CommentList'
import type { CommentReply, CommentThread, CommentThreadId } from './comment.types'
import { LessonCommentDetailSheet } from './LessonCommentDetailSheet'

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function createThread(quotedText: string, body: string): CommentThread {
  return {
    id: createId('thr'),
    quotedText,
    body,
    authorId: null,
    createdAt: new Date().toISOString(),
    replies: [],
    resolved: false,
  }
}

function createReply(body: string): CommentReply {
  return {
    id: createId('cmt'),
    body,
    authorId: null,
    createdAt: new Date().toISOString(),
  }
}

function cloneThread(thread: CommentThread): CommentThread {
  return {
    ...thread,
    replies: thread.replies.map((reply) => ({ ...reply })),
  }
}

function areThreadListsEqual(a: CommentThread[], b: CommentThread[]): boolean {
  if (a.length !== b.length) return false
  return a.every((thread, index) => {
    const other = b[index]
    return (
      thread.id === other.id &&
      thread.quotedText === other.quotedText &&
      thread.body === other.body &&
      thread.authorId === other.authorId &&
      thread.createdAt === other.createdAt &&
      thread.resolved === other.resolved &&
      JSON.stringify(thread.replies) === JSON.stringify(other.replies)
    )
  })
}

function toTimestamp(value: string): number {
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : 0
}

function sortThreadsByCreatedAt(threads: CommentThread[]): CommentThread[] {
  return [...threads].sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt))
}

function $visitNodes(node: LexicalNode, visitor: (node: LexicalNode) => void): void {
  visitor(node)
  if ($isElementNode(node)) {
    const children = node.getChildren()
    children.forEach((child) => $visitNodes(child, visitor))
  }
}

function $collectThreadsFromMarks(): CommentThread[] {
  const threadsById = new Map<string, CommentThread>()
  const root = $getRoot()
  $visitNodes(root, (node) => {
    if (!$isCommentMarkNode(node)) return
    node.getIDs().forEach((threadId) => {
      const thread = node.getCommentThread(threadId)
      if (!thread || threadsById.has(threadId)) return
      threadsById.set(threadId, thread)
    })
  })
  return sortThreadsByCreatedAt(Array.from(threadsById.values()))
}

function $findThread(threadId: CommentThreadId): CommentThread | null {
  let thread: CommentThread | null = null
  const root = $getRoot()
  $visitNodes(root, (node) => {
    if (thread || !$isCommentMarkNode(node) || !node.hasID(threadId)) return
    thread = node.getCommentThread(threadId)
  })
  return thread
}

function $upsertThreadOnMarks(thread: CommentThread): void {
  const root = $getRoot()
  $visitNodes(root, (node) => {
    if (!$isCommentMarkNode(node) || !node.hasID(thread.id)) return
    node.setCommentThread(thread.id, thread)
  })
}

function $removeMarkNodeId(threadId: string): void {
  const root = $getRoot()
  const walk = (node: LexicalNode) => {
    if ($isMarkNode(node) && node.hasID(threadId)) {
      if ($isCommentMarkNode(node)) {
        node.removeCommentThread(threadId)
      }
      node.deleteID(threadId)
      if (node.getIDs().length === 0) {
        $unwrapMarkNode(node)
        return
      }
    }
    if ($isElementNode(node)) {
      node.getChildren().forEach(walk)
    }
  }
  walk(root)
}

export function CommentPlugin() {
  const [editor] = useLexicalComposerContext()
  const dialog = useDisclosure()
  const sheet = useDisclosure()
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [pendingQuote, setPendingQuote] = useState('')
  const [selectedThreadId, setSelectedThreadId] = useState<CommentThreadId | null>(null)

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  )

  const { setIsOpen: setIsDialogOpen } = dialog
  const { setIsOpen: setIsSheetOpen } = sheet

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        OPEN_COMMENT_DIALOG_COMMAND,
        () => {
          const captured = editor.read(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection) || selection.isCollapsed()) return null
            return selection.getTextContent().trim()
          })
          if (!captured) return false
          setPendingQuote(captured)
          setIsDialogOpen(true)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          const target = event.target
          if (!(target instanceof Node)) return false
          const threadId = editor.read(() => {
            const node = $getNearestNodeFromDOMNode(target)
            if (!node) return null
            const markAncestor: MarkNode | undefined = $isMarkNode(node)
              ? node
              : (node.getParents().find($isMarkNode) as MarkNode | undefined)
            if (!markAncestor) return null
            const markThreadId = markAncestor.getIDs()[0] ?? null
            if (!markThreadId) return null
            const thread = $findThread(markThreadId)
            return thread ? markThreadId : null
          })
          if (!threadId) return false
          setSelectedThreadId(threadId)
          setIsSheetOpen(true)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        const nextThreads = editorState.read(() => $collectThreadsFromMarks())
        setThreads((previousThreads) => {
          if (areThreadListsEqual(previousThreads, nextThreads)) {
            return previousThreads
          }
          return nextThreads
        })
      }),
    )
  }, [editor, setIsDialogOpen, setIsSheetOpen])

  const handleCancelDialog = () => {
    dialog.onClose()
    setPendingQuote('')
  }

  const handleSubmitNewComment = (body: string) => {
    const thread = createThread(pendingQuote, body)
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      $wrapSelectionInMarkNode(selection, selection.isBackward(), thread.id, (ids) =>
        $createCommentMarkNode(ids),
      )
      $upsertThreadOnMarks(thread)
    })
    setSelectedThreadId(thread.id)
    sheet.onOpen()
    dialog.onClose()
    setPendingQuote('')
  }

  const handleSelectThread = (threadId: CommentThreadId) => {
    setSelectedThreadId(threadId)
    sheet.onOpen()
  }

  const handleCloseSheet = () => {
    sheet.onClose()
    setSelectedThreadId(null)
  }

  const handleReply = (body: string) => {
    if (!selectedThreadId) return
    editor.update(() => {
      const existingThread = $findThread(selectedThreadId)
      if (!existingThread) return
      const nextThread = cloneThread(existingThread)
      nextThread.replies = [...nextThread.replies, createReply(body)]
      $upsertThreadOnMarks(nextThread)
    })
  }

  const handleDeleteThread = () => {
    if (!selectedThread) return
    const threadId = selectedThread.id
    editor.update(() => {
      $removeMarkNodeId(threadId)
    })
    handleCloseSheet()
  }

  return (
    <>
      <CommentDialog
        open={dialog.isOpen}
        quote={pendingQuote}
        onCancel={handleCancelDialog}
        onSubmit={handleSubmitNewComment}
      />
      <LessonCommentDetailSheet
        open={sheet.isOpen}
        thread={selectedThread}
        onClose={handleCloseSheet}
        onReply={handleReply}
        onDelete={handleDeleteThread}
      />
      {threads.length > 0 ? (
        <aside
          aria-label="Comments"
          className="mt-6 rounded-lg border bg-card p-4"
        >
          <h3 className="mb-3 text-sm font-semibold">Comments</h3>
          <CommentList
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
          />
        </aside>
      ) : null}
    </>
  )
}
