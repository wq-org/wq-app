/** Normalizes project version for display — invalid or missing values fall back to 1. */
export function resolveGameStudioDisplayVersion(version: number | undefined): number {
  return Number.isFinite(version) && version !== undefined && version > 0 ? version : 1
}
