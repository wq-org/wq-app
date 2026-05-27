/** Radix dialog content slot — portaling here keeps floating UI inside the modal hit target. */
const DIALOG_CONTENT_SELECTOR = '[data-slot="dialog-content"]'

/**
 * Prefer the open dialog content so pickers/menus stay clickable in modals.
 * Falls back to `document.body` for full-page editors.
 */
export function resolveLexicalFloatingPortalTarget(anchorElem: HTMLElement): HTMLElement {
  const dialogContent = anchorElem.closest(DIALOG_CONTENT_SELECTOR)
  if (dialogContent instanceof HTMLElement) {
    return dialogContent
  }
  return document.body
}

export function usesViewportFixedPortal(portalTarget: HTMLElement): boolean {
  return portalTarget === document.body
}
