import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'

let workerConfigured = false

export function configurePdfJsWorker() {
  if (workerConfigured) return

  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url,
  ).toString()

  workerConfigured = true
}
