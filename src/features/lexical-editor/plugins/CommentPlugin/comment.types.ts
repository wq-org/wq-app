export type CommentThreadId = string
export type CommentId = string

export type CommentReply = {
  id: CommentId
  body: string
  authorId: string | null
  createdAt: string
}

export type CommentThread = {
  id: CommentThreadId
  quotedText: string
  body: string
  authorId: string | null
  createdAt: string
  replies: CommentReply[]
  resolved: boolean
}

export type CommentFormValues = {
  body: string
}
