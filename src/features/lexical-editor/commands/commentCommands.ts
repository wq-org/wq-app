import { createCommand, type LexicalCommand } from 'lexical'

export const OPEN_COMMENT_DIALOG_COMMAND: LexicalCommand<void> = createCommand(
  'OPEN_COMMENT_DIALOG',
)
