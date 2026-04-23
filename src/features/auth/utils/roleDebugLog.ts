/**
 * Debug logging for role / onboarding flows. Filter DevTools console by `[wq-role]`.
 */
export function logRoleDebug(message: string, details?: Record<string, unknown>): void {
  if (details && Object.keys(details).length > 0) {
    console.log(`[wq-role] ${message}`, details)
  } else {
    console.log(`[wq-role] ${message}`)
  }
}
