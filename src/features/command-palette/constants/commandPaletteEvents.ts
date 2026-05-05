import type { AddType } from '../types/command-bar.types'

/** Dispatched to imperatively open the Command Palette “Add” flow (same as bar Add action). */
export const OPEN_COMMAND_ADD_EVENT = 'wq:open-command-add' as const

export type OpenCommandAddEventDetail = {
  initialType?: AddType
}

export function requestOpenCommandAddDialog(detail?: OpenCommandAddEventDetail): void {
  window.dispatchEvent(
    new CustomEvent<OpenCommandAddEventDetail>(OPEN_COMMAND_ADD_EVENT, { detail }),
  )
}
