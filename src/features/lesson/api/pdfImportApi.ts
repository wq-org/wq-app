import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'

const PDF_WORKER_URL =
  (import.meta.env.VITE_PDF_WORKER_URL as string | undefined) ?? 'http://localhost:8000'

export type PdfExtractResult = {
  page_count: number
  blocks: Record<string, unknown>[]
}

export async function getPdfSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.cloud)
    .createSignedUrl(storagePath, 60)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Failed to create signed URL')
  }

  return data.signedUrl
}

export async function extractPage(storagePath: string, page: number): Promise<PdfExtractResult> {
  const storageUrl = await getPdfSignedUrl(storagePath)

  const response = await fetch(`${PDF_WORKER_URL}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storage_url: storageUrl, page }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Unknown error')
    throw new Error(`PDF extraction failed (${response.status}): ${detail}`)
  }

  return response.json() as Promise<PdfExtractResult>
}
