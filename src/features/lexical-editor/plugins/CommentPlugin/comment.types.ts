export type CommentThreadId = string
export type CommentId = string

export type CommentAuthor = {
  id: string
  name: string
}

export type Comment = {
  id: CommentId
  threadId: CommentThreadId
  body: string
  author: CommentAuthor | null
  createdAt: number
}

export type CommentThread = {
  id: CommentThreadId
  quote: string
  comments: Comment[]
  createdAt: number
  resolved: boolean
}

export type CommentFormValues = {
  body: string
}
