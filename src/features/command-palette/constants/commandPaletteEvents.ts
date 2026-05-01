/** Dispatched to imperatively open the Command Palette “Add” flow (same as bar Add action). */
export const OPEN_COMMAND_ADD_EVENT = 'wq:open-command-add' as const

export function requestOpenCommandAddDialog(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_ADD_EVENT))
}
