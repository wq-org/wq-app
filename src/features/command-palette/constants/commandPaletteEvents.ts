import type { AddType } from '../types/command-bar.types'

export const OPEN_COMMAND_ADD_EVENT = 'wq:open-command-add' as const

export type OpenCommandAddEventDetail = {
  initialType?: AddType
  /** Required when initialType is 'inviteStudent' — invite is scoped to this classroom. */
  classroomId?: string
}

export function requestOpenCommandAddDialog(detail?: OpenCommandAddEventDetail): void {
  window.dispatchEvent(
    new CustomEvent<OpenCommandAddEventDetail>(OPEN_COMMAND_ADD_EVENT, { detail }),
  )
}

export const OPEN_COMMAND_UPLOAD_EVENT = 'wq:open-command-upload' as const

export function requestOpenCommandUploadDialog(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_UPLOAD_EVENT))
}
