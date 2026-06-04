/** True on full-page game simulation preview (`/teacher/canvas/:id/preview`). */
export function isGameStudioPreviewPath(pathname: string): boolean {
  return /\/canvas\/[^/]+\/preview$/.test(pathname)
}
