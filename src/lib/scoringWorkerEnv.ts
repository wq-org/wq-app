export type ScoringWorkerEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SCORING_WORKER_URL?: string
  VITE_GRADING_WORKER_URL?: string
  VITE_SCORING_WORKER_PORT?: string
  DEV?: boolean
}

const DEFAULT_SCORING_WORKER_PORT = '8000'

/** Ensures URL targets `/auto-score` whether the env value is the host root or full prefix. */
export function normalizeScoringWorkerBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (trimmed.endsWith('/auto-score')) return trimmed
  return `${trimmed}/auto-score`
}

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

/** Hostname from `VITE_SUPABASE_URL` — used to detect same-machine worker URLs in dev. */
export function getLocalDevHostname(env: ScoringWorkerEnv): string | null {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  if (!supabaseUrl) return null
  return parseUrl(supabaseUrl)?.hostname ?? null
}

/** Worker shares the Supabase dev host (e.g. both on `127.0.0.1`). */
export function isLocalScoringWorkerUrl(baseUrl: string, env: ScoringWorkerEnv): boolean {
  const localHostname = getLocalDevHostname(env)
  if (!localHostname) return false
  const workerUrl = parseUrl(baseUrl)
  return workerUrl?.hostname === localHostname
}

function resolveExplicitScoringWorkerBaseUrl(env: ScoringWorkerEnv): string | null {
  const configured = env.VITE_SCORING_WORKER_URL?.trim() || env.VITE_GRADING_WORKER_URL?.trim()
  return configured ? normalizeScoringWorkerBaseUrl(configured) : null
}

/** Origin for Vite dev proxy target (no path). */
export function resolveScoringWorkerOrigin(env: ScoringWorkerEnv): string {
  const explicit = resolveExplicitScoringWorkerBaseUrl(env)
  if (explicit) {
    return parseUrl(explicit)!.origin
  }

  const port = env.VITE_SCORING_WORKER_PORT?.trim() || DEFAULT_SCORING_WORKER_PORT
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const supabaseParsed = supabaseUrl ? parseUrl(supabaseUrl) : null
  if (supabaseParsed) {
    return `${supabaseParsed.protocol}//${supabaseParsed.hostname}:${port}`
  }

  return `http://127.0.0.1:${port}`
}

/**
 * Browser fetch base URL. In dev, local worker calls use the Vite proxy (`/api/scoring`)
 * to avoid CORS when the worker host matches `VITE_SUPABASE_URL`.
 */
export function resolveScoringWorkerFetchBaseUrl(env: ScoringWorkerEnv): string {
  const configured = resolveExplicitScoringWorkerBaseUrl(env)
  if (configured) {
    if (env.DEV && isLocalScoringWorkerUrl(configured, env)) {
      return '/api/scoring'
    }
    return configured
  }

  if (env.DEV && getLocalDevHostname(env)) {
    return '/api/scoring'
  }

  return '/api/scoring'
}
