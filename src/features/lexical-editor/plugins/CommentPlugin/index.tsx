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

import { OPEN_COMMENT_DIALOG_COMMAND } from '../../commands/commentCommands'
import { CommentDialog } from './CommentDialog'
import { CommentList } from './CommentList'
import type { CommentThreadId } from './comment.types'
import { LessonCommentDetailSheet } from './LessonCommentDetailSheet'
import { useCommentStore } from './useCommentStore'

function $removeMarkNodeId(threadId: string): void {
  const root = $getRoot()
  const walk = (node: LexicalNode) => {
    if ($isMarkNode(node) && node.hasID(threadId)) {
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
  const { threads, createThread, addReply, deleteThread } = useCommentStore()
  const dialog = useDisclosure()
  const sheet = useDisclosure()
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
            return markAncestor.getIDs()[0] ?? null
          })
          if (!threadId) return false
          setSelectedThreadId(threadId)
          setIsSheetOpen(true)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
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
      $wrapSelectionInMarkNode(selection, selection.isBackward(), thread.id)
    })
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
    addReply(selectedThreadId, body)
  }

  const handleDeleteThread = () => {
    if (!selectedThread) return
    const threadId = selectedThread.id
    editor.update(() => {
      $removeMarkNodeId(threadId)
    })
    deleteThread(threadId)
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
