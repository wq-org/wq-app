import { isGameStudioPreviewPath } from './isGameStudioPreviewPath'

/** True on full-page game simulation preview and classroom game play routes. */
export function isCommandPaletteHiddenPath(pathname: string): boolean {
  if (isGameStudioPreviewPath(pathname)) return true
  if (/\/game\/[^/]+\/play$/.test(pathname)) return true
  if (/\/published\/game\/[^/]+$/.test(pathname)) return true
  return false
}
